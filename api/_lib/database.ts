import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type SqlValue = string | number | null;
export type DbRow = Record<string, SqlValue>;
export interface QueryResult { rows: DbRow[]; changes: number; }

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL, avatar_url TEXT, created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS user_travel_data (
    user_id TEXT PRIMARY KEY, saved_provinces TEXT NOT NULL DEFAULT '[]',
    visited_provinces TEXT NOT NULL DEFAULT '[]', ai_chats TEXT NOT NULL DEFAULT '{}',
    itineraries TEXT NOT NULL DEFAULT '[]', updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL,
    consumed_at INTEGER, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    scope TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)',
  `CREATE TABLE IF NOT EXISTS travel_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    province_id TEXT NOT NULL,
    title TEXT NOT NULL,
    days INTEGER NOT NULL CHECK(days BETWEEN 1 AND 14),
    party_size INTEGER NOT NULL CHECK(party_size BETWEEN 1 AND 20),
    budget_vnd INTEGER NOT NULL CHECK(budget_vnd > 0),
    travel_style TEXT NOT NULL,
    plan_json TEXT NOT NULL CHECK(json_valid(plan_json)),
    revision INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  'CREATE INDEX IF NOT EXISTS travel_plans_user_idx ON travel_plans(user_id,updated_at DESC)',
  `CREATE TABLE IF NOT EXISTS place_geocodes (
    query_key TEXT PRIMARY KEY, lat REAL, lon REAL,
    label TEXT NOT NULL, checked_at INTEGER NOT NULL
  )`,
];

const hosted = () => Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
const remoteConfig = () => ({
  url: process.env.TURSO_DATABASE_URL?.trim() ?? '',
  token: process.env.TURSO_AUTH_TOKEN?.trim() ?? '',
});

export function databaseConfigured() {
  const { url, token } = remoteConfig();
  return Boolean(url && token) || !hosted();
}

function remoteEndpoint(url: string) {
  const parsed = new URL(url);
  if (!['libsql:', 'https:'].includes(parsed.protocol)) throw new Error('INVALID_TURSO_URL');
  if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('INVALID_TURSO_URL');
  // URL.protocol cannot reliably switch a non-special "libsql:" scheme to "https:".
  return 'https://' + parsed.host + '/v2/pipeline';
}

function toHrana(value: SqlValue) {
  if (value === null) return { type: 'null' };
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { type: 'integer', value: String(value) }
      : { type: 'float', value };
  }
  return { type: 'text', value };
}

interface HranaValue { type: 'text' | 'integer' | 'float' | 'null' | 'blob'; value?: string | number; }
interface HranaPayload {
  results?: Array<{
    type: 'ok' | 'error';
    response?: {
      type: string;
      result?: { cols: Array<{ name: string | null }>; rows: HranaValue[][]; affected_row_count?: number };
    };
    error?: { message: string };
  }>;
}

async function remoteRaw(sql: string, args: SqlValue[] = []): Promise<QueryResult> {
  const { url, token } = remoteConfig();
  if (!url || !token) throw new Error('REMOTE_DATABASE_NOT_CONFIGURED');
  const response = await fetch(remoteEndpoint(url), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(toHrana), want_rows: true } },
        { type: 'close' },
      ],
    }),
  });
  if (!response.ok) throw new Error(`REMOTE_DATABASE_HTTP_${response.status}`);
  const payload = await response.json() as HranaPayload;
  const result = payload.results?.[0];
  if (!result || result.type !== 'ok' || !result.response?.result) {
    throw new Error('REMOTE_DATABASE_QUERY_FAILED: ' + (result?.error?.message ?? 'Unknown error').slice(0, 160));
  }
  const data = result.response.result;
  const rows = data.rows.map((row) => {
    const obj: DbRow = {};
    row.forEach((cell, index) => {
      const name = data.cols[index]?.name;
      if (!name) return;
      if (cell.type === 'null') obj[name] = null;
      else if (cell.type === 'integer' || cell.type === 'float') obj[name] = Number(cell.value);
      else obj[name] = String(cell.value ?? '');
    });
    return obj;
  });
  return { rows, changes: data.affected_row_count ?? 0 };
}

let localDb: import('node:sqlite').DatabaseSync | null = null;

/**
 * Release the native SQLite file handle on test teardown or local shutdown.
 * Windows does not allow unlinking an SQLite file while DatabaseSync is open.
 * Call only after all requests using the local database have settled.
 */
export function closeLocalDatabase() {
  if (localDb) {
    localDb.close();
    localDb = null;
  }
  ready = undefined;
}

async function localRaw(sql: string, args: SqlValue[] = []): Promise<QueryResult> {
  if (!localDb) {
    const { DatabaseSync } = await import('node:sqlite');
    const filename = resolve(process.env.LOCAL_DB_PATH || '.data/vietnamtravel.sqlite');
    mkdirSync(dirname(filename), { recursive: true });
    localDb = new DatabaseSync(filename);
    localDb.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  }
  const statement = localDb.prepare(sql);
  if (statement.columns().length) {
    const rows = statement.all(...args).map((record) => {
      const row: DbRow = {};
      for (const [key, value] of Object.entries(record)) {
        row[key] = typeof value === 'bigint' ? Number(value) : value as SqlValue;
      }
      return row;
    });
    return { rows, changes: 0 };
  }
  const meta = statement.run(...args);
  return { rows: [], changes: Number(meta.changes) };
}

const raw = (sql: string, args: SqlValue[] = []) =>
  remoteConfig().url || hosted() ? remoteRaw(sql, args) : localRaw(sql, args);

let ready: Promise<void> | undefined;
async function ensureSchema() {
  if (!databaseConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');
  ready ??= (async () => {
    for (const sql of schema) await raw(sql);
  })().catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  await ready;
}

export async function dbQuery(sql: string, args: SqlValue[] = []): Promise<QueryResult> {
  await ensureSchema();
  return raw(sql, args);
}

export async function dbOne(sql: string, args: SqlValue[] = []): Promise<DbRow | null> {
  return (await dbQuery(sql, args)).rows[0] ?? null;
}
