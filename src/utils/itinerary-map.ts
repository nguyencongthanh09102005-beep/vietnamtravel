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
export function dayDirectionsLinks(stops: MapStop[], province: string): DirectionsLink[] {
  const usable = stops.filter(isSpecificMapStop);
  if (!usable.length) return [];
  if (usable.length === 1) {
    return [{ label: 'Tìm địa điểm trên Maps', url: mapSearchUrl(usable[0].title, province), stopIds: [usable[0].id] }];
  }
  const links: DirectionsLink[] = [];
  for (let offset = 0; offset < usable.length - 1; offset += 4) {
    const group = usable.slice(offset, offset + 5);
    if (group.length < 2) break;
    const name = (stop: MapStop) => stop.title.trim() + ', ' + province + ', Việt Nam';
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
