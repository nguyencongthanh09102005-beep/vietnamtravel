import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

// Always isolate integration test data from the user's real SQLite database.
const tempFolder = mkdtempSync(join(tmpdir(), 'vietnamtravel-db-test-'));
process.env.LOCAL_DB_PATH = join(tempFolder, 'data.sqlite');
// Content harvesting must not contact external services or mutate isolated test DB.
process.env.LOCAL_CONTENT_AUTORUN = '0';
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

test('additive travel content tables exist without modifying account data', async () => {
  // The test DB lives in a disposable temp folder; production Turso is never touched.
  const { dbQuery } = await server.ssrLoadModule('/api/_lib/database.ts');
  const rows = await dbQuery("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('travel_content_versions','travel_content_items') ORDER BY name");
  assert.deepEqual(rows.rows.map(row => row.name), ['travel_content_items', 'travel_content_versions']);
  const empty = await dbQuery('SELECT COUNT(*) AS total FROM travel_content_items');
  assert.equal(empty.rows[0].total, 0, 'Existing hard-coded content is not erased or auto-overwritten');
});

test('public discovery API merges approved content, ignores drafts, and retains original records', async () => {
  const legacy = await fetch(base + '/api/content?provinceId=Thanh%20Hoa');
  assert.equal(legacy.status, 200);
  const original = await legacy.json();
  assert.equal(original.source, 'legacy_fallback');
  assert.equal(original.data.data.cuisine.length, 3);
  assert.equal(original.data.data.places.length, 3);
  const invalid = await fetch(base + '/api/content?provinceId=NotAProvince');
  assert.equal(invalid.status, 400);

  const { dbQuery } = await server.ssrLoadModule('/api/_lib/database.ts');
  const now = new Date().toISOString();
  const approved = { name: 'Điểm tham quan kiểm thử', description: 'Thông tin đã qua kiểm chứng.',
    image: 'https://example.org/photo.jpg', detail: 'Thông tin bổ sung.' };
  await dbQuery(`INSERT INTO travel_content_versions
    (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,created_at)
    VALUES (?,?,?,?,?,'verified_external',?,'approved',?)`,
    ['test-v1','test-spot','Thanh Hoa','places',JSON.stringify(approved),'https://example.org/source',now]);
  await dbQuery(`INSERT INTO travel_content_items
    (content_id,province_id,section,current_version_id,updated_at) VALUES (?,?,?,?,?)`,
    ['test-spot','Thanh Hoa','places','test-v1',now]);
  await dbQuery(`INSERT INTO travel_content_versions
    (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,created_at)
    VALUES (?,?,?,?,?,'ai_draft',?,'pending',?)`,
    ['test-v2','test-unreviewed','Thanh Hoa','places',
      JSON.stringify({ name:'Bịa đặt', description:'Không được hiển thị', image:'https://example.org/no.jpg' }),
      'https://example.org/source',now]);
  await dbQuery(`INSERT INTO travel_content_items
    (content_id,province_id,section,current_version_id,updated_at) VALUES (?,?,?,?,?)`,
    ['test-unreviewed','Thanh Hoa','places','test-v2',now]);
  const response = await fetch(base + '/api/content?provinceId=Thanh%20Hoa');
  assert.equal(response.status, 200);
  const dynamic = await response.json();
  assert.equal(dynamic.source, 'approved_database');
  assert.equal(dynamic.data.data.places.length, 4);
  assert.equal(dynamic.data.data.places.at(-1).detail, approved.detail);
  assert.ok(!dynamic.data.data.places.some(x => x.name === 'Bịa đặt'));
  const another = await fetch(base + '/api/content?provinceId=Ha%20Noi');
  assert.equal((await another.json()).data.data.places.length, 2, 'Do not leak content across provinces');
});

