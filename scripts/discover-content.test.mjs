import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseWikipediaSuggestions, discoverWikipedia } from '../.api-test-dist/api/_lib/discover-content.js';

test('only sourced, province-matching, non-duplicate travel content becomes a pending suggestion', async () => {
  const extract = 'Đây là một địa danh tại tỉnh Thanh Hóa, Việt Nam. '
    + 'Nằm ở Thanh Hóa, khu vực này có giá trị tham quan và cảnh quan thiên nhiên được nhắc tới trong tài liệu du lịch. '.repeat(3);
  const response = { query: { pages: [
    { title: 'Hồ tham quan mới', extract, thumbnail: { source:'https://upload.wikimedia.org/example.jpg' } },
    { title: 'Biển Sầm Sơn', extract }, // Already in the manually authored catalog
    { title: 'Địa danh ở Hà Nội', extract: extract.replaceAll('Thanh Hóa', 'Hà Nội') },
    { title: 'Du lịch Thanh Hóa', extract },
    { title: 'Khu tham quan khác', extract },
  ] } };
  const entries = parseWikipediaSuggestions(response, 'Thanh Hoa', 'places');
  assert.deepEqual(entries.map(x => x.payload.name), ['Hồ tham quan mới','Khu tham quan khác']);
  assert.equal(entries[0].payload.sourceUrl.startsWith('https://vi.wikipedia.org/wiki/'), true);
  assert.equal(entries[0].payload.imageAttribution.includes('giấy phép'), true);
  assert.equal(entries[0].versionId, parseWikipediaSuggestions(response,'Thanh Hoa','places')[0].versionId);
  assert.equal(new Set(entries.map(x=>x.contentId)).size, entries.length);
});

test('Wikipedia is queried only via fixed HTTPS endpoint with identifying user agent and bounded result size', async () => {
  let called = 0;
  const fetcher = async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.hostname, 'vi.wikipedia.org');
    assert.equal(parsed.searchParams.get('gsrlimit'), '12');
    assert.match(options.headers['User-Agent'], /VietnamTravel/);
    called++;
    return Response.json({ query: { pages: [] } });
  };
  const result = await discoverWikipedia('Thanh Hoa','cuisine',fetcher);
  assert.deepEqual(result, []);
  assert.equal(called, 2);
});

test('malformed upstream content never becomes a candidate', () => {
  assert.deepEqual(parseWikipediaSuggestions({ query:{ pages:[{title:'A',extract:'B'}] }},'Ha Noi','places'),[]);
  assert.deepEqual(parseWikipediaSuggestions(null,'Ha Noi','places'),[]);
});
