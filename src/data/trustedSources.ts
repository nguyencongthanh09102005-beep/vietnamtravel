/**
 * Checked source endpoints for VietnamTravel (2026-11).
 *
 * "trusted" means appropriate for a specific topic, not unconditional proof:
 * RSS journalism is only a lead, and image use has separate license rules.
 * NEVER turn a mention of tourism/food into a published card by itself.
 */
export type SourceRole = 'official_admin' | 'official_statistics' | 'official_tourism' |
  'cuisine_association' | 'travel_guide' | 'news_discovery' | 'open_photo' | 'open_geodata';
export interface TrustedSource {
  id: string;
  role: SourceRole;
  host: string;
  homepage: string;
  verifiedLabel: string;
  canAutopublish: false;
  feed?: string;
}

export const TRUSTED_SOURCES: ReadonlyArray<TrustedSource> = [
  {id:'government',role:'official_admin',host:'chinhphu.vn',homepage:'https://chinhphu.vn/',
    verifiedLabel:'Cổng Chính phủ; chỉ đối chiếu nghị quyết/văn bản gốc',canAutopublish:false},
  {id:'government_documents',role:'official_admin',host:'vanban.chinhphu.vn',homepage:'https://vanban.chinhphu.vn/',
    verifiedLabel:'Văn bản Chính phủ',canAutopublish:false},
  {id:'gso',role:'official_statistics',host:'gso.gov.vn',homepage:'https://www.gso.gov.vn/',
    verifiedLabel:'Cơ quan thống kê; kiểm tra năm và đơn vị hành chính',canAutopublish:false},
  {id:'vietnamtourism',role:'official_tourism',host:'vietnamtourism.gov.vn',homepage:'https://vietnamtourism.gov.vn/',
    verifiedLabel:'Cục Du lịch Quốc gia Việt Nam',canAutopublish:false},
  {id:'vietnamtravel_official',role:'official_tourism',host:'vietnam.travel',
    homepage:'https://vietnam.travel/vi/',
    verifiedLabel:'Cổng du lịch chính thức; CẤM scraping nội dung không được cấp phép theo điều khoản 2026; chỉ làm nguồn đối chiếu/link',canAutopublish:false},
  {id:'openstreetmap',role:'open_geodata',host:'openstreetmap.org',
    homepage:'https://www.openstreetmap.org/copyright',
    verifiedLabel:'OpenStreetMap ODbL — bản đồ dữ liệu mở; giữ ghi công và kiểm chứng địa điểm',canAutopublish:false},
  {id:'visithcmc',role:'official_tourism',host:'visithcmc.vn',homepage:'https://visithcmc.vn/',
    verifiedLabel:'Cổng Du lịch TP.HCM',canAutopublish:false},
  {id:'vcca_food',role:'cuisine_association',host:'vcca.vn',homepage:'https://vcca.vn/',
    verifiedLabel:'Hiệp hội Văn hóa Ẩm thực Việt Nam, KHÔNG phải vcca.org.vn',canAutopublish:false},
  {id:'wikivoyage',role:'travel_guide',host:'vi.wikivoyage.org',
    homepage:'https://vi.wikivoyage.org/wiki/Trang_Ch%C3%ADnh',
    verifiedLabel:'Wikivoyage tiếng Việt, cần đối chiếu nguồn',canAutopublish:false},
  {id:'vnexpress_travel',role:'news_discovery',host:'vnexpress.net',homepage:'https://vnexpress.net/du-lich',
    verifiedLabel:'VnExpress RSS du lịch — phát hiện tin, không tự đăng',canAutopublish:false,
    feed:'https://vnexpress.net/rss/du-lich.rss'},
  {id:'tuoitre_travel',role:'news_discovery',host:'tuoitre.vn',homepage:'https://tuoitre.vn/du-lich.htm',
    verifiedLabel:'Tuổi Trẻ RSS du lịch — phát hiện tin, không tự đăng',canAutopublish:false,
    feed:'https://tuoitre.vn/rss/du-lich.rss'},
  {id:'thanhnien_travel',role:'news_discovery',host:'thanhnien.vn',homepage:'https://thanhnien.vn/du-lich.htm',
    verifiedLabel:'Thanh Niên RSS du lịch — feed du-lich.rss mới đúng',canAutopublish:false,
    feed:'https://thanhnien.vn/rss/du-lich.rss'},
  {id:'wikimedia_commons',role:'open_photo',host:'commons.wikimedia.org',
    homepage:'https://commons.wikimedia.org/',
    verifiedLabel:'Ảnh phải xác minh giấy phép/tác giả từng file',canAutopublish:false},
] as const;

export function trustedSourceForUrl(input: string): TrustedSource | null {
  let url: URL;
  try { url = new URL(input); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  const hostname = url.hostname.toLowerCase();
  return TRUSTED_SOURCES.find(source => hostname === source.host ||
    hostname === 'www.' + source.host) ?? null;
}
export const VERIFIED_NEWS_FEEDS = TRUSTED_SOURCES.filter(
  source => source.role === 'news_discovery' && source.feed,
);