test('daily content refresh requires cron secret and never publishes unchecked suggestions', async () => {
  const previousSecret = process.env.CRON_SECRET;
  const originalFetch = globalThis.fetch;
  const { default: cron } = await server.ssrLoadModule('/api/content/refresh.ts');
  const baseUrl = 'https://example.test/api/content/refresh';
  const request = token => new Request(baseUrl, {
    headers: token ? { authorization: 'Bearer ' + token } : {},
  });
  try {
    delete process.env.CRON_SECRET;
    assert.equal((await cron.fetch(request())).status,503);
    process.env.CRON_SECRET = 'test-secret-0123456789-0123456789-abcdef';
    assert.equal((await cron.fetch(request())).status,401);
    globalThis.fetch = async (url, options) => {
      if (String(url).startsWith('https://vi.wikipedia.org/')) {
        assert.match(options.headers['User-Agent'], /VietnamTravel/);
        return Response.json({ query: { pages: [] } });
      }
      return originalFetch(url, options);
    };
    const response = await cron.fetch(request(process.env.CRON_SECRET));
    assert.equal(response.status,200);
    const result = await response.json();
    assert.equal(result.ok, true);
    assert.equal(result.provinces.length,3);
    assert.equal(result.queries,6);
    assert.equal(result.published,0);
    const duplicate = await cron.fetch(request(process.env.CRON_SECRET));
    assert.equal((await duplicate.json()).state,'already_checked');
  } finally {
    globalThis.fetch = originalFetch;
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});

test('draft review is denied without separate administrator authorization', async () => {
  const previous = process.env.CONTENT_REVIEW_SECRET;
  const { default: review } = await server.ssrLoadModule('/api/content/review.ts');
  try {
    delete process.env.CONTENT_REVIEW_SECRET;
    assert.equal((await review.fetch(new Request('https://example.test/api/content/review'))).status,503);
    process.env.CONTENT_REVIEW_SECRET = 'review-only-secret-0123456789-abcdef';
    assert.equal((await review.fetch(new Request('https://example.test/api/content/review'))).status,401);
    assert.equal((await review.fetch(new Request('https://example.test/api/content/review', {
      headers: { authorization: 'Bearer ' + process.env.CONTENT_REVIEW_SECRET },
    }))).status,200);
  } finally {
    if (previous === undefined) delete process.env.CONTENT_REVIEW_SECRET;
    else process.env.CONTENT_REVIEW_SECRET = previous;
  }
});

test('official administration watcher is authorized and preserves map/user data', async () => {
  const previous = process.env.CRON_SECRET;
  const originalFetch = globalThis.fetch;
  const { default: check } = await server.ssrLoadModule('/api/administration/check.ts');
  const officialPage = `<html><body><h1>Danh sách tỉnh thành sau sáp nhập</h1>
  <p>Kể từ năm 2025, cả nước có 34 đơn vị hành chính cấp tỉnh.</p>
  <h2>Chi tiết các tỉnh, thành phố hình thành sau sắp xếp</h2>
  <p>Yên Bái và Lào Cai thành tỉnh mới Lào Cai; Đồng Tháp và Tiền Giang thành Đồng Tháp.</p>
  <h2>Chính quyền địa phương hình thành sau sắp xếp</h2>
  </body></html>`;
  try {
    delete process.env.CRON_SECRET;
    assert.equal((await check.fetch(new Request('https://example.test/api/administration/check'))).status,503);
    process.env.CRON_SECRET='test-secret-0123456789-0123456789-abcdef';
    assert.equal((await check.fetch(new Request('https://example.test/api/administration/check'))).status,401);
    globalThis.fetch=async url => {
      if (String(url).includes('chi-tiet-34-don-vi')) return new Response(officialPage,{status:200});
      if (String(url).endsWith('/sap-nhap.html')) return new Response('<html><body>Danh sách tin</body></html>',{status:200});
      return originalFetch(url);
    };
    const headers={authorization:'Bearer '+process.env.CRON_SECRET};
    const response=await check.fetch(new Request('https://example.test/api/administration/check',{headers}));
    assert.equal(response.status,200);
    const result=await response.json();
    assert.equal(result.observedCount,34);
    assert.equal(result.existingCount,34);
    assert.equal(result.appliedChanges,0);
    const duplicate=await check.fetch(new Request('https://example.test/api/administration/check',{headers}));
    assert.equal((await duplicate.json()).state,'already_checked');
    const aliases=await fetch(base+'/api/administration/aliases');
    assert.equal(aliases.status,200);
    assert.deepEqual((await aliases.json()).aliases,[]);
  } finally {
    globalThis.fetch=originalFetch;
    if (previous===undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET=previous;
  }
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
