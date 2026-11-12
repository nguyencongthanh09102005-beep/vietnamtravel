import { createHash } from 'node:crypto';
import { dbOne, dbQuery } from './database.js';
import { discoverWikipedia, type DiscoveryCandidate } from './discover-content.js';
import { HISTORICAL_PROVINCE_ALIASES } from '../../src/data/historicalProvinceAliases.js';
import { provinceDetailsCatalog } from '../../src/data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';

const UA = 'VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; educational source attribution)';
const SEVEN_DAYS_MS = 7 * 86400000;
type Section = 'places' | 'cuisine';
type Dict = Record<string, unknown>;
export type EnrichmentAssessment = { approved: boolean; reason: string; payload: DiscoveryCandidate['payload'] };

function asRecord(value: unknown): Dict {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Dict : {};
}
function stripHtml(value: unknown): string {
  return typeof value === 'string' ? value.replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ')
    .replace(/&amp;/gi,'&').replace(/&#39;/gi,"'").replace(/&quot;/gi,'"')
    .replace(/\s+/g,' ').trim().slice(0,240) : '';
}
export function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function strongProvinceMention(text: string, provinceId: ProvinceId): boolean {
  const aliases = Object.entries(HISTORICAL_PROVINCE_ALIASES)
    .filter(([,current]) => current === provinceId).map(([old]) => old);
  const province = provinceDetailsCatalog[provinceId].title.replace(/^(Tỉnh|TP\.|Thành phố)\s+/i,'');
  const normalizedText = ' ' + normalized(text.slice(0, 750)) + ' ';
  return [province, ...aliases].some(label => {
    const n = normalized(label);
    return n.length > 3 && normalizedText.includes(' ' + n + ' ');
  });
}
function relevantToSection(title: string, description: string, section: Section) {
  const value = normalized(title + ' ' + description.slice(0,400));
  if (/\b(danh sach|danh muc|du lich|am thuc|kinh te|hanh chinh|giao thong|van hoa|lich su)\b/.test(normalized(title)))
    return false;
  if (section === 'places') return /(di tich|danh lam|thang canh|khu du lich|tham quan|thac|vuon quoc gia|den|chua|lang co|hang|dong|nui|doi|cong vien|bao tang|thanh co|ho|bien|thap|cho noi|bai bien|dao|suoi|khu bao ton|nha tho)/.test(value);
  return /(dac san|mon an|am thuc|banh|nem|chao|com|bun|pho|cha |che |mam|goi|rau|lau|canh|keo|mi |hu tieu|ca kho|thit|tom|bun)/.test(value);
}
async function getJson(url: URL, fetcher: typeof fetch) {
  if (!['vi.wikipedia.org','commons.wikimedia.org'].includes(url.hostname)
    || url.protocol !== 'https:' || url.pathname !== '/w/api.php') throw new Error('NON_ALLOWLISTED_CONTENT_API');
  const response = await fetcher(url.toString(),{
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('CONTENT_EVIDENCE_HTTP_' + response.status);
  const data = await response.text();
  if (data.length > 900_000) throw new Error('EVIDENCE_RESPONSE_TOO_LARGE');
  return JSON.parse(data) as unknown;
}
function wikiUrl(host: string, params: Record<string,string>) {
  const endpoint = new URL('https://' + host + '/w/api.php');
  endpoint.search = new URLSearchParams({action:'query',format:'json',formatversion:'2',...params}).toString();
  return endpoint;
}
function allowedLicense(name: string): boolean {
  const clean = stripHtml(name).toUpperCase().replace(/\s+/g,' ');
  return /^(?:CC0(?: 1\.0)?|CC BY(?: [234]\.0| 4\.0)?|CC BY-SA(?: [234]\.0| 4\.0)?|PUBLIC DOMAIN|PD-OLD|PD-USGOV)$/.test(clean);
}
function commonsFile(url: string): string | null {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.hostname !== 'upload.wikimedia.org' || parsed.protocol !== 'https:') return null;
  const pieces = parsed.pathname.split('/').filter(Boolean);
  const i = pieces.indexOf('thumb');
  // Never accept user-generated paths; image must belong to Commons itself.
  if (pieces[0] !== 'wikipedia' || pieces[1] !== 'commons') return null;
  const name = i >= 0 ? pieces.at(-2) : pieces.at(-1);
  if (!name || !/\.(?:jpe?g|png|webp)$/i.test(decodeURIComponent(name))) return null;
  return decodeURIComponent(name).slice(0,180);
}
export async function assessCandidate(candidate: DiscoveryCandidate,
  fetcher: typeof fetch = fetch): Promise<EnrichmentAssessment> {
  const pending = (reason: string): EnrichmentAssessment => ({approved:false,reason,payload:candidate.payload});
  const { provinceId, section, payload } = candidate;
  if (!strongProvinceMention(payload.detail, provinceId)) return pending('Không nêu rõ tỉnh trong phần giới thiệu');
  if (!relevantToSection(payload.name, payload.description, section)) return pending('Chưa xác định đúng loại nội dung');
  const filename = commonsFile(payload.image);
  if (!filename) return pending('Thiếu ảnh Commons khớp bài viết, không thay bằng banner tỉnh');
  try {
    const pageRequest = wikiUrl('vi.wikipedia.org',{
      titles: payload.name, prop:'pageprops|coordinates|pageimages', pithumbsize:'640', redirects:'1',
    });
    const article = asRecord(await getJson(pageRequest,fetcher));
    const pages = asRecord(article.query).pages;
    const page = Array.isArray(pages) ? asRecord(pages[0]) : {};
    const meta = asRecord(page.pageprops);
    const itemId = typeof meta.wikibase_item === 'string' ? meta.wikibase_item : '';
    const imageName = typeof page.pageimage === 'string' ? page.pageimage : '';
    if (!/^Q\d+$/.test(itemId)) return pending('Bài viết chưa có định danh Wikidata');
    if (Object.hasOwn(meta,'disambiguation')) return pending('Trang định hướng, không phải địa điểm/món ăn');
    if (normalized(String(page.title ?? '')) !== normalized(payload.name))
      return pending('Tiêu đề nguồn không trùng');
    if (!imageName || normalized(imageName) !== normalized(filename))
      return pending('Ảnh không thuộc trang nguồn đã xác minh');
    if (section === 'places' && (!Array.isArray(page.coordinates) || page.coordinates.length === 0))
      return pending('Địa điểm thiếu tọa độ tham chiếu');
    const commons = asRecord(await getJson(wikiUrl('commons.wikimedia.org',{
      titles:'File:' + imageName,prop:'imageinfo',iiprop:'extmetadata|url',iilimit:'1',
    }),fetcher));
    const files = asRecord(commons.query).pages;
    const file = Array.isArray(files) ? asRecord(files[0]) : {};
    const infos = Array.isArray(file.imageinfo) ? file.imageinfo : [];
    const info = asRecord(infos[0]);
    const license = stripHtml(asRecord(asRecord(info.extmetadata).LicenseShortName).value);
    const credit = stripHtml(asRecord(asRecord(info.extmetadata).Artist).value);
    if (!allowedLicense(license)) return pending('Giấy phép ảnh chưa xác minh hoặc không phù hợp');
    if (!credit || credit.length < 2) return pending('Thiếu ghi công tác giả ảnh');
    const creditUrl = String(info.descriptionurl ?? '');
    if (!creditUrl.startsWith('https://commons.wikimedia.org/wiki/File:'))
      return pending('Không có trang nguồn ảnh Commons');
    return {
      approved:true, reason:'Bài viết Wikipedia có Wikidata, vùng liên quan rõ ràng và ảnh Commons có giấy phép phù hợp',
      payload: {
        ...payload,
        image:payload.image,
        imageAttribution:credit + ' · ' + license + ' · ' + creditUrl,
        imageLicense:license,
        wikidataId:itemId,
        ...(section === 'places' ? { coordinates: page.coordinates } : {}),
      },
    };
  } catch (error) {
    console.warn('[auto-enrich] metadata verification failed',candidate.provinceId,candidate.payload.name,error);
    return pending('Không tải được đầy đủ thông tin xác minh');
  }
}

export interface EnrichSummary {
  provinceId: ProvinceId; section: Section;
  found: number; approved: number; pending: number; skipped: boolean; errors: number;
}
export async function enrichSection(provinceId: ProvinceId, section: Section, options: {
  fetcher?: typeof fetch; force?: boolean; now?: Date;
} = {}): Promise<EnrichSummary> {
  const now = options.now ?? new Date();
  const base: EnrichSummary = {provinceId,section,found:0,approved:0,pending:0,skipped:false,errors:0};
  const key = provinceId + ':' + section;
  const last = await dbOne('SELECT checked_at FROM travel_content_enrichment WHERE scan_key=?',[key]);
  if (!options.force && last?.checked_at
    && now.getTime()-Date.parse(String(last.checked_at)) < SEVEN_DAYS_MS) return {...base,skipped:true};
  const fetcher = options.fetcher ?? fetch;
  let candidates: DiscoveryCandidate[];
  try {
    candidates = await discoverWikipedia(provinceId,section,fetcher);
  } catch (error) {
    console.warn('[auto-enrich] discovery failed', provinceId,section,error);
    return {...base,errors:1};
  }
  base.found = candidates.length;
  const oldItems = await dbQuery(
    `SELECT v.payload_json FROM travel_content_items i
    JOIN travel_content_versions v ON i.current_version_id=v.version_id
    WHERE i.province_id=? AND i.section=?`,[provinceId,section]);
  const names = new Set(oldItems.rows.map(row=>{
    try{return normalized(String((JSON.parse(String(row.payload_json)) as {name:string}).name))}catch{return''}
  }));
  for (const candidate of candidates) {
    if (names.has(normalized(candidate.payload.name))) continue;
    const verdict = await assessCandidate(candidate,fetcher);
    const status = verdict.approved ? 'approved' : 'pending';
    const versionId = 'auto_' + createHash('sha256').update(candidate.contentId + JSON.stringify(verdict.payload)).digest('hex').slice(0,48);
    const row = await dbQuery(
      `INSERT OR IGNORE INTO travel_content_versions
       (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,checked_at,created_at)
       VALUES (?,?,?,?,?,'verified_external',?,?,?,?,?)`,
      [versionId,candidate.contentId,provinceId,section,JSON.stringify(verdict.payload),
        candidate.sourceRef,status,now.toISOString(),now.toISOString()]);
    if (!row.changes) continue;
    if (verdict.approved) {
      const active = await dbQuery(
        `INSERT OR IGNORE INTO travel_content_items(content_id,province_id,section,current_version_id,updated_at)
        VALUES (?,?,?,?,?)`,[candidate.contentId,provinceId,section,versionId,now.toISOString()]);
      base.approved += active.changes;
      names.add(normalized(candidate.payload.name));
    } else {
      base.pending++;
    }
  }
  await dbQuery(
    `INSERT INTO travel_content_enrichment(scan_key,checked_at,found,approved,pending)
     VALUES (?,?,?,?,?)
     ON CONFLICT(scan_key) DO UPDATE SET checked_at=excluded.checked_at,
       found=excluded.found,approved=excluded.approved,pending=excluded.pending`,
    [key,now.toISOString(),base.found,base.approved,base.pending]);
  return base;
}

export async function enrichAll(options: {
  provinceIds?: ProvinceId[]; force?: boolean; fetcher?: typeof fetch;
  onProgress?: (summary: EnrichSummary) => void; shouldStop?: () => boolean;
} = {}) {
  const priority: ProvinceId[] = ['Thanh Hoa','Ha Noi','Dong Thap','Ho Chi Minh','Da Nang'];
  const ids = options.provinceIds ?? [
    ...priority, ...(Object.keys(provincesData) as ProvinceId[])
      .filter(id => !priority.includes(id) && id !== 'Truong Sa' && id !== 'Hoang Sa'),
  ];
  const result: EnrichSummary[] = [];
  for (const provinceId of ids) {
    if (options.shouldStop?.()) break;
    for (const section of ['places','cuisine'] as const) {
      if (options.shouldStop?.()) break;
      try {
        const summary = await enrichSection(provinceId,section,{force:options.force,fetcher:options.fetcher});
        result.push(summary);
        options.onProgress?.(summary);
      } catch (error) {
        console.warn('[auto-enrich] unexpected section failure',provinceId,section,error);
        result.push({provinceId,section,found:0,approved:0,pending:0,skipped:false,errors:1});
      }
      // Avoid hammering community API endpoints.
      if (!options.fetcher) await new Promise(resolve=>setTimeout(resolve,600));
    }
  }
  return result;
}
