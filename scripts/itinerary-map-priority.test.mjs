import assert from 'node:assert/strict';
import { test } from 'node:test';

const { normalizeMapName, mapQueryKey, matchesMapProvince, matchKnownMapPlace } =
  await import('../.api-test-dist/api/_lib/itinerary-map-priority.js');

test('map-first uses exact named OSM places, not near-misses or generic meals', () => {
  const approved = [{ name: 'Cầu Rồng', latitude: 16.06, longitude: 108.22, source: 'osm_published' }];
  assert.equal(matchKnownMapPlace('cầu rồng', approved)?.name, 'Cầu Rồng');
  assert.equal(matchKnownMapPlace('Cầu Rồng giả', approved), null);
  assert.equal(matchKnownMapPlace('Mì Quảng', approved), null);
  assert.equal(normalizeMapName('TP. Đà Nẵng'), 'da nang');
});

test('only the correct merged province recognizes official old administrative names', () => {
  assert.equal(matchesMapProvince('Da Nang', ['Quảng Nam']), true);
  assert.equal(matchesMapProvince('Can Tho', ['Hậu Giang']), true);
  assert.equal(matchesMapProvince('Ho Chi Minh', ['Bình Dương']), true);
  assert.equal(matchesMapProvince('Da Nang', ['Hà Nội']), false);
  assert.equal(matchesMapProvince('Da Nang', ['TP. Hồ Chí Minh']), false);
  assert.equal(matchesMapProvince('Can Tho', ['Sóc Trăng']), true);
});

test('geocode query hashes are accent-insensitive but partitioned by province', () => {
  assert.equal(mapQueryKey('Da Nang', 'Cầu Rồng'), mapQueryKey('Da Nang', 'cau rong'));
  assert.notEqual(mapQueryKey('Da Nang', 'Cầu Rồng'), mapQueryKey('Ha Noi', 'Cầu Rồng'));
});

test('reviewed Mộc Châu landmarks are real named locations with traceable sources', async () => {
  const { REVIEWED_MAP_LANDMARKS } = await import('../.api-test-dist/src/data/verifiedMapLandmarks.js');
  const sonLa = REVIEWED_MAP_LANDMARKS['Son La'];
  assert.equal(sonLa.length, 4);
  assert.equal(new Set(sonLa.map(x => normalizeMapName(x.name))).size, 4);
  assert.ok(sonLa.every(x => x.latitude >= 20 && x.latitude <= 22 &&
    x.longitude >= 104 && x.longitude <= 106 && x.sourceUrl.startsWith('https://')));
  assert.equal(matchKnownMapPlace('Cầu kính Bạch Long', sonLa)?.name, 'Cầu kính Bạch Long');
  assert.equal(matchKnownMapPlace('Cao nguyên Mộc Châu', sonLa), null);
});

test('map coverage requires distinct and exact approved place names', async () => {
  const { countMapReadyStops } = await import('../.api-test-dist/api/_lib/itinerary-map-priority.js');
  const mapped = [
    { name: 'Thác Dải Yếm', latitude: 20.8129, longitude: 104.5916, source: 'reviewed_reference' },
    { name: 'Cầu kính Bạch Long', latitude: 20.849, longitude: 104.56975, source: 'reviewed_reference' },
  ];
  assert.equal(countMapReadyStops([{ title: 'Thác Dải Yếm' }, { title: 'Cầu kính Bạch Long' }], mapped), 2);
  assert.equal(countMapReadyStops([{ title: 'Thác Dải Yếm' }, { title: 'Thác Dải Yếm' }], mapped), 1);
  assert.equal(countMapReadyStops([{ title: 'Quán ăn bình dân Mộc Châu' }], mapped), 0);
  assert.equal(countMapReadyStops([{ title: 'Cầu kính Bạch Long giả' }], mapped), 0);
});

test('stable place IDs are province-scoped and map names do not become authority', async () => {
  const { stablePlaceId, matchKnownMapPlaceById } =
    await import('../.api-test-dist/api/_lib/itinerary-map-priority.js');
  const id = stablePlaceId('Son La', 'Thác Dải Yếm');
  assert.match(id, /^p_[0-9a-f]{20}$/);
  assert.equal(id, stablePlaceId('Son La', 'thac dai yem'));
  assert.notEqual(id, stablePlaceId('Ha Noi', 'Thác Dải Yếm'));
  const eligible = [{ id, name: 'Thác Dải Yếm', latitude: 20.81, longitude: 104.59, source: 'reviewed_reference' }];
  assert.equal(matchKnownMapPlaceById(id, eligible)?.name, 'Thác Dải Yếm');
  assert.equal(matchKnownMapPlaceById(stablePlaceId('Ha Noi', 'Thác Dải Yếm'), eligible), null);
});

