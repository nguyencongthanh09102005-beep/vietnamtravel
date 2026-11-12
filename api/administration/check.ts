import { createHash, timingSafeEqual } from 'node:crypto';
import { dbOne, dbQuery, json } from '../_lib/auth.js';
import { provincesData } from '../../src/data/provincesData.js';
import {
  fetchOfficialDocument, parseOfficialAdministrativeSnapshot, parseOfficialProvinceNews,
  OFFICIAL_ADMIN_SNAPSHOT_URL, OFFICIAL_ADMIN_NEWS_URL,
} from '../_lib/official-admin.js';

/**
 * Reads government sources and stages possible changes for verification.
 * Never alters province ids, saved travel plans, map SVG or current content.
 */
function cronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET ?? '';
  const header = request.headers.get('authorization') ?? '';
  if (secret.length < 32 || !header.startsWith('Bearer ')) return false;
  return timingSafeEqual(
    createHash('sha256').update(secret).digest(),
    createHash('sha256').update(header.slice(7)).digest(),
  );
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return json({ error:'Method not allowed' },405);
    if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 32)
      return json({ error:'CRON_SECRET chưa được thiết lập.' },503);
    if (!cronAuthorized(request)) return json({ error:'Unauthorized' },401);
    const dayKey = new Date().toISOString().slice(0,10);
    try {
      const existing = await dbOne(
        "SELECT observed_count,observed_hash FROM travel_admin_checks WHERE state='completed' ORDER BY day_key DESC LIMIT 1",
      );
      const started = await dbQuery(
        "INSERT OR IGNORE INTO travel_admin_checks(day_key,observed_count,observed_hash,state,checked_at) VALUES (?,0,'','running',?)",
        [dayKey,new Date().toISOString()]);
      if (!started.changes) return json({ ok:true, state:'already_checked', date:dayKey });
      const source = await fetchOfficialDocument(OFFICIAL_ADMIN_SNAPSHOT_URL);
      const snapshot = parseOfficialAdministrativeSnapshot(source);
      const nextCandidates: Array<{ category: string; title: string; sourceUrl: string }> = [];
      const knownCount = Object.keys(provincesData).length - 2; // island groups aren't provinces
      if (snapshot.observedCount !== knownCount) {
        nextCandidates.push({ category:'count_mismatch',
          title:'Nguồn chính thức nêu ' + snapshot.observedCount + ' tỉnh/thành; dữ liệu hiện tại có ' + knownCount,
          sourceUrl:OFFICIAL_ADMIN_SNAPSHOT_URL });
      }
      if (existing?.observed_hash && String(existing.observed_hash) !== snapshot.digest) {
        nextCandidates.push({ category:'source_changed',
          title:'Nội dung danh sách hành chính của nguồn chính thức đã thay đổi',
          sourceUrl:OFFICIAL_ADMIN_SNAPSHOT_URL });
      }
      let newsFetched = true;
      try {
        const news = await fetchOfficialDocument(OFFICIAL_ADMIN_NEWS_URL);
        for (const item of parseOfficialProvinceNews(news)) {
          nextCandidates.push({ category:'official_news', title:item.title, sourceUrl:item.url });
        }
      } catch (error) {
        newsFetched = false;
        console.warn('[admin-watch] official news index unavailable',error);
      }
      let newlyStaged = 0;
      for (const item of nextCandidates) {
        const id = createHash('sha256')
          .update(item.category + '|' + item.title + '|' + item.sourceUrl).digest('hex');
        const inserted = await dbQuery(
          `INSERT OR IGNORE INTO travel_admin_candidates(id,category,title,source_url,state,discovered_at)
          VALUES (?,?,?,?,'pending',?)`,
          [id,item.category,item.title.slice(0,250),item.sourceUrl,new Date().toISOString()]);
        newlyStaged += inserted.changes;
      }
      await dbQuery(
        'UPDATE travel_admin_checks SET observed_count=?,observed_hash=?,state=?,checked_at=? WHERE day_key=?',
        [snapshot.observedCount,snapshot.digest,'completed',new Date().toISOString(),dayKey]);
      return json({ ok:true, date:dayKey, state:'completed', observedCount:snapshot.observedCount,
        existingCount:knownCount, officialNewsFetched:newsFetched, newCandidates:newlyStaged,
        appliedChanges:0, note:'Địa giới và liên kết lịch trình không bị sửa khi chưa có đối chiếu pháp lý và dữ liệu bản đồ.' });
    } catch (error) {
      console.error('[admin-watch] error',error);
      await dbQuery('UPDATE travel_admin_checks SET state=?,checked_at=? WHERE day_key=?',
        ['failed',new Date().toISOString(),dayKey]).catch(()=>undefined);
      return json({ error:'Không thể kiểm tra nguồn hành chính. Dữ liệu cũ vẫn giữ nguyên.' },503);
    }
  },
};
