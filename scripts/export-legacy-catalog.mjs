import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { archiveLegacyCatalog, restoreLegacyCatalog } from '../.api-test-dist/src/utils/contentArchive.js';
import { provinceDetailsCatalog } from '../.api-test-dist/src/data/provinceDetailsData.js';

// Local-only, one-way backup. This command NEVER writes to Turso, Vercel,
// GitHub or the original manually authored TypeScript source.
const archive = archiveLegacyCatalog();
assert.deepEqual(restoreLegacyCatalog(archive), provinceDetailsCatalog,
  'The archive must reconstruct the entire legacy catalog without data loss');
const content = JSON.stringify(archive, null, 2) + '\n';
const sha256 = createHash('sha256').update(content).digest('hex');
const target = resolve('.data/backups/legacy-province-catalog.v1.json');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, content, { flag: 'w' });
const counts = Object.fromEntries(['overview','history','places','cuisine']
  .map(section => [section, archive.records.filter(item => item.section === section).length]));
console.log('Backup lưu tại: ' + target);
console.log('Đã kiểm tra phục hồi đầy đủ: ' + JSON.stringify(counts));
console.log('SHA-256: ' + sha256);
