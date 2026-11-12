import { loadEnv } from 'vite';
const env=loadEnv('development',process.cwd(),'');
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN']) {
  if(process.env[key]===undefined&&env[key]!==undefined)process.env[key]=env[key];
}
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw Error('SAFETY_STOP: core candidate staging is LOCAL SQLite only');
const { stageRssCoreCandidates, assessCoreGate, refreshCoreReviewQueue } =
  await import('../.api-test-dist/api/_lib/core-candidates.js');
const { dbQuery,closeLocalDatabase } =
  await import('../.api-test-dist/api/_lib/database.js');
try {
  const staged=await stageRssCoreCandidates();
  const reviewed=await refreshCoreReviewQueue();
  console.log('CORE CANDIDATES:',staged,reviewed);
  const rows=await dbQuery(
    `SELECT candidate_id,province_id,section,name,status FROM travel_core_candidates
     ORDER BY province_id,section,name LIMIT 35`);
  for(const row of rows.rows){
    const gate=await assessCoreGate(String(row.candidate_id));
    console.log(row.province_id,'/',row.section,'-',row.name,'=>',row.status,
      '| gate:',gate.eligible?'ready':gate.reasons.join('; '));
  }
  console.log('All candidates are non-public; NO RSS articles were published.');
} finally {closeLocalDatabase();}
