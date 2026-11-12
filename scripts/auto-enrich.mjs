import { closeLocalDatabase } from '../.api-test-dist/api/_lib/database.js';
import { enrichAll } from '../.api-test-dist/api/_lib/auto-enrich.js';
import { provincesData } from '../.api-test-dist/src/data/provincesData.js';

// This command is intended for local SQLite; no API key or Vercel required.
// Never accidentally write into the user's production Turso database.
if (process.env.TURSO_DATABASE_URL || process.env.TURSO_AUTH_TOKEN || process.env.VERCEL)
  throw new Error('SAFETY_STOP: catalog:enrich operates only on local SQLite.');

const args=process.argv.slice(2);
let provinceId=null,force=false;
for(let i=0;i<args.length;i++){
  if(args[i]==='--force') force=true;
  else if(args[i]==='--province'&&args[i+1]) provinceId=args[++i];
  else throw new Error('Supported options: --province "Thanh Hoa", --force');
}
if(provinceId && !Object.hasOwn(provincesData,provinceId))
  throw new Error('Unknown province ID: '+provinceId+' (example: "Thanh Hoa", "Dong Thap")');

let added=0,review=0,failed=0;
console.log('VietnamTravel: checking tourism sources and licensed photos.');
console.log('This uses local SQLite and keeps the original manual catalog unchanged.');
try {
  const results=await enrichAll({
    ...(provinceId?{provinceIds:[provinceId]}:{}),
    force,
    onProgress:item=>{
      added+=item.approved;
      review+=item.pending;
      failed+=item.errors;
      console.log('  '+item.provinceId+' / '+item.section+
        ': new '+item.approved+', pending '+item.pending+
        ', errors '+item.errors+(item.skipped?' (recent scan skipped)':''));
    },
  });
  console.log('FINISHED: '+results.length+' sections, '+added+
    ' new published entries, '+review+' awaiting review, '+failed+' errors.');
  console.log('Reload the province tab in the browser to see the new entries.');
} finally {
  closeLocalDatabase();
}
