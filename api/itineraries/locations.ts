import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { isSpecificMapStop, type MapStop, type MappedStop } from '../../src/utils/itinerary-map.js';
import { databaseConfigured, dbOne, dbQuery, withinRateLimit } from '../_lib/auth.js';
import { getPriorityMapPlaces, mapQueryKey, matchesMapProvince, matchKnownMapPlace, normalizeMapName } from '../_lib/itinerary-map-priority.js';

const CACHE_AGE_MS = 60 * 24 * 3600 * 1000;
const MISS_AGE_MS = 14 * 24 * 3600 * 1000;
const GLOBAL_INTERVAL_MS = 1600;
const MAX_STOPS = 12;

type GeoEntry = { lat: number | null; lon: number | null; label: string };
const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store' },
});
function parseInput(value: unknown): { provinceId: ProvinceId; stops: MapStop[] } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (typeof body.provinceId !== 'string' || !Object.prototype.hasOwnProperty.call(provincesData, body.provinceId) ||
      !Array.isArray(body.stops) || body.stops.length < 1 || body.stops.length > MAX_STOPS) return null;
  const stops: MapStop[] = [];
  const ids = new Set<string>();
  for (const entry of body.stops) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const stop = entry as Record<string, unknown>;
    if (typeof stop.id !== 'string' || !/^[\w-]{1,80}$/.test(stop.id) || ids.has(stop.id) ||
        typeof stop.title !== 'string' || stop.title.length > 160 ||
        !['food', 'activities', 'transport', 'lodging'].includes(String(stop.category))) return null;
    ids.add(stop.id);
    stops.push({ id: stop.id, title: stop.title.trim(), category: stop.category as MapStop['category'] });
  }
  return { provinceId: body.provinceId as ProvinceId, stops };
}

