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
  // Native DatabaseSync retains an open handle after Vite's request handler
  // finishes. On Windows that handle must be closed before deleting temp DB.
  // Load the same SSR module instance used by the local API middleware.
  try {
    const { closeLocalDatabase } = await server.ssrLoadModule('/api/_lib/database.ts');
    closeLocalDatabase();
  } finally {
    await server.close();
  }
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


test('AI planner generates, saves, edits, regenerates a day, and enforces user isolation', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'fake-test-key-only';
  let secondDay = false;
  const generated = () => ({
    title: 'Đà Nẵng 3 ngày khám phá ẩm thực',
    warnings: ['Chi phí chỉ là ước tính.'],
    schedule: [1,2,3].map(day => ({
      day,
      stops: [
        {
          id: 'd' + day + 's1', period: 'morning', startTime: '08:00',
          title: day === 2 && secondDay ? 'Bánh canh' : 'Mì Quảng',
          description: 'Đặc sản địa phương',
          estimatedCostVnd: 140000, category: 'food', source: 'ai_suggestion',
        },
        {
          id: 'd' + day + 's2', period: 'noon', startTime: '12:00',
          title: 'Bánh tráng cuốn thịt heo', description: 'Món địa phương',
          estimatedCostVnd: 180000, category: 'food', source: 'ai_suggestion',
        },
      ],
    })),
  });
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('generativelanguage.googleapis.com')) {
      assert.equal(new Headers(options.headers).get('x-goog-api-key'), 'fake-test-key-only');
      return Response.json({
        candidates: [{ content: { parts: [{ text: JSON.stringify(generated()) }] } }],
      });
    }
    return originalFetch(url, options);
  };

  const send = (route, method, payload, cookie) => fetch(base + route, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const trip = {
    provinceId: 'Da Nang', days: 3, partySize: 2, totalBudgetVnd: 3000000,
    style: 'food', startDate: null, includeArrivalTransport: false,
    preferences: { preferAffordablePlaces: true, minimizeTravel: true, notes: '' },
  };
  try {
    const bad = await send('/api/itineraries/generate', 'POST', { ...trip, days: 24 });
    assert.equal(bad.status, 400);

    const response = await send('/api/itineraries/generate', 'POST', trip);
    assert.equal(response.status, 200);
    const output = await response.json();
    assert.equal(output.plan.schedule.length, 3);
    assert.equal(output.plan.budgetBreakdown.lodgingVnd, 900000);
    assert.equal(output.plan.style, 'food');
    assert.equal(output.plan.partySize, 2);

    const anonymous = await fetch(base + '/api/itineraries');
    assert.equal(anonymous.status, 401);

    const registration = await send('/api/auth/register', 'POST', {
      email: 'planner-a-' + Date.now() + '@example.test',
      password: 'PlanTest123456!',
      displayName: 'Planner User A',
    });
    assert.equal(registration.status, 200);
    const cookie = registration.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie);

    const saved = await send('/api/itineraries', 'POST', { plan: output.plan }, cookie);
    assert.equal(saved.status, 201);
    const item = (await saved.json()).item;
    assert.equal(item.revision, 1);
    assert.equal(item.plan.schedule.length, 3);

    // The "Hành trình của tôi" UI displays both data sources without moving
    // or erasing legacy note itineraries from user_travel_data.
    const noteItinerary = {
      id: 'legacy-trip-note', provinceId: 'Da Nang', title: 'Ghi chú Đà Nẵng',
      notes: 'Một lịch trình ghi chú cũ', createdAt: new Date().toISOString(),
    };
    const savedNotes = await send('/api/user-data', 'PATCH', {
      itineraries: [noteItinerary],
    }, cookie);
    assert.equal(savedNotes.status, 200);
    assert.equal((await savedNotes.json()).data.itineraries.length, 1);

    const list = await fetch(base + '/api/itineraries', { headers: { cookie } });
    assert.equal(list.status, 200);
    const structuredPlans = (await list.json()).items;
    assert.equal(structuredPlans.length, 1);
    assert.equal(structuredPlans[0].id, item.id);
    assert.equal(structuredPlans[0].plan.title, output.plan.title);

    const legacyList = await fetch(base + '/api/user-data', { headers: { cookie } });
    assert.equal(legacyList.status, 200);
    assert.equal((await legacyList.json()).data.itineraries[0].id, noteItinerary.id);

    secondDay = true;
    const replacement = await send('/api/itineraries/generate', 'POST', {
      ...trip, regenerateDay: 2, currentPlan: output.plan,
    });
    assert.equal(replacement.status, 200);
    const revised = (await replacement.json()).plan;
    assert.equal(revised.schedule[0].stops[0].title, 'Mì Quảng');
    assert.equal(revised.schedule[1].stops[0].title, 'Bánh canh');
    assert.equal(revised.schedule[2].stops[0].title, 'Mì Quảng');

    const patched = await send('/api/itineraries', 'PATCH', {
      id: item.id, revision: 1, plan: revised,
    }, cookie);
    assert.equal(patched.status, 200);
    assert.equal((await patched.json()).item.revision, 2);

    const stale = await send('/api/itineraries', 'PATCH', {
      id: item.id, revision: 1, plan: output.plan,
    }, cookie);
    assert.equal(stale.status, 409);

    const secondUser = await send('/api/auth/register', 'POST', {
      email: 'planner-b-' + Date.now() + '@example.test',
      password: 'PlanTest123456!',
      displayName: 'Planner User B',
    });
    assert.equal(secondUser.status, 200);
    const cookieB = secondUser.headers.get('set-cookie')?.split(';')[0];
    const otherList = await fetch(base + '/api/itineraries', { headers: { cookie: cookieB } });
    assert.deepEqual((await otherList.json()).items, []);
    const foreignDelete = await fetch(base + '/api/itineraries?id=' + item.id, {
      method: 'DELETE', headers: { cookie: cookieB },
    });
    assert.equal(foreignDelete.status, 404);

    const removed = await fetch(base + '/api/itineraries?id=' + item.id, {
      method: 'DELETE', headers: { cookie },
    });
    assert.equal(removed.status, 200);
    const empty = await fetch(base + '/api/itineraries', { headers: { cookie } });
    assert.deepEqual((await empty.json()).items, []);
    const notesStillSaved = await fetch(base + '/api/user-data', { headers: { cookie } });
    assert.equal(notesStillSaved.status, 200);
    assert.equal((await notesStillSaved.json()).data.itineraries[0].id, noteItinerary.id);
    const notesOtherAccount = await fetch(base + '/api/user-data', { headers: { cookie: cookieB } });
    assert.equal(notesOtherAccount.status, 200);
    assert.deepEqual((await notesOtherAccount.json()).data.itineraries, []);
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});


