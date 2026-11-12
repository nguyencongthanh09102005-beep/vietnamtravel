import { createHash } from 'node:crypto';

export const OFFICIAL_ADMIN_SNAPSHOT_URL =
  'https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm';
export const OFFICIAL_ADMIN_NEWS_URL = 'https://xaydungchinhsach.chinhphu.vn/sap-nhap.html';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}
function plain(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;|&#160;/gi,' ')
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
    .replace(/\s+/g,' ').trim();
}
export function parseOfficialAdministrativeSnapshot(html: string) {
  if (typeof html !== 'string' || html.length < 150 || html.length > 2_500_000) {
    throw new Error('INVALID_OFFICIAL_SOURCE');
  }
  const body = plain(html);
  const count = body.match(/(?:cả nước có|cả nước còn)\s+(\d{1,2})\s+đơn vị hành chính cấp tỉnh/i);
  if (!count) throw new Error('OFFICIAL_PROVINCE_COUNT_NOT_FOUND');
  const section = body.match(/Chi tiết các tỉnh, thành phố hình thành sau sắp xếp([\s\S]*?)Chính quyền địa phương hình thành sau sắp xếp/i);
  const text = section?.[1] ?? body.slice(0,10000);
  return {
    observedCount: Number(count[1]),
    digest: createHash('sha256').update(normalize(text)).digest('hex'),
    sourceUrl: OFFICIAL_ADMIN_SNAPSHOT_URL,
  };
}
export interface OfficialHeadline {
  title: string;
  url: string;
}
export function parseOfficialProvinceNews(html: string): OfficialHeadline[] {
  if (typeof html !== 'string' || html.length > 2_500_000) throw new Error('INVALID_OFFICIAL_NEWS');
  const results: OfficialHeadline[] = [];
  const seen = new Set<string>();
  const links = html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
  for (const link of links) {
    const title = plain(link[2]);
    const terms = normalize(title);
    if (title.length < 12 || title.length > 220 ||
      !/(sap nhap|sap xep)/.test(terms) ||
      !/(cap tinh|tinh, thanh pho|cac tinh|sap nhap tinh|sap xep tinh)/.test(terms)) continue;
    let url: URL;
    try { url = new URL(link[1].replace(/&amp;/g, '&'), OFFICIAL_ADMIN_NEWS_URL); }
    catch { continue; }
    if (url.protocol !== 'https:' || url.hostname !== 'xaydungchinhsach.chinhphu.vn'
      || !url.pathname.endsWith('.htm')) continue;
    url.search = ''; url.hash = '';
    if (seen.has(url.href)) continue;
    seen.add(url.href);
    results.push({ title, url: url.href });
    if (results.length >= 8) break;
  }
  return results;
}

export async function fetchOfficialDocument(url: string, fetcher: typeof fetch = fetch) {
  if (![OFFICIAL_ADMIN_SNAPSHOT_URL, OFFICIAL_ADMIN_NEWS_URL].includes(url))
    throw new Error('OFFICIAL_URL_NOT_ALLOWLISTED');
  const response = await fetcher(url, {
    headers: {
      'User-Agent': 'VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; admin-change-monitor)',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error('OFFICIAL_SOURCE_HTTP_' + response.status);
  const text = await response.text();
  if (text.length > 2_500_000) throw new Error('OFFICIAL_SOURCE_TOO_LARGE');
  return text;
}