async function lookupPlace(title: string, provinceId: ProvinceId): Promise<GeoEntry> {
  const params = new URLSearchParams({
    // Old province names remain in OSM after the 2025 mergers.
    // The result is accepted only if its address matches the chosen province.
    q: title + ', Việt Nam',
    format: 'jsonv2', addressdetails: '1', namedetails: '1', countrycodes: 'vn', limit: '8',
    'accept-language': 'vi',
  });
  const result = await fetch('https://nominatim.openstreetmap.org/search?' + params, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'VietnamTravel-ItineraryMap/1.0 (+https://vietnamtravel-nine.vercel.app)',
      Referer: 'https://vietnamtravel-nine.vercel.app/',
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!result.ok) throw new Error('MAP_GEOCODING_UNAVAILABLE');
  const entries = await result.json() as unknown;
  if (!Array.isArray(entries)) throw new Error('MAP_GEOCODING_INVALID');
  for (const data of entries.slice(0, 8)) {
    if (!data || typeof data !== 'object') continue;
    const item = data as Record<string, unknown>;
    const address = item.address && typeof item.address === 'object' ? item.address as Record<string, unknown> : {};
    if (address.country_code !== 'vn') continue;
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 7 || lat > 24 || lon < 101 || lon > 118) continue;
    const addressRegion = [address.state, address.city, address.province, address.municipality, address.county, address.state_district]
      .filter((s): s is string => typeof s === 'string');
    // New 2025 province names and officially merged former province names.
    if (!matchesMapProvince(provinceId, addressRegion)) continue;
    if (typeof item.display_name !== 'string' || !item.display_name) continue;
    if (['administrative', 'city', 'state', 'county', 'country'].includes(String(item.type)) ||
        ['administrative', 'city', 'state', 'county', 'country'].includes(String(item.addresstype))) continue;
    const names = item.namedetails && typeof item.namedetails === 'object'
      ? Object.values(item.namedetails as Record<string, unknown>)
        .filter((name): name is string => typeof name === 'string')
      : [];
    names.push(item.display_name.split(',')[0]);
    if (typeof item.name === 'string') names.push(item.name);
    const expected = normalizeMapName(title);
    // Never accept a generic city result; require an overlapping proper name.
    if (!names.some(name => {
      const candidate = normalizeMapName(name);
      return candidate.length >= 5 && (candidate === expected ||
        (candidate.includes(expected) && expected.length >= 7) ||
        (expected.includes(candidate) && candidate.length >= 7));
    })) continue;
    return { lat, lon, label: item.display_name.slice(0, 260) };
  }
  return { lat: null, lon: null, label: '' };
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    let raw: unknown;
    try {
      const text = await request.text();
      if (text.length > 6000) return json({ error: 'Yêu cầu quá lớn.' }, 413);
      raw = JSON.parse(text);
    } catch { return json({ error: 'Yêu cầu bản đồ không hợp lệ.' }, 400); }
    const input = parseInput(raw);
    if (!input) return json({ error: 'Danh sách địa điểm không hợp lệ.' }, 400);
    if (!databaseConfigured()) return json({ error: 'Chưa cấu hình database cho bản đồ.' }, 503);
    try {
      if (!await withinRateLimit(request, 'planner-map', '', 120, 3600)) {
        return json({ error: 'Đã vượt giới hạn tìm vị trí tạm thời.' }, 429);
      }
      const valid = input.stops.filter(isSpecificMapStop);
      const keys = valid.map(stop => mapQueryKey(input.provinceId, stop.title));
      const mappedPlaces = await getPriorityMapPlaces(input.provinceId).catch(() => []);
      const now = Date.now();
      const points: MappedStop[] = [];
      const unseen: number[] = [];
      async function collect(index: number) {
        const found = matchKnownMapPlace(valid[index].title, mappedPlaces);
        if (found) {
          points.push({ id: valid[index].id, lat: found.latitude,
            lon: found.longitude, label: found.name });
          return;
        }
        const row = await dbOne('SELECT lat, lon, label, checked_at FROM place_geocodes WHERE query_key = ?', [keys[index]]);
        if (!row || Number(row.checked_at) <= now - (row.lat === null ? MISS_AGE_MS : CACHE_AGE_MS)) {
          unseen.push(index);
        } else if (row.lat !== null && row.lon !== null) {
          points.push({ id: valid[index].id, lat: Number(row.lat), lon: Number(row.lon), label: String(row.label) });
        }
      }
      for (let i = 0; i < valid.length; i++) await collect(i);
      let lookupIndex: number | null = null;
      if (unseen.length) {
        // This atomic DB gate applies across Vercel instances and all users, not
        // per browser. One uncached lookup per request, never bulk-geocode.
        await dbQuery("INSERT INTO rate_limits(scope,attempts,expires_at) VALUES ('map-osm-global',0,0) ON CONFLICT(scope) DO NOTHING");
        const lock = await dbQuery('UPDATE rate_limits SET expires_at = ? WHERE scope = ? AND expires_at <= ?', [
          now + GLOBAL_INTERVAL_MS, 'map-osm-global', now,
        ]);
        if (lock.changes > 0) lookupIndex = unseen[0];
      }
      if (lookupIndex !== null) {
        const result = await lookupPlace(valid[lookupIndex].title, input.provinceId);
        await dbQuery(
          'INSERT INTO place_geocodes(query_key,lat,lon,label,checked_at) VALUES (?,?,?,?,?) ' +
          'ON CONFLICT(query_key) DO UPDATE SET lat=excluded.lat,lon=excluded.lon,label=excluded.label,checked_at=excluded.checked_at',
          [keys[lookupIndex], result.lat, result.lon, result.label, now],
        );
        if (result.lat !== null && result.lon !== null) {
          points.push({ id: valid[lookupIndex].id, lat: result.lat, lon: result.lon, label: result.label });
        }
      }
      const resolved = new Set(points.map(p => p.id));
      const pending = unseen.length > (lookupIndex === null ? 0 : 1);
      return json({
        points: input.stops.filter(s => resolved.has(s.id)).map(s => points.find(p => p.id === s.id)),
        unlocatedIds: input.stops.filter(s => !resolved.has(s.id)).map(s => s.id),
        pending, retryAfterMs: pending ? 1900 : 0,
      });
    } catch (error) {
      console.error('[itinerary-map] geocoding error', error);
      return json({ error: 'Không thể tìm vị trí lúc này. Vẫn có thể mở Google Maps để kiểm tra địa điểm.' }, 503);
    }
  },
};
