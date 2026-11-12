/**
 * Conservative content taxonomy gate.
 *
 * Search relevance and a Wikidata QID alone DO NOT establish that a result is
 * a travel destination or local dish. Confirm the *subject* of a Wikipedia
 * article through its actual Wikipedia categories AND Wikidata description.
 *
 * For unexplained/ambiguous results: queue for review, never auto-publish.
 */
import { HISTORICAL_PROVINCE_ALIASES } from '../data/historicalProvinceAliases.js';
import { provinceDetailsCatalog } from '../data/provinceDetailsData.js';
import type { ProvinceId } from '../data/provincesData.js';

export const AUTO_CONTENT_GATE_VERSION = 2;
export type ContentGroup = 'places' | 'cuisine';

export function normalizeContentText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g,'d')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function hasPhrase(value: string, rx: RegExp): boolean {
  return rx.test(' ' + normalizeContentText(value) + ' ');
}
function provinceNames(id: ProvinceId) {
  const name = provinceDetailsCatalog[id].title.replace(/^(Tỉnh|TP\.|Thành phố)\s+/i,'');
  return [name, ...Object.entries(HISTORICAL_PROVINCE_ALIASES)
    .filter(([,target])=>target===id).map(([old])=>old)];
}
export function normalizedSubjectKey(name: string, provinceId: ProvinceId): string {
  let key = normalizeContentText(name.replace(/\([^)]*\)/g,''));
  key = key.replace(/^(?:dac san|mon an)\s+/,'');
  for (const alias of provinceNames(provinceId).sort((a,b)=>b.length-a.length)) {
    const suffix = normalizeContentText(alias);
    if (suffix && key.endsWith(' ' + suffix)) key = key.slice(0,-(suffix.length+1));
  }
  return key.trim();
}
export function isSubjectExcluded(name: string, section: ContentGroup, description = ''): boolean {
  const title = ' ' + normalizeContentText(name) + ' ';
  const intro = ' ' + normalizeContentText(description.slice(0,350)) + ' ';
  // Reports, accidents, people, performing troupes, administrative entities.
  if (/\b(?:su co|tai nan|vu tre|vu viec|tham kich|sap nhip|sap cau|roi vao|tin tuc|bao cao|doan cheo|doan nghe thuat|nguoi dao|dan toc|tap the|khu cong nghiep)\b/.test(title))
    return true;
  // Administrative names are labelled with a *prefix or disambiguator*, not
  // incidental words such as "tham quan" or "tỉnh Quảng Ngãi" in the text.
  if (/\((?:tỉnh|thành phố|thị xã|huyện|quận|xã)\)/i.test(name) ||
      /^(?:tinh|thanh pho|thi xa|huyen|quan|xa|phuong)\s+/.test(normalizeContentText(name)))
    return true;
  if (/^ (?:nguoi|doan |su co |vu |tinh |thanh pho |quan |huyen )/.test(title)) return true;
  if (section === 'cuisine') {
    if (/\b(?:giong ga|giong vat nuoi|giong cho|giong ca|loai chim|loai ga|ho ca|dong vat|dan toc|con nguoi|ngon ngu|nghe thuat|cong trinh|ben |ben cang|cau |dao |nui |cho noi)\b/.test(intro))
      return true;
    if (/\b(?:giong ga|giong vat nuoi|ga lien minh)\b/.test(title)) return true;
  }
  return false;
}

const FOOD_CAT = /\b(?:am thuc|mon an|dac san|banh viet nam|thuc pham|do uong|mon chay|san pham nong nghiep)\b/;
const FOOD_DESC = /\b(?:mon an|dac san|am thuc|thuc pham|banh|dish|cuisine|food|snack|traditional food|specialty)\b/;
const PLACE_CAT = /\b(?:di tich|danh lam|thang canh|dia diem du lich|diem tham quan|du lich|bao tang|nha co|chua|den tho|nha tho|bai bien|dao|thac|hang dong|vuon quoc gia|khu du lich|cong vien|di san|kien truc|nui)\b/;
const PLACE_DESC = /\b(?:di tich|diem tham quan|dia diem du lich|thang canh|nha co|bao tang|chua|den tho|nha tho|bai bien|dao|thac|hang dong|vuon quoc gia|khu du lich|cong vien|cau|nui|ho|ben cang|tourist attraction|historic site|temple|museum|beach|island|mountain|park|lake|bridge|building|landmark|castle|waterfall)\b/;
const CATEGORY_EXCLUSION = /\b(?:tai nan|su co|tham hoa|bao mang|bao chi|bao cao|thoi su|nhan vat|cac dan toc|dan toc|giong vat nuoi|giong gia cam|giong ga|dong vat|bo toc|thanh pho|don vi hanh chinh|tinh cua viet nam|tinh thanh|quan huyen|cac tinh|lich su tinh|kien thuc bac khoa)\b/;

export interface ContentTaxonomyEvidence {
  name: string;
  description: string;
  categoryTitles: string[];
  wikidataDescription: string;
  section: ContentGroup;
  provinceId: ProvinceId;
}

/**
 * Deliberately fail-closed. A single mention of "món ăn"/"tham quan" in the
 * article prose can be about something else; it is never enough to approve.
 */
export function evaluateContentTaxonomy(evidence: ContentTaxonomyEvidence):
  { approved: boolean; reason: string } {
  const {name,description,categoryTitles,wikidataDescription,section,provinceId}=evidence;
  if (isSubjectExcluded(name,section,description))
    return {approved:false,reason:'Loại nội dung không hợp lệ (thời sự, hành chính, dân tộc, giống vật nuôi...)'};
  const desc = ' ' + normalizeContentText(wikidataDescription) + ' ';
  const categories = ' ' + categoryTitles.map(normalizeContentText).join(' | ') + ' ';
  if (!wikidataDescription.trim() || !categoryTitles.length)
    return {approved:false,reason:'Không đủ dữ liệu phân loại từ Wikidata và chuyên mục Wikipedia'};
  if (hasPhrase(categories,CATEGORY_EXCLUSION) ||
      hasPhrase(desc,CATEGORY_EXCLUSION))
    return {approved:false,reason:'Nguồn xếp mục vào nhóm không phải du lịch/ẩm thực'};
  const hasCategory = section==='cuisine' ? hasPhrase(categories,FOOD_CAT) : hasPhrase(categories,PLACE_CAT);
  const hasDescription = section==='cuisine' ? hasPhrase(desc,FOOD_DESC) : hasPhrase(desc,PLACE_DESC);
  if (!hasCategory || !hasDescription)
    return {approved:false,reason:'Chuyên mục Wikipedia và mô tả Wikidata không cùng xác nhận đúng chủ thể'};
  const firstLead = normalizeContentText(description.slice(0,300));
  const matches = provinceNames(provinceId)
    .map(normalizeContentText).filter(name=>name.length>3)
    .some(name=>(' '+firstLead+' ').includes(' '+name+' '));
  if (!matches) return {approved:false,reason:'Chưa chứng minh đây là nội dung của tỉnh trong phần mở đầu'};
  return {approved:true,reason:'Wikidata và chuyên mục Wikipedia xác nhận phân loại, mở đầu khớp tỉnh'};
}
