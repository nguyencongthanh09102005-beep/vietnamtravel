import { loadEnv } from 'vite';
const env=loadEnv('development',process.cwd(),'');
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN',
  'FLICKR_API_KEY','FLICKR_API_COMMERCIAL_APPROVED']) {
  if(process.env[key]===undefined&&env[key]!==undefined)process.env[key]=env[key];
}
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw Error('SAFETY_STOP: local SQLite only');
const args=process.argv.slice(2);
if(args.some(x=>x!=='--list'&&!/^--max=\d+$/.test(x)))
  throw Error('Usage: npm run catalog:image-queue -- --max=25 [--list]');
const { dbQuery,closeLocalDatabase } =
  await import('../.api-test-dist/api/_lib/database.js');
const { quarantineGenericCoreCandidates } =
  await import('../.api-test-dist/api/_lib/core-candidates.js');
const { enqueueImagesForReview } =
  await import('../.api-test-dist/api/_lib/photo-queue.js');
try {
  const cleanup=await quarantineGenericCoreCandidates();
  if(cleanup.rejected||cleanup.imagesRejected)
    console.log('Generic RSS candidates quarantined:',cleanup.rejected,
      'pending images rejected:',cleanup.imagesRejected);
  if(!args.includes('--list')){
    const key=process.env.FLICKR_API_COMMERCIAL_APPROVED==='1'
      ? process.env.FLICKR_API_KEY : undefined;
    if(process.env.FLICKR_API_KEY&&!key)
      console.log('Flickr SKIPPED: requires explicit permission for commercial API use, set FLICKR_API_COMMERCIAL_APPROVED=1 only after approval.');
    const max=Number((args.find(x=>x.startsWith('--max='))??'--max=25').split('=')[1]);
    const result=await enqueueImagesForReview({maxItems:max,flickrApiKey:key});
    console.log('IMAGE REVIEW QUEUE:',result);
  }
  const rows=await dbQuery(
    `SELECT image_id,province_id,section,subject_name,source_kind,license,width,height,
      source_url FROM travel_image_candidates WHERE state='pending'
      ORDER BY province_id,subject_name LIMIT 100`);
  for(const row of rows.rows)
    console.log(row.image_id,row.province_id,row.section,row.subject_name,
      row.source_kind,row.license,row.width+'x'+row.height,String(row.source_url));
  console.log('Image candidates are NOT published. Search result ≠ correct photo; review subject and rights manually.');
}finally{closeLocalDatabase();}
