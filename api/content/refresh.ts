import { createHash, timingSafeEqual } from 'node:crypto';
import { dbQuery, json } from '../_lib/auth.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { discoverWikipedia } from '../_lib/discover-content.js';

/**
 * Vercel Cron (at most once/day on Hobby) stages sourced suggestions.
 * This endpoint NEVER publishes uncertain content, replaces old records,
 * calls Gemini for each visitor, or changes the map/taxonomy.
 */
function hasCronAuthorization(request: Request) {
  const secret = process.env.CRON_SECRET ?? '';
  const bearer = request.headers.get('authorization') ?? '';
  if (secret.length < 32 || !bearer.startsWith('Bearer ')) return false;
  const expected = createHash('sha256').update(secret).digest();
  const actual = createHash('sha256').update(bearer.slice(7)).digest();
  return timingSafeEqual(expected, actual);
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    if (!(process.env.CRON_SECRET?.length && process.env.CRON_SECRET.length >= 32)) {
      return json({ error: 'CRON_SECRET chưa được thiết lập; chưa chạy cập nhật.' }, 503);
    }
    if (!hasCronAuthorization(request)) return json({ error: 'Unauthorized' }, 401);
    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10);
    try {
      const started = await dbQuery(
        `INSERT OR IGNORE INTO travel_content_refresh_runs(day_key,state,started_at)
        VALUES (?,'running',?)`, [dayKey,now.toISOString()]);
      if (!started.changes) return json({ ok: true, state: 'already_checked', date: dayKey });
      const provinces = (Object.keys(provincesData) as ProvinceId[])
        .filter(id => id !== 'Truong Sa' && id !== 'Hoang Sa');
      const dayNumber = Math.floor(now.getTime() / 86400000);
      const start = (dayNumber * 3) % provinces.length;
      const batch = Array.from({ length: 3 }, (_, index) => provinces[(start + index) % provinces.length]);
      let checked = 0, staged = 0, failures = 0;
      for (const provinceId of batch) {
        for (const section of ['places','cuisine'] as const) {
          try {
            const discovered = await discoverWikipedia(provinceId, section);
            checked++;
            for (const candidate of discovered) {
              const result = await dbQuery(
                `INSERT OR IGNORE INTO travel_content_versions
                (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,checked_at,created_at)
                VALUES (?,?,?,?,?,'ai_draft',?,'pending',?,?)`,
                [candidate.versionId,candidate.contentId,candidate.provinceId,candidate.section,
                  JSON.stringify(candidate.payload),candidate.sourceRef,now.toISOString(),now.toISOString()],
              );
              staged += result.changes;
            }
          } catch (error) {
            console.warn('[content-refresh] discovery failed', provinceId, section, error);
            failures++;
          }
        }
      }
      const state = failures ? 'partial' : 'completed';
      await dbQuery(
        'UPDATE travel_content_refresh_runs SET state=?,checked=?,staged=?,failures=?,finished_at=? WHERE day_key=?',
        [state,checked,staged,failures,new Date().toISOString(),dayKey]);
      return json({ ok: true, state, date: dayKey, provinces: batch,
        queries: checked, staged, failedQueries: failures,
        published: 0, note: 'Nội dung từ nguồn ngoài đang chờ kiểm chứng, chưa công khai.' });
    } catch (error) {
      console.error('[content-refresh] failed', error);
      return json({ error: 'Không thể chạy cập nhật; dữ liệu đang hiển thị không bị ảnh hưởng.' }, 503);
    }
  },
};
