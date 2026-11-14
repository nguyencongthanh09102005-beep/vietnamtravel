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
