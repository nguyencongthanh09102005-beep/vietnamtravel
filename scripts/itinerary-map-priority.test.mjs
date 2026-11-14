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
  assert.equal(new Set(sonLa.map(x => normalizeMapName(x.name))).size, 3);
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