test('day map API geocodes a specific landmark once and reuses the SQLite cache', async () => {
  const originalFetch = globalThis.fetch;
  let externalCalls = 0;
  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('https://nominatim.openstreetmap.org/search?')) {
      externalCalls++;
      const search = new URL(String(input)).searchParams;
      assert.equal(search.get('accept-language'), 'vi');
      if (search.get('q')?.includes('Bà Nà Hills')) {
        // Wrong-province result followed by a generic city center fallback:
        // neither is a verified pin for this stop.
        return Response.json([
          { lat: '21.028', lon: '105.854', display_name: 'Bà Nà Hills, Hà Nội, Việt Nam',
            address: { country_code: 'vn', city: 'Hà Nội' } },
          { lat: '16.054', lon: '108.202', display_name: 'Đà Nẵng, Việt Nam', type: 'administrative',
            address: { country_code: 'vn', city: 'Đà Nẵng' } },
        ]);
      }
      return Response.json([{
        lat: '16.061', lon: '108.227',
        display_name: 'Cầu Rồng, Đà Nẵng, Việt Nam',
        address: { country_code: 'vn', city: 'Đà Nẵng' },
      }]);
    }
    return originalFetch(input, init);
  };
  const call = (stops) => fetch(base + '/api/itineraries/locations', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ provinceId: 'Da Nang', stops }),
  });
  try {
    const invalid = await call([{ id: '../bad', title: 'Cầu Rồng', category: 'activities' }]);
    assert.equal(invalid.status, 400);
    const stop = { id: 'cau-rong', title: 'Cầu Rồng', category: 'activities' };
    const fresh = await call([stop]);
    assert.equal(fresh.status, 200);
    const first = await fresh.json();
    assert.equal(first.pending, false);
    assert.equal(first.points.length, 1);
    assert.equal(first.points[0].id, stop.id);
    assert.equal(first.points[0].lat, 16.061);
    const cached = await call([stop]);
    assert.equal(cached.status, 200);
    assert.equal((await cached.json()).points.length, 1);
    assert.equal(externalCalls, 1, 'A cached location must not call the public geocoder twice');
    const genericFood = await call([{ id: 'dish', title: 'Mì Quảng', category: 'food' }]);
    assert.equal(genericFood.status, 200);
    assert.deepEqual((await genericFood.json()).points, []);
    assert.equal(externalCalls, 1, 'A generic dish is not a geographic location');

    // The backend must not place a pin in another province or at a generic city center.
    // Wait for the globally shared 1.6-second Nominatim throttle before the next lookup.
    await new Promise(resolve => setTimeout(resolve, 1750));
    const mismatch = { id: 'ba-na', title: 'Bà Nà Hills', category: 'activities' };
    const unmatched = await call([mismatch]);
    assert.equal(unmatched.status, 200);
    assert.deepEqual((await unmatched.json()).points, []);
    assert.equal(externalCalls, 2);
    const cachedMiss = await call([mismatch]);
    assert.equal(cachedMiss.status, 200);
    assert.deepEqual((await cachedMiss.json()).points, []);
    assert.equal(externalCalls, 2, 'A confirmed miss should be cached instead of repeatedly querying Nominatim');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
