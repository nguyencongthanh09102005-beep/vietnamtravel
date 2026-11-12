/** Conservative RSS/core-seeding specificity gate.
 *
 * A city/province/commune name can be the location of an attraction,
 * but is not itself a specific tourist attraction or a regional dish.
 * This gate NEVER touches authored/legacy cards.
 */
import { provincesData } from '../data/provincesData.js';
import { HISTORICAL_PROVINCE_ALIASES } from '../data/historicalProvinceAliases.js';
import { normalizeContentText } from './contentQuality.js';

const normalize=(value:string)=>normalizeContentText(value)
  .replace(/^(?:tinh|thanh pho|tp|tp hcm|xa|phuong|thi tran|thi xa)\s+/,'')
  .trim();

// Government names plus historical province aliases, reused by search and routing.
// These are geographical areas, not places to visit or food to eat.
const regionNames=new Set([
  ...Object.keys(provincesData),
  ...Object.values(provincesData).map(province=>province.name),
  ...Object.keys(HISTORICAL_PROVINCE_ALIASES),
  'TP.HCM','Thành phố Hồ Chí Minh','Hồ Chí Minh','Sài Gòn',
  // Specific known city/commune names that were misclassified by RSS. This is
  // not an exhaustive locality database; unknown geographic names need review.
  'Nha Trang','Quy Nhơn','Đà Lạt','Hội An','Sơn Tây Thượng',
].map(normalize));

// Reject generic advertising/news labels, not actual named historical monuments
// such as "Di sản văn hóa Mỹ Sơn" (real monument is "Thánh địa Mỹ Sơn").
// Kept narrow to avoid blacklisting real named attractions.
const genericLead=/^(?:du lich|di san|di san van hoa|diem den|dia diem du lich|danh lam thang canh|am thuc|dac san|lich su|van hoa)\s+(.+)$/;

export function checkCoreSubjectSpecificity(name:string,section:'places'|'cuisine'):
  {specific:boolean;reason:string}{
  if(typeof name!=='string'||!name.trim())return {specific:false,reason:'Tên trống'};
  const title=normalizeContentText(name);
  const plain=normalize(name);
  if(regionNames.has(plain) || regionNames.has(title))
    return {specific:false,reason:'Tên chỉ đơn vị hành chính hoặc địa phương, không phải đối tượng du lịch/ẩm thực cụ thể'};
  const match=genericLead.exec(plain);
  if(match&&regionNames.has(normalize(match[1])))
    return {specific:false,reason:'Chỉ là chủ đề tổng hợp du lịch/văn hóa/ẩm thực của địa phương'};
  if(section==='cuisine' && /^(?:le hoi|su kien|du lich|gioi thieu)\s/.test(plain))
    return {specific:false,reason:'Chủ đề sự kiện hoặc quảng bá, không phải món ăn'};
  return {specific:true,reason:'Có tên riêng cần tiếp tục kiểm chứng nguồn'};
}
