import { createHash, timingSafeEqual } from 'node:crypto';
import { json } from '../_lib/auth.js';
import { processNextAdminJob } from '../_lib/admin-jobs.js';

export default {async fetch(request:Request) {
  if(request.method!=='GET')return json({error:'Method not allowed'},405);
  const secret=process.env.CRON_SECRET??'';
  const supplied=request.headers.get('authorization')??'';
  if(secret.length<32||!supplied.startsWith('Bearer '))return json({error:'Unauthorized'},401);
  if(!timingSafeEqual(createHash('sha256').update(secret).digest(),
    createHash('sha256').update(supplied.slice(7)).digest()))
    return json({error:'Unauthorized'},401);
  try{return json(await processNextAdminJob());}
  catch(error){console.error('[admin-worker]',error);return json({error:'Không xử lý được tác vụ'},503);}
}};
