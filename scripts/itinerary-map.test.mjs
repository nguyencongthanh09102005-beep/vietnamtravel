import assert from 'node:assert/strict';
import { test } from 'node:test';

const { isSpecificMapStop, dayDirectionsLinks, dayAirDistanceKm, mapSearchUrl } =
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

test('pins improve Google Maps route links and preserve stop order',()=>{
  const stops=[place('a','Cầu Rồng'),place('b','Bà Nà Hills'),place('c','Bán đảo Sơn Trà')];
  const pins=[{id:'a',lat:16.061,lon:108.227,label:'Cầu Rồng'},
    {id:'b',lat:15.996,lon:107.989,label:'Bà Nà Hills'},
    {id:'c',lat:16.102,lon:108.279,label:'Sơn Trà'}];
  const exact=dayDirectionsLinks(stops,'Đà Nẵng',pins);
  const params=new URL(exact[0].url).searchParams;
  assert.equal(params.get('origin'),'16.061000,108.227000');
  assert.equal(params.get('destination'),'16.102000,108.279000');
  assert.equal(params.get('waypoints'),'15.996000,107.989000');
  assert.deepEqual(exact[0].stopIds,['a','b','c']);
  const partial=dayDirectionsLinks(stops,'Đà Nẵng',pins.slice(0,1));
  assert.match(new URL(partial[0].url).searchParams.get('destination'),/Sơn Trà/);
  assert.equal(dayAirDistanceKm(stops,pins.slice(0,2)),null);
  assert.ok(dayAirDistanceKm(stops,pins)>0);
});

test('unverified map distance remains unknown', () => {
  const stops = [place('a', 'Cầu Rồng'), place('b', 'Biển Mỹ Khê')];
  assert.equal(dayAirDistanceKm(stops, []), null);
  assert.equal(dayAirDistanceKm(stops, [{ id: 'a', lat: 16.06, lon: 108.23, label: 'Cầu Rồng' }]), null);
  assert.equal(dayAirDistanceKm([place('a', 'Mì Quảng', 'food'), place('b', 'Chợ Hàn')], []), null);
});
