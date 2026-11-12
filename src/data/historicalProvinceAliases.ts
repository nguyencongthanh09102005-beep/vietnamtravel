/** Historical province names from the 2025 National Assembly resolution.
 * Current catalog still contains 34 province/city units and two separately
 * displayed island groups; old names are search aliases, never new map shapes.
 * Source: https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm
 */
import { provincesData, type ProvinceId } from './provincesData.js';
import { normalizeSearchText } from '../utils/text.js';

export const HISTORICAL_ADMIN_SOURCE = 'https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm';
export const HISTORICAL_PROVINCE_ALIASES: Readonly<Record<string, ProvinceId>> = {
  'Hà Giang': 'Tuyen Quang',
  'Yên Bái': 'Lao Cai',
  'Bắc Kạn': 'Thai Nguyen',
  'Vĩnh Phúc': 'Phu Tho',
  'Hòa Bình': 'Phu Tho',
  'Bắc Giang': 'Bac Ninh',
  'Thái Bình': 'Hung Yen',
  'Hải Dương': 'Hai Phong',
  'Hà Nam': 'Ninh Binh',
  'Nam Định': 'Ninh Binh',
  'Quảng Bình': 'Quang Tri',
  'Quảng Nam': 'Da Nang',
  'Kon Tum': 'Quang Ngai',
  'Bình Định': 'Gia Lai',
  'Ninh Thuận': 'Khanh Hoa',
  'Đắk Nông': 'Lam Dong',
  'Bình Thuận': 'Lam Dong',
  'Phú Yên': 'Dak Lak',
  'Bình Dương': 'Ho Chi Minh',
  'Bà Rịa - Vũng Tàu': 'Ho Chi Minh',
  'Bình Phước': 'Dong Nai',
  'Long An': 'Tay Ninh',
  'Sóc Trăng': 'Can Tho',
  'Hậu Giang': 'Can Tho',
  'Bến Tre': 'Vinh Long',
  'Trà Vinh': 'Vinh Long',
  'Tiền Giang': 'Dong Thap',
  'Bạc Liêu': 'Ca Mau',
  'Kiên Giang': 'An Giang',
} as const;

/** Also accept the old unaccented URL IDs without breaking saved links. */
export function resolveHistoricalProvince(value: string): ProvinceId | null {
  if (Object.prototype.hasOwnProperty.call(provincesData, value)) return value as ProvinceId;
  const clean = normalizeSearchText(value.replace(/[._-]/g, ' '));
  for (const [alias, provinceId] of Object.entries(HISTORICAL_PROVINCE_ALIASES)) {
    if (normalizeSearchText(alias) === clean) return provinceId;
  }
  return null;
}

export function searchHistoricalProvinces(provinceId: ProvinceId, query: string) {
  const key = normalizeSearchText(query);
  if (!key) return false;
  return Object.entries(HISTORICAL_PROVINCE_ALIASES).some(([oldName, currentId]) =>
    currentId === provinceId && normalizeSearchText(oldName).includes(key));
}
