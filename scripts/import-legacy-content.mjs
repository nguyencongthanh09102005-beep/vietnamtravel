import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { archiveLegacyCatalog } from '../.api-test-dist/src/utils/contentArchive.js';
import { dbQuery, closeLocalDatabase } from '../.api-test-dist/api/_lib/database.js';

/**
 * Dry-run by default. To import the original manually written catalog into
 * local SQLite run npm run catalog:import -- --apply.
 * Remote Turso imports are never performed by this command.
 */
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
if (process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN || process.env.VERCEL) {
  throw new Error('SAFETY_STOP: this importer is local-only; no remote database is accepted.');
}
if ([...args].some(arg => arg !== '--apply')) throw new Error('Only --apply is supported.');
const archive = archiveLegacyCatalog();
const timestamp = new Date().toISOString();
const backupPath = resolve('.data/backups/catalog-before-import.v1.json');
mkdirSync(dirname(backupPath), { recursive: true });
writeFileSync(backupPath, JSON.stringify(archive, null, 2) + '\n', { flag: 'w' });

console.log('Legacy items:', archive.records.length, 'Backup:', backupPath);
if (!apply) {
  console.log('DRY-RUN. No database changes. Use --apply to import into local SQLite.');
} else {
  let createdVersions = 0;
  let activated = 0;
  try {
    for (const row of archive.records) {
      const payload = JSON.stringify(row.payload);
      const hash = createHash('sha256').update(row.id + ':' + payload).digest('hex');
      const versionId = 'legacy_' + hash;
      const insertedVersion = await dbQuery(
        `INSERT OR IGNORE INTO travel_content_versions
         (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,checked_at,created_at)
         VALUES (?,?,?,?,?,'legacy_manual',?,'approved',?,?)`,
        [versionId,row.id,row.provinceId,row.section,payload,row.sourceFile,timestamp,timestamp],
      );
      createdVersions += insertedVersion.changes;
      const insertedItem = await dbQuery(
        `INSERT OR IGNORE INTO travel_content_items
         (content_id,province_id,section,current_version_id,updated_at) VALUES (?,?,?,?,?)`,
        [row.id,row.provinceId,row.section,versionId,timestamp],
      );
      activated += insertedItem.changes;
    }
    assert.ok(createdVersions >= 0 && activated >= 0);
    console.log('Imported versions:',createdVersions,'New active records:',activated,
      '(existing published records were not overwritten)');
  } finally {
    closeLocalDatabase();
  }
}
