import { dbOne, dbQuery } from './database.js';
import { photoVersionId } from './verified-photo.js';
import { normalizedSubjectKey } from '../../src/utils/contentQuality.js';
import type { ProvinceId } from '../../src/data/provincesData.js';

export async function reviewPhotoImage(imageId:string,action:'approve'|'reject'):
  Promise<{ok:boolean;reason:string;attached:boolean}>{
  if(!/^photo_[a-f0-9]{44}$/.test(imageId)||!['approve','reject'].includes(action))
    return {ok:false,reason:'INVALID_REVIEW',attached:false};
  const row=await dbOne('SELECT * FROM travel_image_candidates WHERE image_id=?',[imageId]);
  if(!row||row.state!=='pending')
    return {ok:false,reason:'IMAGE_NOT_PENDING',attached:false};
  const provinceId=String(row.province_id) as ProvinceId;
  const section=String(row.section);
  const contentId=String(row.content_id);
  const matches=(name:string)=>normalizedSubjectKey(name,provinceId)===
    normalizedSubjectKey(String(row.subject_name),provinceId);
  const core=await dbOne('SELECT name,status,image_url FROM travel_core_candidates WHERE candidate_id=?',[contentId]);
  const published=await dbOne(
    `SELECT i.current_version_id,v.payload_json,v.source_ref,v.reviewed_status
     FROM travel_content_items i JOIN travel_content_versions v
     ON v.version_id=i.current_version_id
     WHERE i.content_id=? AND i.province_id=? AND i.section=?`,
    [contentId,provinceId,section],
  );
  if(!core&&!published)return {ok:false,reason:'NO_LINKED_ENTITY',attached:false};
  const original=published ? JSON.parse(String(published.payload_json)) as Record<string,unknown> : null;
  if(core && !matches(String(core.name)))return {ok:false,reason:'SUBJECT_MISMATCH',attached:false};
  if(core && !['pending','ready_for_review'].includes(String(core.status)))
    return {ok:false,reason:'CORE_ITEM_NOT_REVIEWABLE',attached:false};
  if(!core && original && (!matches(String(original.name))||
    original.taxonomyGateVersion!==2||original.image||
    published?.reviewed_status!=='approved'))
    return {ok:false,reason:'SOURCE_VERSION_CHANGED',attached:false};
  if(action==='reject'){
    const updated=await dbQuery(
      "UPDATE travel_image_candidates SET state='rejected' WHERE image_id=? AND state='pending'",
      [imageId]);
    return {ok:updated.changes===1,reason:'REJECTED',attached:false};
  }
  const approved=await dbQuery(
    "UPDATE travel_image_candidates SET state='approved' WHERE image_id=? AND state='pending'",
    [imageId]);
  if(!approved.changes)return {ok:false,reason:'ALREADY_REVIEWED',attached:false};
  if(core){
    const updated=await dbQuery(
      `UPDATE travel_core_candidates
       SET image_url=?,image_license=?,image_credit_url=?,
           image_attribution=?,photo_reviewed=1,updated_at=?
       WHERE candidate_id=? AND status IN ('pending','ready_for_review')`,
      [String(row.image_url),String(row.license),String(row.source_url),
        String(row.attribution),new Date().toISOString(),contentId],
    );
    return {ok:updated.changes===1,reason:'APPROVED_FOR_CORE_REVIEW',attached:updated.changes===1};
  }
  if(!original||!published)return {ok:false,reason:'NO_VERSION',attached:false};
  const newPayload={
    ...original,image:String(row.image_url),imageLicense:String(row.license),
    imageCreditUrl:String(row.source_url),
    imageAttribution:String(row.attribution),imageStatus:'verified',
  };
  const versionId=photoVersionId(contentId,newPayload);
  const now=new Date().toISOString();
  await dbQuery(
    `INSERT OR IGNORE INTO travel_content_versions
      (version_id,content_id,province_id,section,payload_json,source_kind,
       source_ref,reviewed_status,checked_at,created_at)
     VALUES (?,?,?,?,?,'verified_external',?,'approved',?,?)`,
    [versionId,contentId,provinceId,section,JSON.stringify(newPayload),
      String(published.source_ref??''),now,now],
  );
  const switched=await dbQuery(
    'UPDATE travel_content_items SET current_version_id=?,updated_at=? WHERE content_id=? AND current_version_id=?',
    [versionId,now,contentId,String(published.current_version_id)],
  );
  return {ok:switched.changes===1,reason:'APPROVED_VERSIONED_PHOTO',attached:switched.changes===1};
}
