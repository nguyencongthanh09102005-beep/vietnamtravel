import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { createServer } from 'vite';

const oldUrl = process.env.SUPABASE_URL;
const oldKey = process.env.SUPABASE_ANON_KEY;
// Vite local middleware must not rely on real credentials for smoke tests.
process.env.SUPABASE_URL = '';
process.env.SUPABASE_ANON_KEY = '';

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
  if (oldUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = oldUrl;
  if (oldKey === undefined) delete process.env.SUPABASE_ANON_KEY;
  else process.env.SUPABASE_ANON_KEY = oldKey;
});

test('npm run dev serves auth endpoint without Vercel CLI', async () => {
  const response = await fetch(base + '/api/auth/me');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.configured, false);
});

test('dev API accepts request body and validates it', async () => {
  const response = await fetch(base + '/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: '', password: '' }),
  });
  assert.equal(response.status, 503);
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