test('grounded AI rejects hallucinated or duplicate IDs and replaces invented labels', async () => {
  const { normalizeGroundedItinerary } =
    await import('../.api-test-dist/api/_lib/grounded-itinerary.js');
  const { stablePlaceId } =
    await import('../.api-test-dist/api/_lib/itinerary-map-priority.js');
  const { parseRequest } = await import('../.api-test-dist/src/utils/itinerary.js');
  const request = parseRequest({
    provinceId: 'Son La', days: 1, partySize: 2, totalBudgetVnd: 1500000, style: 'nature',
    includeArrivalTransport: false, preferences: { notes: '' },
  });
  const id1 = stablePlaceId('Son La', 'Thác Dải Yếm');
  const id2 = stablePlaceId('Son La', 'Cầu kính Bạch Long');
  const places = [
    { id: id1, name: 'Thác Dải Yếm', latitude: 20.81, longitude: 104.59, source: 'reviewed_reference' },
    { id: id2, name: 'Cầu kính Bạch Long', latitude: 20.85, longitude: 104.57, source: 'reviewed_reference' },
  ];
  const stop = (id, placeId) => ({
    id, placeId, period: 'morning', startTime: '08:00', title: 'Quán ăn bình dân Mộc Châu',
    description: 'Tham quan và thưởng thức đặc sản gần đó', estimatedCostVnd: 50000,
    category: 'food', source: 'catalog', latitude: 0, longitude: 0,
  });
  const raw = { title: 'Mộc Châu', schedule: [{ day: 1, stops: [stop('d1s1', id1), stop('d1s2', id2)] }] };
  const plan = normalizeGroundedItinerary(raw, request, places);
  assert.ok(plan);
  assert.deepEqual(plan.schedule[0].stops.map(x => x.title), ['Thác Dải Yếm', 'Cầu kính Bạch Long']);
  assert.deepEqual(plan.schedule[0].stops.map(x => x.placeId), [id1, id2]);
  assert.equal(plan.schedule[0].stops[0].category, 'activities');
  assert.equal(plan.schedule[0].stops[0].latitude, undefined);
  assert.equal(normalizeGroundedItinerary({
    ...raw, schedule: [{ day: 1, stops: [stop('d1s1', id1), stop('d1s2', id1)] }],
  }, request, places), null);
  assert.equal(normalizeGroundedItinerary({
    ...raw, schedule: [{ day: 1, stops: [stop('d1s1', stablePlaceId('Ha Noi', 'Thác Dải Yếm'))] }],
  }, request, places), null);
});

test('Mộc Châu end-to-end grounding contract yields only true map pins even if external maps unavailable', async () => {
  const { normalizeGroundedItinerary } = await import('../.api-test-dist/api/_lib/grounded-itinerary.js');
  const { stablePlaceId, pinForGroundedStop } = await import('../.api-test-dist/api/_lib/itinerary-map-priority.js');
  const { parseRequest, validateStoredPlan } = await import('../.api-test-dist/src/utils/itinerary.js');
  const request = parseRequest({
    provinceId: 'Son La', days: 1, partySize: 2, totalBudgetVnd: 2500000, style: 'nature',
    includeArrivalTransport: false, preferences: { notes: 'Thích Mộc Châu' },
  });
  const places = [
    'Thác Dải Yếm', 'Cầu kính Bạch Long', 'Đồi Chè Trái Tim', 'Ngũ Động Bản Ôn',
  ].map((name, index) => ({
    name, id: stablePlaceId('Son La', name),
    latitude: 20.8 + index * 0.01, longitude: 104.6 + index * 0.01,
    source: 'reviewed_reference',
  }));
  const aiJson = {
    title: 'Mộc Châu', warnings: ['Chi phí ước tính'],
    schedule: [{
      day: 1,
      stops: places.map((place, i) => ({
        id: 'd1s' + (i + 1), placeId: place.id,
        title: 'Quán ăn bình dân Mộc Châu', // malicious / hallucinated AI title ignored
        period: i === 0 ? 'morning' : i === 1 ? 'noon' : i === 2 ? 'afternoon' : 'evening',
        startTime: ['08:00', '11:00', '14:00', '17:00'][i],
        description: 'Tham quan và gợi ý đặc sản gần địa điểm', estimatedCostVnd: 65000,
      })),
    }],
  };
  const plan = normalizeGroundedItinerary(aiJson, request, places);
  assert.ok(plan);
  const savedAndLoaded = validateStoredPlan(JSON.parse(JSON.stringify(plan)));
  const pins = savedAndLoaded.schedule[0].stops.map(stop => pinForGroundedStop(stop, places));
  assert.equal(pins.length, 4);
  assert.ok(pins.every(pin => pin !== null));
  assert.deepEqual(pins.map(x => x.label), places.map(x => x.name));
  assert.equal(savedAndLoaded.schedule[0].stops.some(x => x.title.includes('Quán ăn bình dân')), false);
  const spoofed = { ...aiJson, schedule: [{ day: 1, stops: [
    { ...aiJson.schedule[0].stops[0], placeId: stablePlaceId('Ha Noi', 'Thác Dải Yếm') },
    ...aiJson.schedule[0].stops.slice(1),
  ] }] };
  assert.equal(normalizeGroundedItinerary(spoofed, request, places), null);
  // No Nominatim/Overpass request is used by this map-first path.
  assert.equal(pinForGroundedStop({
    id: 'invalid', placeId: stablePlaceId('Ha Noi', 'Thác Dải Yếm'),
  }, places), null);
});

