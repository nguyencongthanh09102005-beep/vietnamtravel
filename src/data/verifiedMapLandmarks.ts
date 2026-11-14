import type { ProvinceId } from './provincesData.js';

export interface ReviewedMapLandmark {
  name: string;
  latitude: number;
  longitude: number;
  /** Public source for the landmark's published coordinates. */
  sourceUrl: string;
}

/** Manually checked public reference coordinates, not estimated map positions.
 * These are external reference pins, NOT authoritative navigation waypoints.
 * Expand province by province only after comparing an actual named landmark
 * with a published coordinate source. Never replace a place with a nearby hotel.
 */
export const REVIEWED_MAP_LANDMARKS: Partial<Record<ProvinceId, readonly ReviewedMapLandmark[]>> = {
  'Son La': [
    {
      name: 'Thác Dải Yếm',
      latitude: 20.8129125, longitude: 104.5915781,
      sourceUrl: 'https://steller.co/p/th%25C3%25A1c-d%25E1%25BA%25A3i-y%25E1%25BA%25BFm-4SSZJK7FHzNYmCj4knacVGk',
    },
    {
      name: 'Cầu kính Bạch Long',
      latitude: 20.849, longitude: 104.56975,
      sourceUrl: 'https://en.wikipedia.org/wiki/List_of_bridges_in_Vietnam',
    },
    {
      name: 'Đồi Chè Trái Tim',
      latitude: 20.89087, longitude: 104.68654,
      sourceUrl: 'https://en-ie.topographic-map.com/map-zfcptj/%C4%90%E1%BB%93i-Ch%C3%A8-Tr%C3%A1i-Tim/',
    },
    {
      name: 'Ngũ Động Bản Ôn',
      latitude: 20.8731591, longitude: 104.7117465,
      sourceUrl: 'https://steller.co/p/ng%25C5%25A9-%25C4%2591%25E1%25BB%2599ng-b%25E1%25BA%25A3n-3qa4ctpP3wapTjvVxqKMRrX',
    },
  ],
};
