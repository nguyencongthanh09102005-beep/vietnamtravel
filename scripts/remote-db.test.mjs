import assert from 'node:assert/strict';
import { after, test } from 'node:test';

const before = {
  url: process.env.TURSO_DATABASE_URL,
  token: process.env.TURSO_AUTH_TOKEN,
  nodeEnv: process.env.NODE_ENV,
};
process.env.TURSO_DATABASE_URL = 'libsql://test-vietnamtravel.turso.io';
process.env.TURSO_AUTH_TOKEN = 'mock-turso-auth';
process.env.NODE_ENV = 'production';

const fetchOriginal = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, options) => {
  assert.equal(String(url), 'https://test-vietnamtravel.turso.io/v2/pipeline');
  const authHeader = new Headers(options.headers).get('Authorization');
  assert.equal(authHeader, 'Bearer mock-turso-auth');
  const body = JSON.parse(options.body);
  const stmt = body.requests[0].stmt;
  assert.equal(body.requests.at(-1).type, 'close');
  calls.push(stmt);
  const select = stmt.sql === 'SELECT ? AS result';
  return Response.json({
    results: [
      {
        type: 'ok',
        response: {
          type: 'execute',
          result: {
            cols: select ? [{ name: 'result' }] : [],
            rows: select ? [[{ type: 'text', value: 'remote-ok' }]] : [],
            affected_row_count: select ? 0 : 1,
          },
        },
        },
      { type: 'ok', response: { type: 'close' } },
    ],
  });
};

const { dbQuery, databaseConfigured } = await import('../.api-test-dist/api/_lib/database.js');

after(() => {
  globalThis.fetch = fetchOriginal;
  for (const [key, value] of Object.entries({
    TURSO_DATABASE_URL: before.url,
    TURSO_AUTH_TOKEN: before.token,
    NODE_ENV: before.nodeEnv,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('Turso Hrana adapter sets HTTPS URL, bearer token, and typed positional args', async () => {
  assert.equal(databaseConfigured(), true);
  const response = await dbQuery('SELECT ? AS result', ['remote-ok']);
  assert.equal(response.rows[0].result, 'remote-ok');
  assert.ok(calls.length >= 6);
  const last = calls.at(-1);
  assert.equal(last.sql, 'SELECT ? AS result');
  assert.deepEqual(last.args, [{ type: 'text', value: 'remote-ok' }]);
});

test('remote SQL mutations report affected rows', async () => {
  const result = await dbQuery('DELETE FROM sessions WHERE expires_at < ?', [1234567]);
  assert.equal(result.changes, 1);
  assert.deepEqual(calls.at(-1).args, [{ type: 'integer', value: '1234567' }]);
});
