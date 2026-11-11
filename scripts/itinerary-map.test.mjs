import assert from 'node:assert/strict';
import { test } from 'node:test';

const { isSpecificMapStop, dayDirectionsLinks, mapSearchUrl } =
  await import('../.api-test-dist/src/utils/itinerary-map.js');

const place = (id, title, category = 'activities') => ({ id, title, category });

test('only specific destinations are eligible for map pins', () => {
  assert.equal(isSpecificMapStop(place('1', 'Cầu Rồng')), true);
  assert.equal(isSpecificMapStop(place('2', 'Bà Nà Hills')), true);
  assert.equal(isSpecificMapStop(place('3', 'Mì Quảng', 'food')), false);
  assert.equal(isSpecificMapStop(place('4', 'Di chuyển về khách sạn', 'transport')), false);
  assert.equal(isSpecificMapStop(place('5', 'Quán Mì Quảng Bà Mua', 'food')), true);
  assert.equal(isSpecificMapStop(place('6', 'Nhà hàng hải sản', 'food')), true);
});

test('Google Maps route links preserve order, province and omit generic food', () => {
  const stops = [
    place('1', 'Cầu Rồng'),
    place('2', 'Mì Quảng', 'food'),
    place('3', 'Bà Nà Hills'),
    place('4', 'Bán đảo Sơn Trà'),
  ];
  const links = dayDirectionsLinks(stops, 'TP. Đà Nẵng');
  assert.equal(links.length, 1);
  const url = new URL(links[0].url);
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.pathname, '/maps/dir/');
  assert.ok(url.searchParams.get('origin').includes('Cầu Rồng'));
  assert.ok(url.searchParams.get('destination').includes('Bán đảo Sơn Trà'));
  assert.ok(url.searchParams.get('waypoints').includes('Bà Nà Hills'));
  assert.ok(!links[0].url.includes('Mì+Quảng'));
  assert.equal(links[0].stopIds.join(','), '1,3,4');
  assert.ok(url.searchParams.get('origin').includes('Việt Nam'));
});

test('long daily routes split into overlapping mobile-friendly legs', () => {
  const stops = Array.from({ length: 10 }, (_, i) => place(String(i + 1), 'Địa điểm ' + (i + 1)));
  const links = dayDirectionsLinks(stops, 'Hà Nội');
  assert.equal(links.length, 3);
  assert.deepEqual(links.map(link => link.stopIds), [
    ['1', '2', '3', '4', '5'],
    ['5', '6', '7', '8', '9'],
    ['9', '10'],
  ]);
  assert.equal(dayDirectionsLinks([place('1', 'Mì Quảng', 'food')], 'Đà Nẵng').length, 0);
  assert.ok(mapSearchUrl('Cầu Rồng', 'Đà Nẵng').startsWith('https://www.google.com/maps/search/'));
});
