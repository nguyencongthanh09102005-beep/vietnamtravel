import assert from 'node:assert/strict';
import { test } from 'node:test';
import { archiveLegacyCatalog, restoreLegacyCatalog, LEGACY_CONTENT_SOURCE } from '../.api-test-dist/src/utils/contentArchive.js';
import { provinceDetailsCatalog } from '../.api-test-dist/src/data/provinceDetailsData.js';
import { provincesData } from '../.api-test-dist/src/data/provincesData.js';

test('manual catalog is preserved exactly in a reversible content archive', () => {
  const snapshot = archiveLegacyCatalog();
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.source, LEGACY_CONTENT_SOURCE);
  assert.deepEqual(restoreLegacyCatalog(snapshot), provinceDetailsCatalog);
  assert.deepEqual(archiveLegacyCatalog(), snapshot, 'IDs and archive structure must be deterministic');
  assert.equal(snapshot.records.filter(item => item.section === 'overview').length,
    Object.keys(provincesData).length);
  assert.ok(snapshot.records.some(item => item.section === 'places'));
  assert.ok(snapshot.records.some(item => item.section === 'cuisine'));
  assert.ok(snapshot.records.some(item => item.section === 'history'));
  assert.equal(new Set(snapshot.records.map(item => item.id)).size, snapshot.records.length);
  assert.ok(snapshot.records.every(item => item.origin === 'legacy_manual' &&
    item.editorialStatus === 'published' && item.sourceFile === LEGACY_CONTENT_SOURCE));
});

test('exported catalog preserves image links, historical events and source citations', () => {
  const snapshot = archiveLegacyCatalog();
  const roundTrip = restoreLegacyCatalog(JSON.parse(JSON.stringify(snapshot)));
  assert.deepEqual(roundTrip, provinceDetailsCatalog);
  const haNoi = roundTrip['Ha Noi'];
  assert.equal(haNoi.data.places[0].name, 'Hồ Hoàn Kiếm');
  assert.equal(haNoi.data.places[0].image, provinceDetailsCatalog['Ha Noi'].data.places[0].image);
  assert.ok(haNoi.data.history.some(event => event.year === '1010'));
  const thanhHoa = roundTrip['Thanh Hoa'];
  assert.deepEqual(thanhHoa.data.cuisine, provinceDetailsCatalog['Thanh Hoa'].data.cuisine);
});

test('duplicate content names remain independent records, never dropped', () => {
  const fork = structuredClone(provinceDetailsCatalog);
  fork['Ha Noi'].data.places.push({ ...fork['Ha Noi'].data.places[0] });
  const snapshot = archiveLegacyCatalog(fork);
  const places = snapshot.records.filter(record => record.provinceId === 'Ha Noi' && record.section === 'places');
  assert.equal(new Set(places.map(record => record.id)).size, places.length);
  assert.equal(restoreLegacyCatalog(snapshot)['Ha Noi'].data.places.length, 3);
});

test('invalid archive versions and missing provinces cannot be silently restored', () => {
  const snapshot = archiveLegacyCatalog();
  assert.throws(() => restoreLegacyCatalog({ ...snapshot, schemaVersion: 999 }), /Unsupported/);
  assert.throws(() => restoreLegacyCatalog({ ...snapshot,
    records: snapshot.records.filter(record => record.provinceId !== 'Ha Noi') }), /Missing province/);
});
