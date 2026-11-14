import { loadEnv } from 'vite';
const env=loadEnv('development',process.cwd(),'');
for(const key of ['TURSO_DATABASE_URL','TURSO_AUTH_TOKEN'])
  if(process.env[key]===undefined && env[key]!==undefined)process.env[key]=env[key];
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw new Error('SAFETY_STOP: local SQLite only; never modify Production Turso');
if(process.argv.slice(2).length)throw new Error('Usage: npm run catalog:photos');
const {closeLocalDatabase}=await import('../.api-test-dist/api/_lib/database.js');
const {repairMissingPhotos}=await import('../.api-test-dist/api/_lib/photo-repair.js');
try {
  const report=await repairMissingPhotos({maxItems:25});
  console.log('LEGACY PHOTO COMMAND: now STAGES review candidates only.');
  console.log('Checked:',report.examined,'pending candidates:',report.queued,
    'unavailable:',report.unavailable,'errors:',report.errors);
  console.log('Nothing is published. Review images with npm run catalog:image-review or the /admin dashboard.');
}finally{closeLocalDatabase();}
