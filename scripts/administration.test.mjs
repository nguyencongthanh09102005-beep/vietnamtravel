import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseOfficialAdministrativeSnapshot, parseOfficialProvinceNews,
  OFFICIAL_ADMIN_SNAPSHOT_URL, OFFICIAL_ADMIN_NEWS_URL } from '../.api-test-dist/api/_lib/official-admin.js';
import { HISTORICAL_PROVINCE_ALIASES, resolveHistoricalProvince,
  searchHistoricalProvinces } from '../.api-test-dist/src/data/historicalProvinceAliases.js';
import { provincesData } from '../.api-test-dist/src/data/provincesData.js';

const html = `<html><head><style>body { color: red }</style></head><body>
  <h1>Chi tiết 34 đơn vị hành chính</h1>
  <p>Ngày 12/6/2025, cả nước có 34 đơn vị hành chính cấp tỉnh.</p>
  <h2>Chi tiết các tỉnh, thành phố hình thành sau sắp xếp</h2>
  <p>Sáp nhập Yên Bái vào Lào Cai, tỉnh mới tên Lào Cai, thuộc Việt Nam.</p>
  <h2>Chính quyền địa phương hình thành sau sắp xếp</h2>
  <script>var injected = 'cả nước có 99 đơn vị hành chính cấp tỉnh'</script>
  </body></html>`;
test('official province count is parsed from visible text, not injected scripts', () => {
  const parsed = parseOfficialAdministrativeSnapshot(html);
  assert.equal(parsed.observedCount,34);
  assert.equal(parsed.sourceUrl,OFFICIAL_ADMIN_SNAPSHOT_URL);
  assert.equal(parsed.digest.length,64);
  assert.equal(parseOfficialAdministrativeSnapshot(html.replace('có 34','có 35')).observedCount,35);
  assert.throws(() => parseOfficialAdministrativeSnapshot('<p>Not an official document</p>'));
});

test('new administrative headlines are detected without treating school mergers as province mergers', () => {
  const html = `<a href="/van-ban-sap-nhap-cap-tinh-1192609999.htm">Nghị quyết sắp nhập các tỉnh, thành phố</a>
  <a href="/sap-nhap-truong-hoc-119260123.htm">Sáp nhập các trường học</a>
  <a href="https://evil.example/sap-nhap-tinh-123.htm">Sáp nhập tỉnh bên ngoài</a>`;
  const results = parseOfficialProvinceNews(html);
  assert.equal(results.length,1);
  assert.equal(results[0].url,'https://xaydungchinhsach.chinhphu.vn/van-ban-sap-nhap-cap-tinh-1192609999.htm');
});

test('2025 merger aliases preserve old provincial names without altering current province IDs', () => {
  assert.equal(Object.keys(HISTORICAL_PROVINCE_ALIASES).length,29);
  assert.ok(Object.values(HISTORICAL_PROVINCE_ALIASES).every(id=>id in provincesData));
  assert.equal(resolveHistoricalProvince('Hà Giang'),'Tuyen Quang');
  assert.equal(resolveHistoricalProvince('Bà Rịa - Vũng Tàu'),'Ho Chi Minh');
  assert.equal(resolveHistoricalProvince('Ba Ria Vung Tau'),'Ho Chi Minh');
  assert.equal(resolveHistoricalProvince('Tiền Giang'),'Dong Thap');
  assert.equal(resolveHistoricalProvince('Dong Thap'),'Dong Thap');
  assert.equal(resolveHistoricalProvince('Unknown'),null);
  assert.equal(searchHistoricalProvinces('Dong Thap','Tiền Giang'),true);
  assert.equal(searchHistoricalProvinces('Lam Dong','Tiền Giang'),false);
  assert.equal(Object.keys(provincesData).length,36);
});
