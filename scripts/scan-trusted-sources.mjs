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
  console.log('Only pending source leads were saved. News is NEVER auto-published as a tourist attraction.');
  if(args.includes('--ai')&&!process.env.GEMINI_API_KEY)
    console.log('GEMINI_API_KEY is not set; kept original RSS leads without AI classification.');
}finally{closeLocalDatabase();}
