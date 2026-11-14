import { provinceDetailsCatalog } from '../../src/data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { HISTORICAL_PROVINCE_ALIASES } from '../../src/data/historicalProvinceAliases.js';
import { isSpecificMapStop } from '../../src/utils/itinerary-map.js';
import { dbQuery } from './database.js';
import { normalizeMapName } from './itinerary-map-priority.js';

const DAY_MS = 24 * 3600 * 1000;
const RETRY_ON_FAILURE_MS = 15 * 60 * 1000;
const WIKIPEDIA_ENDPOINT = 'https://vi.wikipedia.org/w/api.php';

type RecordValue = Record<string, unknown>;
const obj = (value: unknown): RecordValue =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
const valid = (lat: number, lon: number) =>
  Number.isFinite(lat) && Number.isFinite(lon) && lat >= 8 && lat <= 24 && lon >= 102 && lon <= 110;

export interface WikipediaCoordinate {
  name: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
}

export function wikipediaEligibleNames(provinceId: ProvinceId): string[] {
  if (provinceId === 'Truong Sa' || provinceId === 'Hoang Sa') return [];
  return provinceDetailsCatalog[provinceId].data.places
    .map(place => place.name.trim())
    .filter(name => isSpecificMapStop({ id: 'source', title: name, category: 'activities' }))
    .slice(0, 20);
}

/**
 * Wikimedia's coordinates are *article* locations, not guaranteed venue GPS.
 * Only accept exact named articles with place-specific coordinates AND an
 * introduction mentioning the current province (or its 2025 merged predecessor).
 * Never use a city or generic administrative centroid as a named destination.
 */
export function extractWikipediaCoordinates(
  provinceId: ProvinceId, names: string[], payload: unknown,
): WikipediaCoordinate[] {
  const query = obj(obj(payload).query);
  const pages = query.pages;
  if (!Array.isArray(pages)) return [];
  const accepted = new Set(names.map(normalizeMapName));
  const aliases = [
    provincesData[provinceId].name,
    ...Object.entries(HISTORICAL_PROVINCE_ALIASES)
      .filter(([, current]) => current === provinceId).map(([old]) => old),
    ...(provinceId === 'Ho Chi Minh' ? ['Sài Gòn', 'Saigon'] : []),
  ].map(normalizeMapName).filter(alias => alias.length >= 4);
  const found: WikipediaCoordinate[] = [];
  const seen = new Set<string>();
  for (const pageValue of pages) {
    const page = obj(pageValue);
    const title = typeof page.title === 'string' ? page.title.trim() : '';
    const key = normalizeMapName(title);
    if (!key || !accepted.has(key) || seen.has(key) ||
      Number(page.ns ?? -1) !== 0 || !Number.isInteger(page.pageid) ||
      obj(page.pageprops).disambiguation !== undefined) continue;
    const intro = normalizeMapName(typeof page.extract === 'string' ? page.extract.slice(0, 2400) : '');
    if (!intro || !aliases.some(alias =>
      (' ' + intro + ' ').includes(' ' + alias + ' '))) continue;
    const coordinates = page.coordinates;
    if (!Array.isArray(coordinates) || !coordinates.length) continue;
    const coord = obj(coordinates[0]);
    const latitude = Number(coord.lat), longitude = Number(coord.lon);
    if ((coord.globe && coord.globe !== 'earth') || !valid(latitude, longitude)) continue;
    seen.add(key);
    found.push({
      name: names.find(name => normalizeMapName(name) === key)!,
      latitude, longitude,
      sourceUrl: 'https://vi.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_')),
    });
  }
  return found;
}

/** Only run on user-triggered planner requests with insufficient cached pins.
 * One batch request per province per day, with an atomic SQLite/Turso gate.
 * Never do systematic bulk geocoding, scraping, or automatic publication. */
export async function bootstrapWikipediaMapPlaces(
  provinceId: ProvinceId, fetcher: typeof fetch = fetch,
): Promise<number> {
  const names = wikipediaEligibleNames(provinceId);
  if (!names.length) return 0;
  const now = Date.now();
  await dbQuery(
    'INSERT INTO travel_wiki_bootstrap(province_id,attempted_at,found) VALUES (?,0,0) ON CONFLICT(province_id) DO NOTHING',
    [provinceId],
  );
  const gate = await dbQuery(
    'UPDATE travel_wiki_bootstrap SET attempted_at=? WHERE province_id=? AND attempted_at<=?',
    [now, provinceId, now - DAY_MS],
  );
  if (!gate.changes) return 0;
  try {
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', redirects: '1',
      prop: 'coordinates|extracts|pageprops', titles: names.join('|'),
      exintro: '1', explaintext: '1', exchars: '1500', colimit: '1',
    });
    const response = await fetcher(WIKIPEDIA_ENDPOINT + '?' + params.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; verified travel map locations)',
      },
      signal: AbortSignal.timeout(6500),
    });
    if (!response.ok) throw Error('WIKIMEDIA_HTTP_' + response.status);
    const body: unknown = await response.json();
    const matches = extractWikipediaCoordinates(provinceId, names, body);
    for (const record of matches) {
      await dbQuery(
        'INSERT INTO travel_wikipedia_geodata(province_id,name,latitude,longitude,source_url,checked_at) VALUES (?,?,?,?,?,?) ' +
        'ON CONFLICT(province_id,name) DO UPDATE SET latitude=excluded.latitude,longitude=excluded.longitude,' +
        'source_url=excluded.source_url,checked_at=excluded.checked_at',
        [provinceId, record.name, record.latitude, record.longitude, record.sourceUrl, now],
      );
    }
    await dbQuery('UPDATE travel_wiki_bootstrap SET found=? WHERE province_id=?', [matches.length, provinceId]);
    return matches.length;
  } catch (error) {
    // Keep the shared throttle but let transient external errors retry later.
    await dbQuery(
      'UPDATE travel_wiki_bootstrap SET attempted_at=? WHERE province_id=?',
      [now - DAY_MS + RETRY_ON_FAILURE_MS, provinceId],
    ).catch(() => undefined);
    console.warn('[wikipedia-geo] temporary lookup failure', provinceId, String(error).slice(0, 180));
    return 0;
  }
}
