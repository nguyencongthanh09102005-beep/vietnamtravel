import { createHash, timingSafeEqual } from 'node:crypto';
import { dbOne, dbQuery, json } from '../_lib/auth.js';
import { provincesData } from '../../src/data/provincesData.js';

/**
 * Internal moderation API for candidates; it is never accessible with a user
 * session or CRON_SECRET. Requires a separate, 32+ char CONTENT_REVIEW_SECRET.
 */
function authorized(request: Request) {
  const secret = process.env.CONTENT_REVIEW_SECRET ?? '';
  const bearer = request.headers.get('authorization') ?? '';
  if (secret.length < 32 || !bearer.startsWith('Bearer ')) return false;
  return timingSafeEqual(createHash('sha256').update(secret).digest(),
    createHash('sha256').update(bearer.slice(7)).digest());
}
export default {
  async fetch(request: Request) {
    if (!['GET','POST'].includes(request.method)) return json({ error: 'Method not allowed' },405);
    if (!process.env.CONTENT_REVIEW_SECRET || process.env.CONTENT_REVIEW_SECRET.length < 32)
      return json({ error: 'Review API not configured' },503);
    if (!authorized(request)) return json({ error: 'Unauthorized' },401);
    try {
      if (request.method === 'GET') {
        const status = new URL(request.url).searchParams.get('status') === 'approved' ? 'approved' : 'pending';
        const rows = await dbQuery(
          'SELECT version_id,content_id,province_id,section,source_ref,payload_json,created_at FROM travel_content_versions WHERE reviewed_status=? ORDER BY created_at DESC LIMIT 50',
          [status]);
        return json({ items: rows.rows.map(row => ({
          versionId: row.version_id, contentId: row.content_id, provinceId: row.province_id,
          section: row.section, sourceUrl: row.source_ref, payload: JSON.parse(String(row.payload_json)),
          createdAt: row.created_at,
        })) });
      }
      const raw = await request.text();
      if (raw.length > 2000) return json({ error: 'Request too large' },413);
      const body = JSON.parse(raw) as { versionId?: unknown; action?: unknown };
      const versionId = typeof body.versionId === 'string' ? body.versionId : '';
      const action = body.action;
      if (!/^[a-zA-Z0-9_-]{8,100}$/.test(versionId) || !['approve','reject','restore'].includes(String(action)))
        return json({ error: 'Invalid review request' },400);
      const item = await dbOne(
        'SELECT version_id,content_id,province_id,section,reviewed_status,source_ref FROM travel_content_versions WHERE version_id=?',
        [versionId]);
      if (!item || !Object.prototype.hasOwnProperty.call(provincesData,String(item.province_id)))
        return json({ error: 'Version not found' },404);
      if (action === 'reject') {
        if (item.reviewed_status !== 'pending') return json({ error: 'Cannot reject a published version' },409);
        await dbQuery('UPDATE travel_content_versions SET reviewed_status=? WHERE version_id=? AND reviewed_status=?',
          ['rejected',versionId,'pending']);
        return json({ ok:true, status:'rejected', versionId });
      }
      // Approval/restore requires an actual source URL. A human must inspect
      // historical accuracy, location and image license before calling this.
      if (action === 'approve' && item.reviewed_status !== 'pending')
        return json({ error:'Version not pending' },409);
      if (action === 'restore' && item.reviewed_status !== 'approved')
        return json({ error:'Restore only an approved historical version' },409);
      if (action === 'approve' && !(String(item.source_ref ?? '').startsWith('https://')))
        return json({ error:'Missing source reference' },400);
      const existing = await dbOne('SELECT province_id,section FROM travel_content_items WHERE content_id=?',
        [String(item.content_id)]);
      if (existing && (existing.province_id !== item.province_id || existing.section !== item.section))
        return json({ error:'Conflicting destination identity' },409);
      if (action === 'approve') {
        await dbQuery('UPDATE travel_content_versions SET reviewed_status=? WHERE version_id=? AND reviewed_status=?',
          ['approved',versionId,'pending']);
      }
      await dbQuery(
        `INSERT INTO travel_content_items(content_id,province_id,section,current_version_id,updated_at)
         VALUES (?,?,?,?,?)
         ON CONFLICT(content_id) DO UPDATE SET current_version_id=excluded.current_version_id,
         updated_at=excluded.updated_at
         WHERE province_id=excluded.province_id AND section=excluded.section`,
        [String(item.content_id),String(item.province_id),String(item.section),versionId,new Date().toISOString()]);
      return json({ ok:true, status:action === 'approve' ? 'approved' : 'restored', versionId });
    } catch (error) {
      console.error('[content-review]', error);
      return json({ error:'Review could not be completed' },503);
    }
  },
};
