import { createHash } from 'node:crypto';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { isSpecificMapStop, type MapStop, type MappedStop } from '../../src/utils/itinerary-map.js';
import { databaseConfigured, dbOne, dbQuery, withinRateLimit } from '../_lib/auth.js';

const CACHE_AGE_MS = 60 * 24 * 3600 * 1000;
const MISS_AGE_MS = 14 * 24 * 3600 * 1000;
const GLOBAL_INTERVAL_MS = 1600;
const MAX_STOPS = 12;

type GeoEntry = { lat: number | null; lon: number | null; label: string };
const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store' },
});
const normalize = (value: string) => value.toLocaleLowerCase('vi-VN')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
  .replace(/^(tinh|tp\.?|thanh pho)\s+/i, '').replace(/[^a-z0-9]+/g, ' ').trim();
const sha = (value: string) => createHash('sha256').update(value).digest('hex');

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

async function lookupPlace(title: string, province: string): Promise<GeoEntry> {
  const params = new URLSearchParams({
    q: title + ', ' + province + ', Việt Nam',
    format: 'jsonv2', addressdetails: '1', countrycodes: 'vn', limit: '3',
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
  const region = normalize(province);
  for (const data of entries.slice(0, 3)) {
    if (!data || typeof data !== 'object') continue;
    const item = data as Record<string, unknown>;
    const address = item.address && typeof item.address === 'object' ? item.address as Record<string, unknown> : {};
    if (address.country_code !== 'vn') continue;
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 7 || lat > 24 || lon < 101 || lon > 118) continue;
    const addressRegion = [address.state, address.city, address.province, address.municipality, address.county, address.state_district]
      .filter((s): s is string => typeof s === 'string').map(normalize);
    // Reject hits outside the selected province rather than show a misleading pin.
    if (!addressRegion.some(part => part === region || part.includes(region))) continue;
    if (typeof item.display_name !== 'string' || !item.display_name) continue;
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
      const provinceName = provincesData[input.provinceId].name;
      const valid = input.stops.filter(isSpecificMapStop);
      const keys = valid.map(stop => sha(input.provinceId + '\n' + normalize(stop.title)));
      const now = Date.now();
      const points: MappedStop[] = [];
      const unseen: number[] = [];
      async function collect(index: number) {
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
        const result = await lookupPlace(valid[lookupIndex].title, provinceName);
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
