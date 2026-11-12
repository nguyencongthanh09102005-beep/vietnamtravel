import { loadEnv } from 'vite';
const env=loadEnv('development',process.cwd(),'');
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN']) {
  if(process.env[key]===undefined&&env[key]!==undefined)process.env[key]=env[key];
}
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw Error('SAFETY_STOP: image review is local SQLite only');
const args=process.argv.slice(2);
if(args.length>1||args.some(x=>!/^--(approve|reject)=photo_[a-f0-9]{44}$/.test(x)))
  throw Error('Usage: npm run catalog:image-review [-- --approve=photo_... | --reject=photo_...]');
const { dbQuery,closeLocalDatabase } =
  await import('../.api-test-dist/api/_lib/database.js');
const { reviewPhotoImage }=await import('../.api-test-dist/api/_lib/photo-review.js');
try {
  const actionArg=args[0];
  if(actionArg) {
    const action=actionArg.startsWith('--approve=')?'approve':'reject';
    const imageId=actionArg.split('=')[1];
    const result=await reviewPhotoImage(imageId,action);
    console.log('IMAGE REVIEW:',result);
    if(!result.ok)process.exitCode=1;
  }
  const rows=await dbQuery(
    `SELECT image_id,subject_name,province_id,section,source_url,image_url,license,
      attribution FROM travel_image_candidates WHERE state='pending'
      ORDER BY province_id,subject_name LIMIT 100`);
  console.log('IMAGE CANDIDATES AWAITING HUMAN REVIEW:',rows.rows.length);
  for(const row of rows.rows)
    console.log(row.image_id,row.subject_name,row.province_id,row.section,
      '\\n   image:',row.image_url,'\\n   source:',row.source_url,
      '\\n   license:',row.license,'\\n   attribution:',row.attribution);
  console.log('Check the source and whether the IMAGE ACTUALLY DEPICTS THE SUBJECT before approval.');
  console.log('Approve by explicit image ID; nothing in this queue is auto-published.');
}finally{closeLocalDatabase();}
