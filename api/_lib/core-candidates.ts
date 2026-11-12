import { createHash } from 'node:crypto';
import { dbQuery, dbOne } from './database.js';
import { trustedSourceForUrl } from '../../src/data/trustedSources.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { isSubjectExcluded, normalizedSubjectKey } from '../../src/utils/contentQuality.js';

export type CoreSection='places'|'cuisine';
export interface CoreEvidence {
  provinceId:ProvinceId; section:CoreSection; name:string; description?:string;
  sourceUrl:string;
}
export interface CoreGate {
  eligible:boolean; reasons:string[]; officialSources:number; newsHosts:number;
}
const digest=(s:string)=>createHash('sha256').update(s).digest('hex').slice(0,40);
function supportedProvince(id:string):id is ProvinceId{
  return Object.hasOwn(provincesData,id) && !['Hoang Sa','Truong Sa'].includes(id);
}
function classifyUrl(url:string){
  const src=trustedSourceForUrl(url);
  if(!src)return null;
  if(!['official_tourism','cuisine_association','travel_guide','news_discovery'].includes(src.role))
    return null;
  return src;
}
/** Upsert by normalized province+section+subject: multiple articles never create
 * multiple public items, and they only add independent provenance references. */
export async function stageCoreCandidate(value:CoreEvidence):
  Promise<{id:string;newEntity:boolean;newReference:boolean}|null>{
  if(!supportedProvince(value.provinceId)||!['places','cuisine'].includes(value.section)||
    typeof value.name!=='string'||value.name.length<3||value.name.length>140||
    isSubjectExcluded(value.name,value.section,value.description??''))return null;
  const source=classifyUrl(value.sourceUrl);
  if(!source)return null;
  const key=normalizedSubjectKey(value.name,value.provinceId);
  if(key.length<3)return null;
  const id='core_'+digest(value.provinceId+'|'+value.section+'|'+key);
  const now=new Date().toISOString();
  const desc=(value.description??'').slice(0,450);
  const created=await dbQuery(
    `INSERT OR IGNORE INTO travel_core_candidates
      (candidate_id,province_id,section,subject_key,name,description,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?)`,
    [id,value.provinceId,value.section,key,value.name,desc,now,now],
  );
  // Source references are strictly append-only, even when multiple news
  // headlines describe the exact same place.
  const reference=await dbQuery(
    `INSERT OR IGNORE INTO travel_core_candidate_sources
      (candidate_id,url,source_id,source_role,independent_host,first_seen_at)
      VALUES (?,?,?,?,?,?)`,
    [id,value.sourceUrl,source.id,source.role,source.host,now],
  );
  return {id,newEntity:created.changes>0,newReference:reference.changes>0};
}
export async function stageRssCoreCandidates(limit=300) {
  const rows=await dbQuery(
    `SELECT source_id,article_url,headline,summary,kind,province_id,subject
     FROM travel_source_leads WHERE review_status='pending'
       AND kind IN ('places','cuisine') AND province_id IS NOT NULL AND length(subject)>2
     ORDER BY first_seen_at LIMIT ?`,
    [Math.max(1,Math.min(limit,1000))],
  );
  const summary={examined:rows.rows.length,newEntities:0,newReferences:0,skipped:0};
  for(const row of rows.rows){
    const provenance=trustedSourceForUrl(String(row.article_url));
    if(!provenance||provenance.id!==row.source_id){summary.skipped++;continue;}
    const result=await stageCoreCandidate({
      provinceId:String(row.province_id) as ProvinceId,
      section:String(row.kind) as CoreSection,
      name:String(row.subject),
      description:String(row.summary), sourceUrl:String(row.article_url),
    });
    if(!result){summary.skipped++;continue;}
    if(result.newEntity)summary.newEntities++;
    if(result.newReference)summary.newReferences++;
  }
  return summary;
}
export async function assessCoreGate(candidateId:string):Promise<CoreGate>{
  const row=await dbOne(
    'SELECT * FROM travel_core_candidates WHERE candidate_id=?',[candidateId]);
  if(!row)return {eligible:false,reasons:['Không tìm thấy ứng viên'],officialSources:0,newsHosts:0};
  const sources=await dbQuery(
    `SELECT source_role,independent_host FROM travel_core_candidate_sources
     WHERE candidate_id=?`,[candidateId]);
  const officialSources=sources.rows.filter(x=>
    ['official_tourism','cuisine_association'].includes(String(x.source_role))).length;
  const newsHosts=new Set(sources.rows.filter(x=>x.source_role==='news_discovery')
    .map(x=>String(x.independent_host))).size;
  const reasons:string[]=[];
  const kind=String(row.section);
  if(!supportedProvince(String(row.province_id))) reasons.push('Tỉnh/thành không hợp lệ');
  if(!['places','cuisine'].includes(kind) ||
      isSubjectExcluded(String(row.name),kind as CoreSection,String(row.description)))
    reasons.push('Sai nhóm nội dung');
  if(officialSources===0&&newsHosts<2)
    reasons.push('Cần nguồn du lịch/ẩm thực có thẩm quyền hoặc hai báo thuộc tổ chức độc lập');
  if(String(row.detail).trim().length<180)
    reasons.push('Thiếu mô tả chi tiết có chứng cứ, không thể chỉ dùng RSS');
  const imageUrl=String(row.image_url??'');
  if(!imageUrl||!String(row.image_license)||!String(row.image_credit_url)||
      Number(row.photo_reviewed)!==1)
    reasons.push('Chưa có ảnh đúng chủ thể được duyệt, ghi nguồn và giấy phép');
  if(String(row.status)==='rejected')reasons.push('Ứng viên đã bị từ chối');
  return {eligible:reasons.length===0,reasons,officialSources,newsHosts};
}

/** Only moves candidates into review-ready state. Publication is deliberately
 * not automatic: news and generic photos need human/entity verification. */
export async function refreshCoreReviewQueue(limit=400){
  const rows=await dbQuery(
    `SELECT candidate_id FROM travel_core_candidates
     WHERE status IN ('pending','ready_for_review') LIMIT ?`,
    [Math.max(1,Math.min(limit,1000))],
  );
  const result={examined:0,ready:0,pending:0};
  for(const row of rows.rows){
    result.examined++;
    const id=String(row.candidate_id);
    const gate=await assessCoreGate(id);
    const status=gate.eligible?'ready_for_review':'pending';
    await dbQuery(
      'UPDATE travel_core_candidates SET status=?,updated_at=? WHERE candidate_id=?',
      [status,new Date().toISOString(),id],
    );
    if(gate.eligible)result.ready++;else result.pending++;
  }
  return result;
}
