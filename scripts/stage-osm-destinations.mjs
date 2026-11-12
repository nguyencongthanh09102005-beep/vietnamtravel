import { loadEnv } from 'vite';
const env=loadEnv('development',process.cwd(),'');
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN']){
  if(process.env[key]===undefined&&env[key]!==undefined)process.env[key]=env[key];
}
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw Error('SAFETY_STOP: external geodata staging is LOCAL SQLite only');
const args=process.argv.slice(2);
const usage='Usage: npm run catalog:osm -- --province "Can Tho" OR npm run catalog:osm -- --all';
if(!((args.length===2 && args[0]==='--province'&&args[1]) ||
     (args.length===1&&args[0]==='--all')))throw Error(usage);
const {provincesData}=await import('../.api-test-dist/src/data/provincesData.js');
const {closeLocalDatabase}=await import('../.api-test-dist/api/_lib/database.js');
const {stageOsmProvince}=await import('../.api-test-dist/api/_lib/osm-seeding.js');
const chosen=args[0]==='--all'
  ? Object.keys(provincesData).filter(x=>!['Hoang Sa','Truong Sa'].includes(x))
  : [args[1]];
for(const province of chosen){
  if(!Object.hasOwn(provincesData,province) ||['Hoang Sa','Truong Sa'].includes(province))
    throw Error('Unknown province ID: '+province);
}
try {
  console.log('OpenStreetMap geodata © OpenStreetMap contributors — ODbL');
  console.log('Sources are STAGED ONLY. No new cards are published or images copied.');
  const counts={provinces:0,fetched:0,newEntities:0,failures:0};
  for(const province of chosen){
    try{
      const result=await stageOsmProvince(province);
      counts.provinces++;
      counts.fetched+=result.fetched;
      counts.newEntities+=result.newEntities;
      console.log('OSM:',result);
      if(result.fetched===0)console.log('No matched OSM objects or 2025 province boundary not updated:',province);
    }catch(error){
      counts.failures++;
      console.log('OSM ERROR',province,String(error).slice(0,160));
    }
    if(chosen.length>1) await new Promise(resolve=>setTimeout(resolve,5500));
  }
  console.log('DONE',counts);
  console.log('Next: npm run catalog:core-stage (review-only; still needs official verification and approved photos)');
}finally{closeLocalDatabase();}
