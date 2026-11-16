import { loadEnv } from 'vite';
const env=loadEnv('development',process.cwd(),'');
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN'])
  if(process.env[key]===undefined&&env[key]!==undefined)process.env[key]=env[key];
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw Error('SAFETY_STOP: catalog media audit runs only against local SQLite');
if(process.argv.length>2)throw Error('Usage: npm run catalog:media-audit');

const { dbQuery,closeLocalDatabase } =
  await import('../.api-test-dist/api/_lib/database.js');
const { mergeVerifiedContent } =
  await import('../.api-test-dist/server/api/content.js');
const { provincesData } =
  await import('../.api-test-dist/src/data/provincesData.js');

try {
  let missingImages=0,unknownRights=0,missingCulinarySources=0;
  console.log('Province | Places | Foods | Missing photos | Photos without recorded credits | Foods without source | Pending images');
  for(const provinceId of Object.keys(provincesData).filter(id=>!['Hoang Sa','Truong Sa'].includes(id))){
    const active=await dbQuery(
      `SELECT i.content_id,i.section,v.version_id,v.payload_json
       FROM travel_content_items i JOIN travel_content_versions v
       ON v.version_id=i.current_version_id
       WHERE i.province_id=? AND v.reviewed_status='approved'
       AND v.province_id=i.province_id AND v.section=i.section
       AND v.content_id=i.content_id LIMIT 200`,[provinceId]);
    const catalog=mergeVerifiedContent(provinceId,active.rows);
    const cards=[...catalog.data.places,...catalog.data.cuisine];
    const missing=cards.filter(card=>!card.image?.trim()).length;
    const uncredited=cards.filter(card=>card.image?.trim() &&
      !(card.imageAttribution?.trim() && card.imageCreditUrl?.trim())).length;
    const missingSources=catalog.data.cuisine.filter(food=>!food.sourceUrl?.trim()).length;
    const queue=await dbQuery(
      "SELECT COUNT(*) AS total FROM travel_image_candidates WHERE province_id=? AND state='pending'",
      [provinceId]);
    console.log([
      provincesData[provinceId].name,catalog.data.places.length,catalog.data.cuisine.length,
      missing,uncredited,missingSources,Number(queue.rows[0]?.total??0),
    ].join(' | '));
    missingImages+=missing;unknownRights+=uncredited;missingCulinarySources+=missingSources;
  }
  console.log('TOTAL:',{missingImages,photosWithoutRecordedCredits:unknownRights,
    foodsWithoutSource:missingCulinarySources});
  console.log('These are REVIEW COUNTS, not proof that an existing image infringes copyright.');
  console.log('No content is published/deleted; URL accessibility is checked only by opening the website.');
}finally{closeLocalDatabase();}
