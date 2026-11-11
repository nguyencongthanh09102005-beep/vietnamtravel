import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

// Always isolate integration test data from the user's real SQLite database.
const tempFolder = mkdtempSync(join(tmpdir(), 'vietnamtravel-db-test-'));
process.env.LOCAL_DB_PATH = join(tempFolder, 'data.sqlite');
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';

const server = await createServer({
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});
await server.listen();
const addr = server.httpServer?.address();
if (!addr || typeof addr === 'string') throw new Error('Missing local Vite server address');
const base = 'http://127.0.0.1:' + addr.port;

after(async () => {
  await server.close();
  rmSync(tempFolder, { recursive: true, force: true });
});

test('npm run dev serves auth endpoint without Vercel CLI', async () => {
  const response = await fetch(base + '/api/auth/me');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.configured, true);
});

test('dev API accepts request body and validates it', async () => {
  const response = await fetch(base + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.length > 0, true);
});

test('dev AI API is routed to the real TypeScript handler', async () => {
  const response = await fetch(base + '/api/ai');
  assert.equal(response.status, 405);
});

test('unknown API path returns JSON 404 rather than Vite index.html', async () => {
  const response = await fetch(base + '/api/not-existing');
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('content-type')?.includes('application/json'), true);
});

test('register/login/profile/travel CRUD/logout all work with local SQLite', async () => {
  const email = 'test-' + Date.now() + '@example.test';
  const password = 'StrongPass12345!';
  const send = (route, method, payload, cookie) => fetch(base + route, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const registered = await send('/api/auth/register', 'POST', {
    email, password, displayName: 'Test Traveler',
  });
  assert.equal(registered.status, 200);
  const info = await registered.json();
  assert.equal(info.user.displayName, 'Test Traveler');
  const cookie = registered.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie?.startsWith('vt_session='));

  const me = await fetch(base + '/api/auth/me', { headers: { cookie } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user.email, email);

  const updated = await send('/api/user-data', 'PATCH', {
    savedProvinces: ['Ha Noi'],
    visitedProvinces: ['Dong Thap'],
    itineraries: [{
      id: 'trip-1', provinceId: 'Ha Noi', title: 'Hà Nội 2 ngày',
      notes: 'Hồ Gươm', createdAt: new Date().toISOString(),
    }],
  }, cookie);
  assert.equal(updated.status, 200);
  const saved = await fetch(base + '/api/user-data', { headers: { cookie } });
  assert.equal(saved.status, 200);
  const travel = (await saved.json()).data;
  assert.deepEqual(travel.savedProvinces, ['Ha Noi']);
  assert.deepEqual(travel.visitedProvinces, ['Dong Thap']);
  assert.equal(travel.itineraries[0].title, 'Hà Nội 2 ngày');

  const profile = await send('/api/auth/profile', 'PATCH', {
    displayName: 'Updated Traveler', avatarUrl: '',
  }, cookie);
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).user.displayName, 'Updated Traveler');

  const wrong = await send('/api/auth/login', 'POST', { email, password: 'WrongPassword' });
  assert.equal(wrong.status, 401);
  const loggedIn = await send('/api/auth/login', 'POST', { email, password });
  assert.equal(loggedIn.status, 200);

  const logout = await send('/api/auth/logout', 'POST', {}, cookie);
  assert.equal(logout.status, 200);
  const afterLogout = await fetch(base + '/api/auth/me', { headers: { cookie } });
  assert.equal((await afterLogout.json()).user, null);
});
