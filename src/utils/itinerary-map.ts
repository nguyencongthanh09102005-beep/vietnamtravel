import type { ItineraryStop } from './itinerary.js';

export type MapStop = Pick<ItineraryStop, 'id' | 'title' | 'category'>;
export interface MappedStop {
  id: string;
  lat: number;
  lon: number;
  label: string;
}

/** A generic dish or a transfer is not a verified location. */
export function isSpecificMapStop(stop: MapStop): boolean {
  const title = stop.title.trim();
  if (title.length < 3 || stop.category === 'transport') return false;
  if (/^(hoạt động mới|ăn sáng|ăn trưa|ăn tối|ăn nhẹ|nghỉ ngơi|nhận phòng|trả phòng|di chuyển|về khách sạn|tham quan tự do)/iu.test(title)) return false;
  if (stop.category === 'food' &&
      !/(quán|nhà hàng|tiệm|chợ|phố|café|cafe|coffee|bà |ông |cô |chú |bé |hải sản|địa chỉ)/iu.test(title)) {
    return false;
  }
  return true;
}

export function mapSearchUrl(title: string, province: string): string {
  const params = new URLSearchParams({ api: '1', query: title.trim() + ', ' + province + ', Việt Nam' });
  return 'https://www.google.com/maps/search/?' + params.toString();
}

export interface DirectionsLink { label: string; url: string; stopIds: string[]; }

/**
 * Google Maps URLs work without API keys. Cap each segment at five stops to
 * remain practical on mobile, overlapping the end/start of consecutive legs.
 * Name-based directions must always be verified in Google Maps itself.
 */
export function dayDirectionsLinks(stops: MapStop[], province: string, points: MappedStop[] = []): DirectionsLink[] {
  const usable = stops.filter(isSpecificMapStop);
  // Coordinates are used only when a provider returned a valid pin. Keep name fallback.
  const located = new Map(points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon) &&
    p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180).map(p => [p.id, p]));
  if (!usable.length) return [];
  if (usable.length === 1) {
    return [{ label: 'Tìm địa điểm trên Maps', url: mapSearchUrl(usable[0].title, province), stopIds: [usable[0].id] }];
  }
  const links: DirectionsLink[] = [];
  for (let offset = 0; offset < usable.length - 1; offset += 4) {
    const group = usable.slice(offset, offset + 5);
    if (group.length < 2) break;
    const name = (stop: MapStop) => {
      const pin = located.get(stop.id);
      return pin ? pin.lat.toFixed(6) + ',' + pin.lon.toFixed(6) : stop.title.trim() + ', ' + province + ', Việt Nam';
    };
    const params = new URLSearchParams({
      api: '1',
      origin: name(group[0]),
      destination: name(group[group.length - 1]),
      travelmode: 'driving',
    });
    if (group.length > 2) params.set('waypoints', group.slice(1, -1).map(name).join('|'));
    links.push({
      label: usable.length <= 5 ? 'Mở chỉ đường Google Maps' : 'Chỉ đường chặng ' + (links.length + 1),
      url: 'https://www.google.com/maps/dir/?' + params.toString(),
      stopIds: group.map(s => s.id),
    });
  }
  return links;
}

/** Air distance, not road travel distance. Return null for incomplete route geocoding. */
export function dayAirDistanceKm(stops: MapStop[], points: MappedStop[]): number | null {
  const usable = stops.filter(isSpecificMapStop);
  if (usable.length < 2) return null;
  const located = new Map(points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon) &&
    p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180).map(p => [p.id, p]));
  const ordered = usable.map(stop => located.get(stop.id));
  if (ordered.some(point => !point)) return null;
  const rad = (degrees: number) => degrees * Math.PI / 180;
  let km = 0;
  for (let index = 1; index < ordered.length; index++) {
    const a = ordered[index - 1]!;
    const b = ordered[index]!;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    km += 6371.0088 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  return Math.round(km * 10) / 10;
}