test('Wikipedia coordinate bootstrap only trusts exact, province-mentioned named articles', async () => {
  const { extractWikipediaCoordinates, wikipediaEligibleNames } =
    await import('../.api-test-dist/api/_lib/wikipedia-geo.js');
  const names = wikipediaEligibleNames('Ho Chi Minh');
  assert.ok(names.includes('Dinh Độc Lập'));
  assert.ok(names.includes('Chợ Bến Thành'));
  const payload = { query: { pages: [
    { pageid: 123, ns: 0, title: 'Dinh Độc Lập', coordinates: [
      { lat: 10.777108, lon: 106.695441, globe: 'earth' },
    ], extract: 'Dinh Độc Lập là di tích lịch sử tại Thành phố Hồ Chí Minh, Việt Nam.' },
    { pageid: 124, ns: 0, title: 'Chợ Bến Thành', coordinates: [
      { lat: 10.77252, lon: 106.69802 },
    ], extract: 'Chợ Bến Thành là một ngôi chợ lớn tại Hà Nội.' },
    { pageid: 125, ns: 0, title: 'Landmark 81', coordinates: [
      { lat: 10.795, lon: 106.722 },
    ], extract: 'Landmark 81 là tòa nhà ở Thành phố Hồ Chí Minh.', pageprops: { disambiguation: '' } },
  ] } };
  const accepted = extractWikipediaCoordinates('Ho Chi Minh', names, payload);
  assert.deepEqual(accepted.map(x => x.name), ['Dinh Độc Lập']);
  assert.equal(accepted[0].latitude, 10.777108);
  assert.match(accepted[0].sourceUrl, /^https:\/\/vi\.wikipedia\.org\/wiki\//);
  assert.equal(extractWikipediaCoordinates('Ha Noi', ['Dinh Độc Lập'], payload).length, 0);
});

test('Wikipedia exact-title source can validate places in officially merged provinces', async () => {
  const { extractWikipediaCoordinates } =
    await import('../.api-test-dist/api/_lib/wikipedia-geo.js');
  const pages = [{ pageid: 100, ns: 0, title: 'Một địa điểm cụ thể',
    extract: 'Di tích nằm tại Quảng Nam, Việt Nam.',
    coordinates: [{ lat: 15.8, lon: 108.1 }],
  }];
  assert.equal(extractWikipediaCoordinates('Da Nang', ['Một địa điểm cụ thể'],
    { query: { pages } }).length, 1);
  assert.equal(extractWikipediaCoordinates('Ha Noi', ['Một địa điểm cụ thể'],
    { query: { pages } }).length, 0);
  assert.equal(extractWikipediaCoordinates('Da Nang', ['Tên khác'],
    { query: { pages } }).length, 0);
});

test('HCMC works from curated map pins without a populated local database', async () => {
  const { REVIEWED_MAP_LANDMARKS } =
    await import('../.api-test-dist/src/data/verifiedMapLandmarks.js');
  const { stablePlaceId, pinForGroundedStop } =
    await import('../.api-test-dist/api/_lib/itinerary-map-priority.js');
  const { normalizeGroundedItinerary } =
    await import('../.api-test-dist/api/_lib/grounded-itinerary.js');
  const { parseRequest, validateStoredPlan } =
    await import('../.api-test-dist/src/utils/itinerary.js');

  const known = REVIEWED_MAP_LANDMARKS['Ho Chi Minh'];
  assert.equal(known.length, 3);
  const places = known.map(p => ({
    ...p, source: 'reviewed_reference', id: stablePlaceId('Ho Chi Minh', p.name),
  }));
  const trip = parseRequest({
    provinceId: 'Ho Chi Minh', days: 3, partySize: 5, totalBudgetVnd: 10000000,
    style: 'nature', includeArrivalTransport: false, preferences: { notes: '' },
  });
  const schedule = [1, 2, 3].map(day => ({
    day, stops: places.map((place, index) => ({
      id: 'd' + day + 's' + (index + 1), placeId: place.id, period: 'afternoon',
      startTime: ['09:00', '12:00', '15:00'][index],
      description: 'Khám phá một điểm đến có tọa độ tham khảo',
      estimatedCostVnd: 100000,
    })),
  }));
  const generated = normalizeGroundedItinerary({ title: 'Khám phá Sài Gòn', schedule }, trip, places);
  assert.ok(generated);
  const reloaded = validateStoredPlan(JSON.parse(JSON.stringify(generated)));
  assert.ok(reloaded);
  for (const day of reloaded.schedule) {
    assert.equal(day.stops.length, 3);
    assert.ok(day.stops.every(stop => pinForGroundedStop(stop, places)));
  }
  assert.deepEqual(reloaded.schedule[0].stops.map(stop => stop.title),
    ['Chợ Bến Thành', 'Dinh Độc Lập', 'Landmark 81']);
});
