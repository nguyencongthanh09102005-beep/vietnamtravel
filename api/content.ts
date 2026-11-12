import { dbQuery, json } from './_lib/auth.js';
import { provinceDetailsCatalog, type ProvinceDetailsCatalogItem } from '../src/data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../src/data/provincesData.js';
import { archiveLegacyCatalog, type CatalogSection } from '../src/utils/contentArchive.js';

const legacyRows = archiveLegacyCatalog().records;
const legacyById = new Map(legacyRows.map(row => [row.id, row]));

function validImage(value: unknown): value is string {
  return typeof value === 'string' && value.length < 1600 &&
    (value.startsWith('/') && !value.startsWith('//') || /^https:\/\//.test(value));
}
function validItem(value: unknown): value is { name: string; description: string; image: string; [key: string]: unknown } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const x = value as Record<string, unknown>;
  return typeof x.name === 'string' && x.name.trim().length > 1 && x.name.length <= 180
    && typeof x.description === 'string' && x.description.trim().length > 0 && x.description.length <= 5000
    && (validImage(x.image) || (x.image === '' && typeof x.wikidataId === 'string' && /^Q\d+$/.test(x.wikidataId) && typeof x.sourceUrl === 'string' && x.sourceUrl.startsWith('https://vi.wikipedia.org/wiki/'))) && Object.keys(x).length <= 20;
}
function validHistory(value: unknown): value is { year: string; event: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const x = value as Record<string, unknown>;
  return typeof x.year === 'string' && x.year.length > 0 && x.year.length <= 80
    && typeof x.event === 'string' && x.event.length > 0 && x.event.length <= 2000;
}
function safeJson(value: unknown) {
  try { return JSON.parse(String(value)) as unknown; } catch { return null; }
}
function safeOverview(value: unknown): value is {
  title: string; banner: string;
  overview: ProvinceDetailsCatalogItem['data']['overview'];
  administrativeSource?: ProvinceDetailsCatalogItem['administrativeSource'];
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const x = value as Record<string, unknown>;
  const overview = x.overview as Record<string, unknown> | null;
  return typeof x.title === 'string' && x.title.trim().length > 0 && x.title.length <= 120
    && validImage(x.banner) && Boolean(overview) && typeof overview?.description === 'string'
    && overview.description.length <= 8000 && Array.isArray(overview.stats)
    && overview.stats.length <= 12 && overview.stats.every((stat: unknown) =>
      !!stat && typeof stat === 'object' && typeof (stat as { label?: unknown }).label === 'string'
      && typeof (stat as { value?: unknown }).value === 'string');
}

export function mergeVerifiedContent(
  provinceId: ProvinceId,
  entries: Array<Record<string, unknown>>,
): ProvinceDetailsCatalogItem {
  const base = provinceDetailsCatalog[provinceId];
  // A fresh copy avoids mutating the data authored by the original developer.
  const result: ProvinceDetailsCatalogItem = structuredClone(base);
  for (const row of entries) {
    const section = row.section as CatalogSection;
    if (!['overview', 'history', 'places', 'cuisine'].includes(section)) continue;
    const contentId = String(row.content_id);
    const old = legacyById.get(contentId);
    if (old && (old.provinceId !== provinceId || old.section !== section)) continue;
    const value = safeJson(row.payload_json);
    if (section === 'overview' && safeOverview(value)) {
      result.title = value.title;
      result.banner = value.banner;
      result.data.overview = value.overview;
      if (value.administrativeSource) result.administrativeSource = value.administrativeSource;
    } else if (section === 'history' && validHistory(value)) {
      if (old) result.data.history[old.position] = value;
      else if (!result.data.history.some(x => x.year === value.year && x.event === value.event)) result.data.history.push(value);
    } else if (section === 'places' && validItem(value)) {
      if (old) result.data.places[old.position] = value;
      else if (!result.data.places.some(x => x.name.trim().toLowerCase() === value.name.trim().toLowerCase())) result.data.places.push(value);
    } else if (section === 'cuisine' && validItem(value)) {
      if (old) result.data.cuisine[old.position] = value;
      else if (!result.data.cuisine.some(x => x.name.trim().toLowerCase() === value.name.trim().toLowerCase())) result.data.cuisine.push(value);
    }
  }
  return result;
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    const provinceId = new URL(request.url).searchParams.get('provinceId') ?? '';
    if (!Object.prototype.hasOwnProperty.call(provincesData, provinceId)) {
      return json({ error: 'Tỉnh thành không hợp lệ.' }, 400);
    }
    try {
      const rows = await dbQuery(
        `SELECT i.content_id,i.section,v.payload_json FROM travel_content_items i
        JOIN travel_content_versions v ON v.version_id=i.current_version_id
        WHERE i.province_id=? AND v.reviewed_status='approved' AND v.province_id=i.province_id
          AND v.section=i.section AND v.content_id=i.content_id
        ORDER BY i.content_id LIMIT 200`,
        [provinceId],
      );
      const data = mergeVerifiedContent(provinceId as ProvinceId, rows.rows);
      const response = json({ provinceId, data, source: rows.rows.length ? 'approved_database' : 'legacy_fallback' });
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      return response;
    } catch (error) {
      console.warn('[content] database unavailable, using original catalog', error);
      const response = json({ provinceId, data: provinceDetailsCatalog[provinceId as ProvinceId], source: 'legacy_fallback' });
      response.headers.set('Cache-Control', 'public, max-age=30');
      return response;
    }
  },
};
