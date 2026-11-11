import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { databaseConfigured, dbOne, dbQuery, type DbRow } from './database.js';

const scrypt = promisify(scryptCallback);
const COOKIE = 'vt_session';
const MONTH = 30 * 24 * 3600;

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}
export interface AuthSession {
  user: AuthUser;
  tokenHash: string;
}

export { databaseConfigured, dbQuery, dbOne };
export function nowSeconds() { return Math.floor(Date.now() / 1000); }
export function sha256(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function makeToken() { return randomBytes(32).toString('base64url'); }
export function makeId() { return randomUUID(); }
export function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
export function validEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function publicUser(row: DbRow): AuthUser {
  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    avatarUrl: row.avatar_url == null ? null : String(row.avatar_url),
    createdAt: String(row.created_at),
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64) as Buffer;
  return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  if (!/^[a-f0-9]{32}$/.test(parts[1]) || !/^[a-f0-9]{128}$/.test(parts[2])) return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = await scrypt(password, Buffer.from(parts[1], 'hex'), 64) as Buffer;
  return timingSafeEqual(actual, expected);
}

function cookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  return encodeURIComponent(name) + '=' + encodeURIComponent(value)
    + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge + secure;
}

export function sessionCookie(token: string) { return cookie(COOKIE, token, MONTH); }
export function clearedCookies() {
  return [
    cookie(COOKIE, '', 0),
    cookie('vt_access_token', '', 0),
    cookie('vt_refresh_token', '', 0),
  ];
}

export function json(data: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const value of cookies) headers.append('Set-Cookie', value);
  return Response.json(data, { status, headers });
}

function findCookie(request: Request, name: string) {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      try { return decodeURIComponent(rest.join('=')); } catch { return ''; }
    }
  }
  return '';
}

export async function createSession(userId: string): Promise<string> {
  const token = makeToken();
  await dbQuery('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [sha256(token), userId, nowSeconds() + MONTH]);
  return token;
}

export async function getRequestAuthSession(request: Request): Promise<AuthSession | null> {
  const token = findCookie(request, COOKIE);
  if (!token || token.length > 128) return null;
  const tokenHash = sha256(token);
  const row = await dbOne(
    `SELECT u.id,u.email,u.display_name,u.avatar_url,u.created_at
      FROM sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=? AND s.expires_at>?`,
    [tokenHash, nowSeconds()],
  );
  return row ? { user: publicUser(row), tokenHash } : null;
}

export async function revokeSession(session: AuthSession | null) {
  if (session) await dbQuery('DELETE FROM sessions WHERE token_hash=?', [session.tokenHash]);
}

/** Shared DB-backed rate limiter, works across Vercel instances. */
export async function withinRateLimit(request: Request, category: string, identity: string, limit: number, windowSeconds: number) {
  const ip = (request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim().slice(0, 80);
  const scope = sha256(category + ':' + ip + ':' + identity.toLowerCase());
  const now = nowSeconds();
  await dbQuery(
    `INSERT INTO rate_limits(scope,attempts,expires_at) VALUES (?,1,?)
      ON CONFLICT(scope) DO UPDATE SET
      attempts=CASE WHEN expires_at<=? THEN 1 ELSE attempts+1 END,
      expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END`,
    [scope, now + windowSeconds, now, now],
  );
  const row = await dbOne('SELECT attempts FROM rate_limits WHERE scope=?', [scope]);
  return Number(row?.attempts ?? limit + 1) <= limit;
}

export function validProfileName(name: string) {
  return name.length >= 2 && name.length <= 80;
}

export function avatarUrlOk(value: string) {
  if (!value) return true;
  if (value.length > 500) return false;
  try { return new URL(value).protocol === 'https:'; }
  catch { return false; }
}
