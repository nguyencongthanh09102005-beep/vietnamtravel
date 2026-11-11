import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';

const { default: ai } = await import('../.api-test-dist/api/ai.js');
const { default: recover } = await import('../.api-test-dist/api/auth/recover.js');
const { default: userData } = await import('../.api-test-dist/api/user-data.js');
const originalFetch = globalThis.fetch;
const originalEnv = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  GEMINI_FALLBACK_MODEL: process.env.GEMINI_FALLBACK_MODEL,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};

after(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_MODEL = 'gemini-3.5-flash-lite';
  process.env.GEMINI_FALLBACK_MODEL = 'gemini-3.1-flash-lite';
  delete process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  globalThis.fetch = async () => { throw new Error('Unexpected network call'); };
});

function post(body) {
  return new Request('https://example.test/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('AI API rejects unsupported HTTP methods', async () => {
  const response = await ai.fetch(new Request('https://example.test/api/ai'));
  assert.equal(response.status, 405);
});

test('AI API checks province and input types', async () => {
  assert.equal((await ai.fetch(post({ provinceId: 'Unknown', message: 'hello' }))).status, 400);
  assert.equal((await ai.fetch(post({ provinceId: 'Ha Noi', message: { hacked: true } }))).status, 400);
  assert.equal((await ai.fetch(post({ provinceId: 'Ha Noi', message: 'hello', history: [{ text: 'x'.repeat(22000) }] }))).status, 413);
});

test('AI refuses another province without calling external APIs', async () => {
  const response = await ai.fetch(post({ provinceId: 'Ha Noi', message: 'Hãy nói về Đà Nẵng' }));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.match(payload.reply, /chọn tỉnh khác/i);
  assert.deepEqual(payload.placeCards, []);
});

test('AI returns a normal answer and safe map links with mocked provider', async () => {
  let calls = 0;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /generativelanguage\.googleapis\.com/);
    calls++;
    return Response.json({
      candidates: [{ content: { parts: [{ text: 'Hà Nội có Hồ Hoàn Kiếm và Văn Miếu.' }] } }],
    });
  };
  const response = await ai.fetch(post({ provinceId: 'Ha Noi', message: 'Gợi ý địa điểm tham quan' }));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(calls, 1);
  assert.match(payload.reply, /Hồ Hoàn Kiếm/);
  assert.ok(Array.isArray(payload.mapActions));
  assert.ok(payload.mapActions.every((item) => item.url.startsWith('https://www.google.com/maps/')));
});

test('password recovery rejects malformed addresses without contacting Supabase', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-key';
  const response = await recover.fetch(new Request('https://example.test/api/auth/recover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  }));
  assert.equal(response.status, 400);
});

test('travel user data rejects requests without a valid session', async () => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-key';
  const response = await userData.fetch(new Request('https://example.test/api/user-data'));
  assert.equal(response.status, 401);
});
