import { dbQuery } from './database.js';
import { findVerifiedCommonsPhoto, photoVersionId } from './verified-photo.js';
import { AUTO_CONTENT_GATE_VERSION } from '../../src/utils/contentQuality.js';

type Row=Record<string,unknown>;
export interface PhotoRepairSummary {
  examined:number; updated:number; unavailable:number; errors:number;
}
export async function repairMissingPhotos(options:{
  fetcher?:typeof fetch; maxItems?:number;
  onProgress?:(name:string,status:'updated'|'unavailable'|'error')=>void;
}={}):Promise<PhotoRepairSummary>{
  const summary={examined:0,updated:0,unavailable:0,errors:0};
  const limit=Math.max(1,Math.min(500,Math.floor(options.maxItems??120)));
  const rows=await dbQuery(
    `SELECT i.content_id,i.province_id,i.section,i.current_version_id,
            v.payload_json,v.source_ref
      FROM travel_content_items i
      JOIN travel_content_versions v ON v.version_id=i.current_version_id
      WHERE i.current_version_id LIKE 'auto_v2_%'
        AND v.reviewed_status='approved'
        AND i.section IN ('places','cuisine')
      LIMIT ?`,[limit]);
  for(const row of rows.rows as Row[]){
    let payload:Record<string,unknown>;
    try{
      payload=JSON.parse(String(row.payload_json)) as Record<string,unknown>;
      if(!payload || typeof payload!=='object' || Array.isArray(payload))continue;
    }catch{continue;}
    if(payload.taxonomyGateVersion!==AUTO_CONTENT_GATE_VERSION ||
      typeof payload.wikidataId!=='string' ||
      !/^Q\d+$/.test(payload.wikidataId) ||
      (typeof payload.image==='string'&&payload.image.length>0))continue;
    const name=String(payload.name??row.content_id);
    summary.examined++;
    try{
      const photo=await findVerifiedCommonsPhoto({
        wikidataId:payload.wikidataId,
        articleUrl:String(payload.sourceUrl??row.source_ref??''),
        fetcher:options.fetcher??fetch,
      });
      if(!photo){summary.unavailable++;options.onProgress?.(name,'unavailable');continue;}
      const updated={
        ...payload,image:photo.image,imageLicense:photo.imageLicense,
        imageAttribution:photo.imageAttribution,imageCreditUrl:photo.imageCreditUrl,
        imageStatus:'verified',
      };
      const version=photoVersionId(String(row.content_id),updated);
      await dbQuery(
        `INSERT OR IGNORE INTO travel_content_versions
         (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,checked_at,created_at)
         VALUES (?,?,?,?,?,'verified_external',?,'approved',?,?)`,
        [version,String(row.content_id),String(row.province_id),String(row.section),JSON.stringify(updated),
          String(row.source_ref ?? ''),new Date().toISOString(),new Date().toISOString()],
      );
      const change=await dbQuery(
        `UPDATE travel_content_items SET current_version_id=?,updated_at=?
         WHERE content_id=? AND current_version_id=?`,
        [version,new Date().toISOString(),String(row.content_id),String(row.current_version_id)]);
      summary.updated+=change.changes;
      options.onProgress?.(name,change.changes?'updated':'unavailable');
    }catch(error){
      summary.errors++;
      console.warn('[photo-repair] failed:',name,error);
      options.onProgress?.(name,'error');
    }
    if(!options.fetcher)await new Promise(resolve=>setTimeout(resolve,400));
  }
  return summary;
}
