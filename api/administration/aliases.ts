import { createHash, timingSafeEqual } from 'node:crypto';
import { dbQuery, json } from '../_lib/auth.js';
import { provincesData } from '../../src/data/provincesData.js';
import { resolveHistoricalProvince } from '../../src/data/historicalProvinceAliases.js';

/**
 * Dynamic aliases support approved administrative name changes without
 * rewriting old itinerary IDs or the manually authored province list.
 * A new province / new geometry still needs a verified boundary data release.
 */
export default {
  async fetch(request: Request) {
    if (!['GET','POST'].includes(request.method)) return json({error:'Method not allowed'},405);
    try {
      if (request.method === 'GET') {
        const rows = await dbQuery('SELECT alias_name,province_id FROM travel_province_aliases ORDER BY alias_name LIMIT 100');
        const aliases = rows.rows
          .filter(row => typeof row.alias_name === 'string'
            && Object.prototype.hasOwnProperty.call(provincesData,String(row.province_id)))
          .map(row => ({alias:String(row.alias_name),provinceId:String(row.province_id)}));
        const response = json({aliases});
        response.headers.set('Cache-Control','public, max-age=300');
        return response;
      }
      const secret = process.env.CONTENT_REVIEW_SECRET ?? '';
      const header = request.headers.get('authorization') ?? '';
      if (secret.length < 32 || !header.startsWith('Bearer ') ||
        !timingSafeEqual(createHash('sha256').update(secret).digest(),
          createHash('sha256').update(header.slice(7)).digest()))
        return json({error:'Unauthorized'},401);
      const raw = await request.text();
      if (raw.length > 1500) return json({error:'Payload too large'},413);
      const input = JSON.parse(raw) as Record<string,unknown>;
      const alias = typeof input.alias === 'string' ? input.alias.trim() : '';
      const provinceId = typeof input.provinceId === 'string' ? input.provinceId : '';
      const sourceUrl = typeof input.sourceUrl === 'string' ? input.sourceUrl : '';
      if (!alias || alias.length > 100 || !Object.prototype.hasOwnProperty.call(provincesData,provinceId)
        || resolveHistoricalProvince(alias) // Cannot silently override existing historical labels.
        || !/^https:\/\/(?:xaydungchinhsach|vanban|congbao)\.chinhphu\.vn\//.test(sourceUrl))
        return json({error:'Invalid or conflicting historical alias'},400);
      const result = await dbQuery(
        'INSERT OR IGNORE INTO travel_province_aliases(alias_name,province_id,source_url,approved_at) VALUES (?,?,?,?)',
        [alias,provinceId,sourceUrl,new Date().toISOString()]);
      if (!result.changes) return json({error:'Alias already exists; no overwrite performed'},409);
      return json({ok:true,alias,provinceId},201);
    } catch (error) {
      console.warn('[admin aliases] failed',error);
      return json({error:'Không tải được dữ liệu tên tỉnh lịch sử.'},503);
    }
  },
};
