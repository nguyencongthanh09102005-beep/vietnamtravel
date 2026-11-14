import { createHash } from 'node:crypto';
import { provinceDetailsCatalog } from '../../src/data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { HISTORICAL_PROVINCE_ALIASES } from '../../src/data/historicalProvinceAliases.js';
import { REVIEWED_MAP_LANDMARKS } from '../../src/data/verifiedMapLandmarks.js';
import { isSpecificMapStop } from '../../src/utils/itinerary-map.js';
import { dbQuery } from './database.js';

const MAX_AGE_MS = 60 * 24 * 3600 * 1000;

/** Uses the same normalized keys as the existing OSM geocoding cache. */
export function normalizeMapName(value: string): string {
  return value.toLocaleLowerCase('vi-VN')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .replace(/^(tinh|tp\.?|thanh pho)\s+/i, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function mapQueryKey(provinceId: ProvinceId, title: string): string {
  return createHash('sha256').update(provinceId + '\n' + normalizeMapName(title)).digest('hex');
}

/** Stable across deployments, regardless of the matching geocoding source. */
export function stablePlaceId(provinceId: ProvinceId, title: string): string {
  return 'p_' + mapQueryKey(provinceId, title).slice(0, 20);
}

/** Accept province names from either side of the official 2025 mergers. */
export function matchesMapProvince(provinceId: ProvinceId, addressParts: string[]): boolean {
  const names = [
    provincesData[provinceId].name,
    ...Object.entries(HISTORICAL_PROVINCE_ALIASES)
      .filter(([, current]) => current === provinceId)
      .map(([historical]) => historical),
  ].map(normalizeMapName);
  return addressParts.some(part => {
    const normalized = normalizeMapName(part);
    return names.some(name => normalized === name);
  });
}

export interface PriorityMapPlace {
  /** Stable ID scoped to the selected province and normalized place name. */
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  source: 'osm_published' | 'geocode_cache' | 'reviewed_reference';
  sourceUrl?: string;
}

function validCoordinates(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && latitude >= 8 && latitude <= 24 &&
    Number.isFinite(longitude) && longitude >= 102 && longitude <= 110;
}

/** Reuse only approved published OSM destinations and recent positive Nominatim geocodes.
 * Staged/rejected content must not silently become public destination suggestions. */
export async function getPriorityMapPlaces(provinceId: ProvinceId): Promise<PriorityMapPlace[]> {
  const results: PriorityMapPlace[] = [];
  const seen = new Set<string>();
  const add = (place: Omit<PriorityMapPlace, 'id'>) => {
    const key = normalizeMapName(place.name);
    if (!key || seen.has(key) || !isSpecificMapStop({
      id: 'candidate', title: place.name, category: 'activities',
    }) || !validCoordinates(place.latitude, place.longitude)) return;
    seen.add(key);
    results.push({ ...place, id: stablePlaceId(provinceId, place.name) });
  };
  const catalogNames = provinceDetailsCatalog[provinceId].data.places
    .map(place => place.name).filter(name => name.trim()).slice(0, 30);
  try {
    if (catalogNames.length) {
    const cacheKeys = catalogNames.map(name => mapQueryKey(provinceId, name));
    const placeholders = cacheKeys.map(() => '?').join(',');
    const cached = await dbQuery(
      'SELECT query_key, lat, lon, label FROM place_geocodes ' +
      'WHERE query_key IN (' + placeholders + ') AND lat IS NOT NULL AND lon IS NOT NULL AND checked_at >= ?',
      [...cacheKeys, Date.now() - MAX_AGE_MS],
    );
    for (const row of cached.rows) {
      const index = cacheKeys.indexOf(String(row.query_key));
      if (index < 0) continue;
      add({ name: catalogNames[index], latitude: Number(row.lat),
        longitude: Number(row.lon), source: 'geocode_cache' });
    }
    }
  } catch (error) {
    console.warn('[map-catalog] cached geocodes unavailable', String(error).slice(0, 120));
  }
  // These 2026 public reference coordinates are distinct named landmarks,
  // not arbitrary center points for a city or province.
  for (const place of REVIEWED_MAP_LANDMARKS[provinceId] ?? []) {
    add({ ...place, source: 'reviewed_reference' });
  }
  try {
  const published = await dbQuery(
    'SELECT g.name, g.latitude, g.longitude FROM travel_external_geodata g ' +
    'INNER JOIN travel_core_candidates c ON c.candidate_id = g.candidate_id ' +
    "WHERE g.province_id = ? AND c.status = 'published' ORDER BY g.checked_at DESC LIMIT 80",
    [provinceId],
  );
  for (const row of published.rows) {
    add({ name: String(row.name), latitude: Number(row.latitude),
      longitude: Number(row.longitude), source: 'osm_published' });
  }
  } catch (error) {
    console.warn('[map-catalog] published OSM places unavailable', String(error).slice(0, 120));
  }
  return results.slice(0, 32);
}

export function matchKnownMapPlace(title: string, places: PriorityMapPlace[]): PriorityMapPlace | null {
  const key = normalizeMapName(title);
  return places.find(place => normalizeMapName(place.name) === key) ?? null;
}

/** A plan has usable map coverage only when DISTINCT approved names match pins. */
export function countMapReadyStops(
  stops: ReadonlyArray<{ title: string }>, places: PriorityMapPlace[],
): number {
  const named = new Set(stops.map(stop => normalizeMapName(stop.title)));
  return places.filter(place => named.has(normalizeMapName(place.name))).length;
}

/** Accept only IDs from this province's vetted catalog; names from AI are untrusted. */
export function matchKnownMapPlaceById(placeId: string, places: PriorityMapPlace[]): PriorityMapPlace | null {
  if (!/^p_[0-9a-f]{20}$/.test(placeId)) return null;
  return places.find(place => place.id === placeId) ?? null;
}
