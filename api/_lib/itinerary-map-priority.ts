import { createHash } from 'node:crypto';
import { provinceDetailsCatalog } from '../../src/data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { HISTORICAL_PROVINCE_ALIASES } from '../../src/data/historicalProvinceAliases.js';
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
  name: string;
  latitude: number;
  longitude: number;
  source: 'osm_published' | 'geocode_cache';
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
  const add = (place: PriorityMapPlace) => {
    const key = normalizeMapName(place.name);
    if (!key || seen.has(key) || !isSpecificMapStop({
      id: 'candidate', title: place.name, category: 'activities',
    }) || !validCoordinates(place.latitude, place.longitude)) return;
    seen.add(key);
    results.push(place);
  };
  const catalogNames = provinceDetailsCatalog[provinceId].data.places
    .map(place => place.name).filter(name => name.trim()).slice(0, 30);
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
  return results.slice(0, 32);
}

export function matchKnownMapPlace(title: string, places: PriorityMapPlace[]): PriorityMapPlace | null {
  const key = normalizeMapName(title);
  return places.find(place => normalizeMapName(place.name) === key) ?? null;
}
