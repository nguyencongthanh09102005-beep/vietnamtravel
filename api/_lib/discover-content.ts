import { createHash } from 'node:crypto';
import { provinceDetailsCatalog } from '../../src/data/provinceDetailsData.js';
import { HISTORICAL_PROVINCE_ALIASES } from '../../src/data/historicalProvinceAliases.js';
import type { ProvinceId } from '../../src/data/provincesData.js';
import type { CatalogSection } from '../../src/utils/contentArchive.js';

export interface DiscoveryCandidate {
  contentId: string;
  versionId: string;
  provinceId: ProvinceId;
  section: 'places' | 'cuisine';
  sourceRef: string;
  payload: { name: string; description: string; detail: string; image: string; sourceUrl: string; imageAttribution: string; imageLicense?: string; wikidataId?: string; coordinates?: unknown };
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function bareProvinceName(value: string) {
  return value.replace(/^(Tỉnh|TP\.|Thành phố)\s+/i, '').trim();
}
function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
export function parseWikipediaSuggestions(
  raw: unknown, provinceId: ProvinceId, section: 'places' | 'cuisine',
  includeExisting = false,
): DiscoveryCandidate[] {
  const root = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const query = root.query && typeof root.query === 'object' ? root.query as Record<string, unknown> : {};
  const pages = Array.isArray(query.pages) ? query.pages : [];
  const province = bareProvinceName(provinceDetailsCatalog[provinceId].title);
  const provinceNames = [province, ...Object.entries(HISTORICAL_PROVINCE_ALIASES)
    .filter(([,target]) => target === provinceId).map(([old]) => old)].map(normalize);
  const legacy = provinceDetailsCatalog[provinceId].data[section];
  const existing = new Set(legacy.map(item => normalize(item.name)));
  const seen = new Set<string>();
  const candidates: DiscoveryCandidate[] = [];
  for (const rawPage of pages.slice(0, 24)) {
    if (!rawPage || typeof rawPage !== 'object') continue;
    const page = rawPage as Record<string, unknown>;
    const title = typeof page.title === 'string' ? page.title.trim() : '';
    const extract = typeof page.extract === 'string' ? page.extract.replace(/\s+/g, ' ').trim() : '';
    const name = normalize(title);
    if (!title || title.length > 150 || !extract || extract.length < 120 ||
      extract.length > 12000 || !provinceNames.some(name => normalize(extract).includes(name)) ||
      (!includeExisting && existing.has(name)) || seen.has(name) || provinceNames.includes(name) ||
      /^(danh sach|du lich|am thuc|tinh |thanh pho |viet nam |lich su |van hoa )/.test(name)) continue;
    // An actual Wikipedia article is one candidate source, not proof that its
    // content is correct. Never publish it automatically or invent missing data.
    const thumbnail = page.thumbnail && typeof page.thumbnail === 'object'
      ? page.thumbnail as Record<string, unknown> : {};
    const image = typeof thumbnail.source === 'string' &&
      thumbnail.source.startsWith('https://upload.wikimedia.org/')
      ? thumbnail.source : ''; // An unrelated province banner must NEVER represent a specific item.
    const sourceRef = 'https://vi.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
    const payload = {
      name: title,
      description: extract.slice(0, 360),
      detail: extract.slice(0, 1800),
      image,
      sourceUrl: sourceRef,
      imageAttribution: image.startsWith('https://upload.wikimedia.org/')
        ? 'Ảnh Wikimedia: cần xác minh giấy phép và tác giả trước khi xuất bản.'
        : 'Chưa tìm được ảnh có giấy phép phù hợp; hiển thị biểu tượng thay ảnh.',
    };
    const contentId = 'wiki_' + digest(provinceId + '|' + section + '|' + name).slice(0, 32);
    candidates.push({
      contentId,
      versionId: 'wiki_v_' + digest(contentId + JSON.stringify(payload)).slice(0, 40),
      provinceId, section, sourceRef, payload,
    });
    seen.add(name);
    if (candidates.length >= 8) break;
  }
  return candidates;
}

export async function discoverWikipedia(
  provinceId: ProvinceId, section: 'places' | 'cuisine',
  fetcher: typeof fetch = fetch,
  includeExisting = false,
): Promise<DiscoveryCandidate[]> {
  const province = bareProvinceName(provinceDetailsCatalog[provinceId].title);
  const former = Object.entries(HISTORICAL_PROVINCE_ALIASES)
    .filter(([,target]) => target === provinceId).map(([old]) => old);
  const queries = [
    section === 'places' ? 'địa điểm tham quan ' + province : 'đặc sản ' + province,
    section === 'places' ? 'di tích ' + province : 'món ăn ' + province,
    ...former.map(name => section === 'places' ? 'địa điểm tham quan ' + name : 'đặc sản ' + name),
  ].slice(0, 5);
  const seen = new Set<string>();
  const entries: DiscoveryCandidate[] = [];
  let succeeded = 0;
  for (const query of queries) {
    const endpoint = new URL('https://vi.wikipedia.org/w/api.php');
    endpoint.search = new URLSearchParams({
      action: 'query', generator: 'search',
      gsrsearch: query, gsrlimit: '12', prop: 'extracts|pageimages',
      exintro: '1', explaintext: '1', exlimit: 'max',
      pithumbsize: '640', format: 'json', formatversion: '2',
    }).toString();
    try {
      const response = await fetcher(endpoint.toString(), {
        headers: {
          'User-Agent': 'VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; public tourism research)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error('WIKIPEDIA_HTTP_' + response.status);
      succeeded++;
      for (const item of parseWikipediaSuggestions(await response.json() as unknown, provinceId, section, includeExisting)) {
        if (seen.has(item.contentId)) continue;
        seen.add(item.contentId);
        entries.push(item);
        if (entries.length >= 16) return entries;
      }
    } catch (error) {
      console.warn('[Wikipedia discovery] one search failed:', provinceId, section, query, error);
    }
  }
  if (!succeeded) throw new Error('ALL_WIKIPEDIA_SEARCHES_FAILED');
  return entries;
}
