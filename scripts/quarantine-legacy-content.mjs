import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { dbQuery, closeLocalDatabase } from '../.api-test-dist/api/_lib/database.js';

// Never touch Turso or Production. Keep archived source versions permanently.
// Default dry-run; append -- --apply to deactivate old auto publications.
if (process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN || process.env.VERCEL)
  throw new Error('SAFETY_STOP: this content cleanup is local SQLite only');
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--apply')) throw new Error('Only --apply is supported');
const apply = args.includes('--apply');
try {
  const rows = await dbQuery(
    `SELECT i.content_id,i.province_id,i.section,i.current_version_id,v.payload_json
     FROM travel_content_items i
     JOIN travel_content_versions v ON v.version_id=i.current_version_id
     WHERE i.current_version_id LIKE 'auto_%'
       AND i.current_version_id NOT LIKE 'auto_v2_%'
     ORDER BY i.province_id,i.section,i.content_id`,
  );
  const entries = rows.rows.map(row=>({
    contentId: String(row.content_id),
    provinceId: String(row.province_id),
    section: String(row.section),
    versionId: String(row.current_version_id),
    originalPayload: JSON.parse(String(row.payload_json)),
  }));
  console.log('Unverified auto-publications to quarantine:', entries.length);
  for (const item of entries.slice(0,30)) {
    console.log(' ',item.provinceId,item.section,'—',item.originalPayload?.name ?? item.contentId);
  }
  if (entries.length>30) console.log(' ...and',entries.length-30,'more entries');
  if (apply) {
    const backup = resolve('.data/backups/legacy-auto-content-quarantine.json');
    const contents=JSON.stringify({
      at:new Date().toISOString(),
      reason:'Old keyword-only search classifier published non-tourism topics',
      entries,
    },null,2)+'\n';
    mkdirSync(dirname(backup),{recursive:true});
    writeFileSync(backup,contents);
    console.log('Backup:',backup);
    console.log('SHA-256:',createHash('sha256').update(contents).digest('hex'));
    let quarantined=0;
    for (const item of entries) {
      await dbQuery(
        `INSERT OR IGNORE INTO travel_content_quarantine
         (content_id,old_version_id,province_id,section,reason,quarantined_at)
         VALUES (?,?,?,?,?,?)`,
        [item.contentId,item.versionId,item.provinceId,item.section,
         'Needs taxonomy re-verification',new Date().toISOString()],
      );
      const removed=await dbQuery(
        `DELETE FROM travel_content_items
         WHERE content_id=? AND current_version_id=?`,
        [item.contentId,item.versionId]);
      quarantined+=removed.changes;
    }
    console.log('Quarantined:',quarantined,'Records remain intact in travel_content_versions.');
    console.log('Existing hand-written cards immediately remain visible as fallback.');
  } else {
    console.log('DRY RUN: nothing changed. Use npm run catalog:quarantine -- --apply');
  }
} finally {
  closeLocalDatabase();
}
