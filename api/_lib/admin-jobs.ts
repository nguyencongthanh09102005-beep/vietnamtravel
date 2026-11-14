import { dbOne, dbQuery } from './database.js';
import { enrichSection } from './auto-enrich.js';
import { enqueueImagesForReview } from './photo-queue.js';
import type { ProvinceId } from '../../src/data/provincesData.js';

/** Process one bounded unit of work. No browser request waits for scraping. */
export async function processNextAdminJob() {
  const row=await dbOne("SELECT * FROM travel_admin_jobs WHERE state='queued' ORDER BY created_at LIMIT 1");
  if(!row)return {state:'idle'};
  const jobId=String(row.job_id),kind=String(row.kind),provinceId=String(row.province_id) as ProvinceId;
  const claim=await dbQuery("UPDATE travel_admin_jobs SET state='running',attempts=attempts+1,started_at=? WHERE job_id=? AND state='queued'",
    [new Date().toISOString(),jobId]);
  if(!claim.changes)return {state:'claimed_elsewhere'};
  let checkpoint:{stage?:string;offset?:number;checked?:number;added?:number;missing?:number}={};
  try { checkpoint=JSON.parse(String(row.result_json??'{}')); }catch {checkpoint={};}
  try {
    if(kind==='photos') {
      const provider=checkpoint.stage==='openverse'?'openverse':'commons';
      const key=process.env.FLICKR_API_COMMERCIAL_APPROVED==='1'?process.env.FLICKR_API_KEY:undefined;
      const report=await enqueueImagesForReview({
        provinceId,includeLegacy:true,provider,includeOpenverse:provider==='openverse',
        flickrApiKey:provider==='commons'?key:undefined,maxItems:1,
        offsetItems:checkpoint.offset??0,
      });
      if(report.errors.length)throw Error(report.errors.join('; ').slice(0,500));
      const stats={stage:provider,offset:(checkpoint.offset??0)+report.visited,
        checked:(checkpoint.checked??0)+report.checked,
        added:(checkpoint.added??0)+report.newImages,
        missing:(checkpoint.missing??0)+report.missing};
      if(report.visited===0 && provider==='commons'){
        await dbQuery("UPDATE travel_admin_jobs SET state='queued',result_json=?,error='' WHERE job_id=?",
          [JSON.stringify({...stats,stage:'openverse',offset:0}),jobId]);
        return {jobId,state:'queued',stage:'openverse'};
      }
      const complete=report.visited===0 && provider==='openverse';
      await dbQuery("UPDATE travel_admin_jobs SET state=?,result_json=?,finished_at=? WHERE job_id=?",
        [complete?'completed':'queued',JSON.stringify(stats),complete?new Date().toISOString():null,jobId]);
      return {jobId,state:complete?'completed':'queued',...stats};
    }
    if(kind==='sources') {
      const section=checkpoint.stage==='cuisine'?'cuisine':'places';
      const report=await enrichSection(provinceId,section,{force:true});
      if(report.errors)throw Error('SOURCE_SCAN_FAILED_'+section);
      const done=section==='cuisine';
      const stats={stage:done?'finished':'cuisine',checked:(checkpoint.checked??0)+report.found,
        added:(checkpoint.added??0)+report.pending};
      await dbQuery('UPDATE travel_admin_jobs SET state=?,result_json=?,finished_at=? WHERE job_id=?',
        [done?'completed':'queued',JSON.stringify(stats),done?new Date().toISOString():null,jobId]);
      return {jobId,state:done?'completed':'queued',...stats};
    }
    throw Error('INVALID_JOB_TYPE');
  }catch(error) {
    const reason=String(error).slice(0,500);
    await dbQuery("UPDATE travel_admin_jobs SET state='failed',error=?,finished_at=? WHERE job_id=?",
      [reason,new Date().toISOString(),jobId]);
    return {jobId,state:'failed',error:reason};
  }
}
