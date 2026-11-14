import { enqueueImagesForReview } from './photo-queue.js';

/**
 * Legacy name kept for compatibility with old local tooling.
 * SAFETY: This function NEVER attaches images to published content.
 * Previously it directly changed current_version_id; that pathway is disabled.
 */
export interface PhotoRepairSummary {
  examined:number;updated:number;queued:number;unavailable:number;errors:number;
}
export async function repairMissingPhotos(options:{
  fetcher?:typeof fetch;maxItems?:number;
  onProgress?:(name:string,status:'updated'|'unavailable'|'error')=>void;
}={}):Promise<PhotoRepairSummary>{
  const queued=await enqueueImagesForReview({
    fetcher:options.fetcher,maxItems:Math.min(50,Math.max(1,options.maxItems??25)),
    includeLegacy:true,includeOpenverse:false,
  });
  return {examined:queued.checked,updated:0,queued:queued.newImages,
    unavailable:queued.missing,errors:queued.errors.length};
}
