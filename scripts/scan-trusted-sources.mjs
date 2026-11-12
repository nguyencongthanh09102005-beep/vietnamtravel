import { loadEnv } from 'vite';
import { closeLocalDatabase } from '../.api-test-dist/api/_lib/database.js';
import { scanTrustedNewsFeeds } from '../.api-test-dist/api/_lib/trusted-feeds.js';

const env=loadEnv('development',process.cwd(),'');
for(const key of ['GEMINI_API_KEY','GEMINI_MODEL','GEMINI_FALLBACK_MODEL',
  'TURSO_DATABASE_URL','TURSO_AUTH_TOKEN']) {
  if(process.env[key]===undefined && env[key]!==undefined) process.env[key]=env[key];
}
if(process.env.TURSO_DATABASE_URL||process.env.TURSO_AUTH_TOKEN||process.env.VERCEL)
  throw new Error('SAFETY_STOP: only local SQLite; never modify Production Turso');
const args=process.argv.slice(2);
if(args.some(a=>a!=='--ai'))throw new Error('Usage: npm run catalog:sources -- --ai');
try{
  const result=await scanTrustedNewsFeeds({
    withAi:args.includes('--ai'),
    onFeed:(sourceId,count,error)=>{
      console.log(sourceId,':',error?'ERROR '+error:count+' RSS headlines found');
    },
  });
  console.log('Source scan:',result);
  if(args.includes('--ai')) {
    if(!result.aiConfigured) {
      console.log('AI NOT CONFIGURED: no GEMINI_API_KEY in local environment; all leads remain pending.');
    } else if(result.classified===0) {
      console.log('AI 0: model unavailable, returned unrecognizable JSON or no valid classification. Check Gemini model/API logs.');
    } else {
      console.log('AI classified',result.classified,'stored headlines in',result.aiBatches,
        'requests. Still unclassified:',result.remainingUnclassified);
    }
  }
  console.log('Only pending source leads are stored. RSS news is NEVER auto-published as a tourist attraction.');
}finally{closeLocalDatabase();}
