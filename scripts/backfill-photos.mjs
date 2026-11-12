import { closeLocalDatabase } from '../.api-test-dist/api/_lib/database.js';
import { repairMissingPhotos } from '../.api-test-dist/api/_lib/photo-repair.js';

if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw new Error('SAFETY_STOP: only local SQLite; never modify Production Turso');
const args=process.argv.slice(2);
if(args.length || !args.every(Boolean)) throw new Error('Usage: npm run catalog:photos');
try{
  const summary=await repairMissingPhotos({
    maxItems:350,
    onProgress:(name,status)=>{
      if(status==='updated')console.log('Photo verified:',name);
    },
  });
  console.log('DONE: checked',summary.examined,'new licensed photos:',summary.updated,
    'unavailable:',summary.unavailable,'errors:',summary.errors);
  console.log('Open localhost and return to a province tab to see the changes.');
}finally{closeLocalDatabase();}
