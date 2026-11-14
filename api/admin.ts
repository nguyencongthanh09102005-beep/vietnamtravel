import { randomUUID } from 'node:crypto';
import { dbOne, dbQuery, getRequestAuthSession, json, withinRateLimit } from './_lib/auth.js';
import { archiveLegacyCatalog } from '../src/utils/contentArchive.js';
import { provincesData, type ProvinceId } from '../src/data/provincesData.js';
import { normalizedSubjectKey } from '../src/utils/contentQuality.js';
import { reviewPhotoImage } from './_lib/photo-review.js';
import { generateGeminiText } from './_lib/gemini.js';

type Section = 'places' | 'cuisine';
type Body = Record<string,unknown>;
const catalog = archiveLegacyCatalog().records.filter(row => row.section === 'places' || row.section === 'cuisine');
const legacy = new Map(catalog.map(row => [row.id,row]));
const validProvince = (id:string):id is ProvinceId => Object.hasOwn(provincesData,id) && !['Truong Sa','Hoang Sa'].includes(id);
const bodyObject = (x:unknown):Body => x && typeof x==='object' && !Array.isArray(x) ? x as Body : {};
const text = (x:unknown,max=300) => typeof x==='string' ? x.trim().slice(0,max) : '';
const allowedLicense = (value:string) => /^(CC0(?: 1\.0)?|CC BY(?: [234]\.0)?|CC BY-SA(?: [234]\.0)?|PUBLIC DOMAIN)$/i.test(value);
function sources(value:unknown):string[] {
  if(!Array.isArray(value)) return [];
  return value.filter(x=>typeof x==='string').map(x=>x.trim()).filter(x=>{
    try { const u=new URL(x);return u.protocol==='https:' && !u.username && !u.password && x.length<=600; }
    catch { return false; }
  }).slice(0,6);
}
function independentlySourced(links:string[]):boolean {
  try { return new Set(links.map(x=>{
    const host=new URL(x).hostname.replace(/^(www|m)\./,'').toLowerCase();
    return /(^|\.)(wikipedia|wikidata|wikimedia)\.org$/.test(host)?'wikimedia-group':host;
  })).size>=2; }
  catch { return false; }
}
function draft(value:Body) {
  const provinceId=text(value.provinceId,100),section=text(value.section,20);
  const name=text(value.name,150), description=text(value.description,850), detail=text(value.detail,2400);
  const refs=sources(value.sourceUrls);
  if(!validProvince(provinceId) || !['places','cuisine'].includes(section) ||
     name.length<2 || description.length<10 || !independentlySourced(refs) ||
     (Array.isArray(value.sourceUrls) && value.sourceUrls.length!==refs.length)) return null;
  return {provinceId,section:section as Section,name,description,detail,refs};
}
function catalogPayload(id:string):Body|null {
  const row=legacy.get(id);
  return row ? bodyObject(row.payload) : null;
}
function validId(id:string) { return /^[\w:-]{8,200}$/.test(id); }
async function audit(actor:string,action:string,contentId='',versionId='',reason='') {
  await dbQuery('INSERT INTO travel_admin_audit(audit_id,actor_id,action,content_id,version_id,reason,created_at) VALUES (?,?,?,?,?,?,?)',
    [randomUUID(),actor,action,contentId||null,versionId||null,reason,new Date().toISOString()]);
}
async function approvedContent(id:string) {
  return dbOne('SELECT i.content_id,i.province_id,i.section,i.current_version_id,v.payload_json,v.source_ref FROM travel_content_items i JOIN travel_content_versions v ON v.version_id=i.current_version_id WHERE i.content_id=? AND v.reviewed_status=?',[id,'approved']);
}
function asPublic(row:Body) {
  const payload=bodyObject(JSON.parse(String(row.payload_json)));
  const refs=sources(payload.sourceUrls);
  const sourceRef=text(row.source_ref,600);
  return {id:String(row.content_id),provinceId:String(row.province_id),section:String(row.section),
    versionId:String(row.current_version_id),name:text(payload.name,150),
    description:text(payload.description,850),detail:text(payload.detail,2400),
    image:text(payload.image,2000),imageLicense:text(payload.imageLicense,100),
    imageAttribution:text(payload.imageAttribution,600),
    sourceUrls:refs.length?refs:(sourceRef.startsWith('https://')?[sourceRef]:[])};
}
async function listItems(provinceId:string) {
  const result=await dbQuery('SELECT i.content_id,i.province_id,i.section,i.current_version_id,v.payload_json,v.source_ref FROM travel_content_items i JOIN travel_content_versions v ON v.version_id=i.current_version_id WHERE v.reviewed_status=? ORDER BY i.province_id,i.section,i.content_id LIMIT 1000',['approved']);
  const hidden=await dbQuery('SELECT content_id FROM travel_content_quarantine');
  const archived=new Set(hidden.rows.map(x=>String(x.content_id)));
  const records=new Map<string,ReturnType<typeof asPublic>>();
  for(const row of catalog) {
    if(provinceId && row.provinceId!==provinceId)continue;
    const payload=bodyObject(row.payload);
    records.set(row.id,{id:row.id,provinceId:row.provinceId,section:row.section,
      versionId:'',name:text(payload.name),description:text(payload.description,850),
      detail:text(payload.detail,2400),image:text(payload.image,2000),
      imageLicense:text(payload.imageLicense,100),imageAttribution:text(payload.imageAttribution,600),
      sourceUrls:sources(payload.sourceUrls).length?sources(payload.sourceUrls):sources([payload.sourceUrl])});
  }
  for(const row of result.rows) {
    if(provinceId && String(row.province_id)!==provinceId)continue;
    records.set(String(row.content_id),asPublic(row));
  }
  return [...records.values()].map(x=>({...x,status:archived.has(x.id)?'archived':'published'}));
}
async function summary() {
  const items=await listItems('');
  const pending=await dbQuery("SELECT province_id,COUNT(*) count FROM travel_content_versions WHERE reviewed_status='pending' GROUP BY province_id");
  const errors=await dbQuery("SELECT province_id,COUNT(*) count FROM travel_admin_jobs WHERE state='failed' GROUP BY province_id");
  const photos=await dbQuery("SELECT COUNT(*) count FROM travel_image_candidates WHERE state='pending'");
  const groups=new Map<string,{provinceId:string;name:string;published:number;pending:number;missingImages:number;missingSources:number;missingCredits:number;errors:number}>();
  for(const [id,p] of Object.entries(provincesData)) {
    if(!validProvince(id))continue;
    groups.set(id,{provinceId:id,name:p.name,published:0,pending:0,missingImages:0,missingSources:0,missingCredits:0,errors:0});
  }
  for(const item of items) {
    if(item.status==='archived')continue;
    const p=groups.get(item.provinceId);if(!p)continue;
    p.published++;
    if(!item.image)p.missingImages++;
    else if(!item.imageAttribution || !item.imageLicense)p.missingCredits++;
    if(item.section==='cuisine' && item.sourceUrls.length===0)p.missingSources++;
  }
  for(const row of pending.rows) { const p=groups.get(String(row.province_id));if(p)p.pending=Number(row.count); }
  for(const row of errors.rows) {const p=groups.get(String(row.province_id));if(p)p.errors=Number(row.count);}
  const provinces=[...groups.values()];
  return {provinces,totals:{provinces:provinces.length,published:provinces.reduce((a,p)=>a+p.published,0),
    pending:provinces.reduce((a,p)=>a+p.pending,0),missingImages:provinces.reduce((a,p)=>a+p.missingImages,0),
    missingSources:provinces.reduce((a,p)=>a+p.missingSources,0),
    missingCredits:provinces.reduce((a,p)=>a+p.missingCredits,0),
    pendingPhotos:Number(photos.rows[0]?.count??0)}};
}
async function reviewQueue() {
  const [versions,photos]=await Promise.all([
    dbQuery("SELECT version_id,content_id,province_id,section,payload_json,source_ref,created_at FROM travel_content_versions WHERE reviewed_status='pending' ORDER BY created_at DESC LIMIT 80"),
    dbQuery("SELECT image_id,content_id,province_id,section,subject_name,image_url,source_url,source_kind,license,attribution,width,height FROM travel_image_candidates WHERE state='pending' ORDER BY created_at DESC LIMIT 120"),
  ]);
  return {versions:versions.rows.map(row=>({
    versionId:String(row.version_id),contentId:String(row.content_id),provinceId:String(row.province_id),
    section:String(row.section),payload:bodyObject(JSON.parse(String(row.payload_json))),
    sourceRef:String(row.source_ref??''),createdAt:String(row.created_at),
  })),photos:photos.rows.map(row=>({
    imageId:String(row.image_id),contentId:String(row.content_id),provinceId:String(row.province_id),
    section:String(row.section),subjectName:String(row.subject_name),imageUrl:String(row.image_url),
    sourceUrl:String(row.source_url),sourceKind:String(row.source_kind),license:String(row.license),
    attribution:String(row.attribution),width:Number(row.width),height:Number(row.height),
  }))};
}
async function editOrCreate(body:Body,actor:string) {
  const info=draft(body);
  if(!info)return json({error:'Cần tên, mô tả và ít nhất 2 URL nguồn HTTPS từ 2 website độc lập.'},400);
  const mode=text(body.action,20),id=mode==='create'?'manual_'+randomUUID().replace(/-/g,''):text(body.contentId,200);
  if(!validId(id))return json({error:'Mã nội dung không hợp lệ'},400);
  if(mode==='edit') {
    const existing=await approvedContent(id);
    const original=legacy.get(id);
    const pending=await dbOne("SELECT province_id,section FROM travel_content_versions WHERE content_id=? AND reviewed_status='pending' ORDER BY created_at DESC LIMIT 1",[id]);
    if(!existing&&!original&&!pending)return json({error:'Không tìm thấy mục cần sửa'},404);
    if((existing && (existing.province_id!==info.provinceId || existing.section!==info.section)) ||
       (pending && (pending.province_id!==info.provinceId || pending.section!==info.section)) ||
       (original && (original.provinceId!==info.provinceId || original.section!==info.section)))
      return json({error:'Không được chuyển mục đã có sang tỉnh hoặc loại khác'},409);
    const archived=await dbOne('SELECT content_id FROM travel_content_quarantine WHERE content_id=?',[id]);
    if(archived)return json({error:'Cần khôi phục mục trước khi chỉnh sửa'},409);
  }
  const versionId='admin_v1_'+randomUUID().replace(/-/g,'');
  const previous=mode==='edit'?await approvedContent(id):null;
  const payload=previous ? bodyObject(JSON.parse(String(previous.payload_json))) :
    mode==='edit' ? (catalogPayload(id)??{}) : {};
  const oldPhoto=typeof payload.image==='string'?payload.image:'';
  const rightsOk=oldPhoto && allowedLicense(text(payload.imageLicense,100)) &&
    text(payload.imageAttribution,600) && text(payload.imageCreditUrl,600);
  const next={...payload,image:rightsOk?oldPhoto:'',
    ...(!rightsOk?{imageLicense:'',imageAttribution:'',imageCreditUrl:'',imageStatus:'pending'}:{}),
    name:info.name,description:info.description,detail:info.detail,
    sourceUrl:info.refs[0],sourceUrls:info.refs,editorialReview:'pending'};
  // A manual text edit must never introduce an unreviewed image URL.
  const now=new Date().toISOString();
  await dbQuery("INSERT INTO travel_content_versions(version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,checked_at,created_at) VALUES (?,?,?,?,?,'ai_draft',?,'pending',?,?)",
    [versionId,id,info.provinceId,info.section,JSON.stringify(next),info.refs[0],now,now]);
  if(mode==='edit') await dbQuery("UPDATE travel_content_versions SET reviewed_status='rejected' WHERE content_id=? AND version_id<>? AND reviewed_status='pending'",[id,versionId]);
  await audit(actor,mode,id,versionId);
  return json({ok:true,versionId,contentId:id,status:'pending'});
}
async function moderate(body:Body,actor:string) {
  const versionId=text(body.versionId,120),decision=text(body.decision,20);
  if(!validId(versionId)||!['approve','reject','restore-version'].includes(decision))return json({error:'Thao tác duyệt không hợp lệ'},400);
  const version=await dbOne('SELECT * FROM travel_content_versions WHERE version_id=?',[versionId]);
  if(!version)return json({error:'Không tìm thấy phiên bản'},404);
  const id=String(version.content_id),provinceId=String(version.province_id),section=String(version.section);
  if(!validProvince(provinceId)||!['places','cuisine'].includes(section))return json({error:'Chỉ quản lý địa điểm và ẩm thực'},400);
  const archived=await dbOne('SELECT content_id FROM travel_content_quarantine WHERE content_id=?',[id]);
  if(archived)return json({error:'Nội dung đang bị gỡ, cần khôi phục trước'},409);
  if(decision==='reject') {
    if(version.reviewed_status!=='pending')return json({error:'Chỉ được từ chối phiên bản đang chờ'},409);
    await dbQuery("UPDATE travel_content_versions SET reviewed_status='rejected' WHERE version_id=? AND reviewed_status='pending'",[versionId]);
  } else {
    if(version.reviewed_status!==(decision==='approve'?'pending':'approved'))return json({error:'Trạng thái phiên bản không phù hợp'},409);
    const payload=bodyObject(JSON.parse(String(version.payload_json)));
    const refs=sources(payload.sourceUrls);
    if(!independentlySourced(refs))return json({error:'Chưa đủ hai nguồn độc lập. Hãy sửa nội dung để bổ sung nguồn trước khi duyệt.'},409);
    const image=text(payload.image,2000),license=text(payload.imageLicense,100);
    if(image && (!allowedLicense(license)||!text(payload.imageAttribution,600)||!text(payload.imageCreditUrl,600)))
      return json({error:'Ảnh chưa đủ giấy phép hoặc ghi công'},409);
    const existing=await dbOne('SELECT province_id,section FROM travel_content_items WHERE content_id=?',[id]);
    if(existing && (existing.province_id!==provinceId||existing.section!==section))return json({error:'Xung đột định danh'},409);
    const now=new Date().toISOString();
    if(decision==='approve')await dbQuery("UPDATE travel_content_versions SET reviewed_status='approved' WHERE version_id=? AND reviewed_status='pending'",[versionId]);
    await dbQuery('INSERT INTO travel_content_items(content_id,province_id,section,current_version_id,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(content_id) DO UPDATE SET current_version_id=excluded.current_version_id,updated_at=excluded.updated_at WHERE province_id=excluded.province_id AND section=excluded.section',
      [id,provinceId,section,versionId,now]);
  }
  await audit(actor,decision,id,versionId);
  return json({ok:true,versionId,status:decision});
}
async function toggleArchive(body:Body,actor:string) {
  const id=text(body.contentId,200),action=text(body.action,30),reason=text(body.reason,300);
  if(!validId(id))return json({error:'ID không hợp lệ'},400);
  const record=await approvedContent(id),old=legacy.get(id);
  if(!record&&!old)return json({error:'Không tìm thấy nội dung'},404);
  if(action==='archive') {
    if(reason.length<5)return json({error:'Cần ghi lý do gỡ ít nhất 5 ký tự'},400);
    const provinceId=String(record?.province_id??old?.provinceId),section=String(record?.section??old?.section);
    await dbQuery('INSERT OR IGNORE INTO travel_content_quarantine(content_id,old_version_id,province_id,section,reason,quarantined_at) VALUES (?,?,?,?,?,?)',
      [id,String(record?.current_version_id??'legacy_catalog'),provinceId,section,reason,new Date().toISOString()]);
  } else {
    const removed=await dbQuery('DELETE FROM travel_content_quarantine WHERE content_id=?',[id]);
    if(!removed.changes)return json({error:'Mục này không nằm trong danh sách đã gỡ'},409);
  }
  await audit(actor,action,id,String(record?.current_version_id??''),reason);
  return json({ok:true,contentId:id,status:action==='archive'?'archived':'published'});
}
async function reviewPhoto(body:Body,actor:string) {
  const id=text(body.imageId,100),decision=text(body.decision,20);
  if(!/^photo_[a-f0-9]{44}$/.test(id)||!['approve','reject'].includes(decision))return json({error:'Ảnh hoặc hành động không hợp lệ'},400);
  const photo=await dbOne('SELECT * FROM travel_image_candidates WHERE image_id=? AND state=?',[id,'pending']);
  if(!photo)return json({error:'Ảnh không còn trong hàng chờ'},409);
  const cid=String(photo.content_id),license=String(photo.license);
  const imageUrl=String(photo.image_url),source=String(photo.source_url),attribution=String(photo.attribution);
  let match=false;
  try {
    const u=new URL(imageUrl),origin=new URL(source);
    match=u.protocol==='https:' && origin.protocol==='https:' &&
      ((u.hostname==='upload.wikimedia.org' && u.pathname.startsWith('/wikipedia/commons/') && origin.hostname==='commons.wikimedia.org') ||
       (u.hostname==='live.staticflickr.com' && ['flickr.com','www.flickr.com'].includes(origin.hostname)));
  }catch { /* reject malformed URLs */ }
  if(!allowedLicense(license)||!match||!attribution.trim())return json({error:'Ảnh không đủ thông tin giấy phép và nguồn gốc'},409);
  if(decision==='reject') {
    await dbQuery("UPDATE travel_image_candidates SET state='rejected' WHERE image_id=? AND state='pending'",[id]);
    await audit(actor,'photo_reject',cid,id);
    return json({ok:true,status:'rejected'});
  }
  const core=await dbOne('SELECT candidate_id FROM travel_core_candidates WHERE candidate_id=?',[cid]);
  if(core){
    const result=await reviewPhotoImage(id,decision as 'approve'|'reject');
    if(!result.ok)return json({error:result.reason},409);
    await audit(actor,'core_photo_'+decision,cid,id);
    return json({ok:true,status:result.reason});
  }
  const archived=await dbOne('SELECT content_id FROM travel_content_quarantine WHERE content_id=?',[cid]);
  if(archived)return json({error:'Mục đang bị gỡ'},409);
  const current=await approvedContent(cid),old=legacy.get(cid);
  if(!current&&!old)return json({error:'Không tìm thấy nội dung để gắn ảnh'},409);
  const payload=current?bodyObject(JSON.parse(String(current.payload_json))):bodyObject(old?.payload);
  if(normalizedSubjectKey(String(payload.name??''),String(photo.province_id) as ProvinceId)!==
     normalizedSubjectKey(String(photo.subject_name),String(photo.province_id) as ProvinceId))
    return json({error:'Ảnh không khớp tên chủ thể'},409);
  if(payload.image && String(payload.image).trim())return json({error:'Mục đã có ảnh; cần kiểm tra thủ công trước khi thay'},409);
  const provinceId=String(current?.province_id??old?.provinceId),section=String(current?.section??old?.section);
  const now=new Date().toISOString();
  const vId='admin_photo_'+randomUUID().replace(/-/g,'');
  const replacement={...payload,image:imageUrl,imageStatus:'verified',imageLicense:license,
    imageCreditUrl:source,imageAttribution:attribution};
  await dbQuery("INSERT INTO travel_content_versions(version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,checked_at,created_at) VALUES (?,?,?,?,?,'verified_external',?,'approved',?,?)",
    [vId,cid,provinceId,section,JSON.stringify(replacement),String(current?.source_ref??old?.sourceFile??''),now,now]);
  await dbQuery('INSERT INTO travel_content_items(content_id,province_id,section,current_version_id,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(content_id) DO UPDATE SET current_version_id=excluded.current_version_id,updated_at=excluded.updated_at',
    [cid,provinceId,section,vId,now]);
  await dbQuery("UPDATE travel_image_candidates SET state='approved' WHERE image_id=? AND state='pending'",[id]);
  await audit(actor,'photo_approve',cid,vId);
  return json({ok:true,status:'approved',versionId:vId});
}
async function composeDescription(body:Body) {
  const name=text(body.name,150),description=text(body.description,850),detail=text(body.detail,2400);
  if(!name||description.length<10||!independentlySourced(sources(body.sourceUrls)))
    return json({error:'Cần nội dung có sẵn và hai nguồn độc lập trước khi nhờ AI biên tập.'},400);
  if(!process.env.GEMINI_API_KEY)return json({error:'Chưa có GEMINI_API_KEY trên server'},503);
  const prompt=[
    'Bạn là biên tập viên mô tả du lịch Việt Nam. Chỉ dùng các dữ kiện được cung cấp dưới đây, không truy cập hoặc suy đoán nội dung URL.',
    'Viết đúng 2 đến 3 câu tiếng Việt tự nhiên, súc tích, khách quan, dài tối đa 350 ký tự.',
    'Không chép nguyên câu dài, không tự gán xuất xứ hoặc mức độ nổi tiếng, không thêm địa điểm, lịch sử, số liệu, lời quảng cáo.',
    'Bỏ từ nguyên và chi tiết bách khoa không phục vụ khách du lịch. Chỉ xuất đoạn mô tả, không mở đầu hay Markdown.',
    'Tên: '+name,'Nội dung xác minh do admin cung cấp: '+description,
    'Ghi chú: '+detail.slice(0,1500),
  ].join('\n');
  const output=await generateGeminiText(prompt);
  if(!output)return json({error:'AI không phản hồi. Nội dung hiện tại vẫn được giữ nguyên.'},503);
  const cleaned=output.replace(/[*#`]/g,'').replace(/\s+/g,' ').trim().slice(0,400);
  if(cleaned.length<35)return json({error:'Kết quả AI không đạt yêu cầu, vui lòng tự chỉnh sửa.'},503);
  return json({description:cleaned,status:'pending_editorial_review'});
}
async function enqueueJob(body:Body,actor:string) {
  const provinceId=text(body.provinceId,100),kind=text(body.kind,20);
  if(!validProvince(provinceId)||!['photos','sources'].includes(kind))return json({error:'Tỉnh hoặc loại tác vụ không hợp lệ'},400);
  const dup=await dbOne("SELECT job_id FROM travel_admin_jobs WHERE province_id=? AND kind=? AND state IN ('queued','running')",[provinceId,kind]);
  if(dup)return json({ok:true,jobId:dup.job_id,state:'already_queued'});
  const id=randomUUID();
  await dbQuery("INSERT INTO travel_admin_jobs(job_id,province_id,kind,requested_by,created_at) VALUES (?,?,?,?,?)",
    [id,provinceId,kind,actor,new Date().toISOString()]);
  await audit(actor,'enqueue_'+kind,'','',provinceId);
  return json({ok:true,jobId:id,state:'queued'});
}
export default {
  async fetch(request:Request) {
    if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
    try {
      const emails=(process.env.ADMIN_EMAILS??'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
      if(!emails.length)return json({error:'ADMIN_EMAILS chưa được cấu hình trên server'},503);
      const session=await getRequestAuthSession(request);
      if(!session || !emails.includes(session.user.email.toLowerCase()))return json({error:'Không có quyền quản trị'},403);
      if(request.method==='GET') {
        const u=new URL(request.url),view=u.searchParams.get('view')??'summary';
        if(view==='summary')return json(await summary());
        if(view==='items') {
          const provinceId=u.searchParams.get('provinceId')??'';
          if(provinceId&&!validProvince(provinceId))return json({error:'Tỉnh không hợp lệ'},400);
          return json({items:await listItems(provinceId)});
        }
        if(view==='queue')return json(await reviewQueue());
        if(view==='jobs')return json({jobs:(await dbQuery('SELECT * FROM travel_admin_jobs ORDER BY created_at DESC LIMIT 60')).rows});
        if(view==='history')return json({history:(await dbQuery('SELECT * FROM travel_admin_audit ORDER BY created_at DESC LIMIT 60')).rows});
        return json({error:'View không hợp lệ'},400);
      }
      const origin=request.headers.get('origin');
      if(!origin || new URL(origin).origin!==new URL(request.url).origin ||
         request.headers.get('x-vt-admin')!=='1' ||
         !request.headers.get('content-type')?.startsWith('application/json'))
        return json({error:'Admin request không hợp lệ'},403);
      if(!await withinRateLimit(request,'admin',session.user.id,40,3600))
        return json({error:'Quá nhiều thao tác, vui lòng thử lại sau'},429);
      const raw=await request.text();
      if(raw.length>6000)return json({error:'Nội dung gửi quá lớn'},413);
      const body=bodyObject(JSON.parse(raw)),action=text(body.action,30);
      if(action==='create'||action==='edit')return editOrCreate(body,session.user.id);
      if(action==='moderate')return moderate(body,session.user.id);
      if(action==='archive'||action==='unarchive')return toggleArchive(body,session.user.id);
      if(action==='photo')return reviewPhoto(body,session.user.id);
      if(action==='enqueue')return enqueueJob(body,session.user.id);
      if(action==='compose')return composeDescription(body);
      return json({error:'Thao tác không hỗ trợ'},400);
    } catch(error) {
      console.error('[admin]',error);
      return json({error:'Không thể thực hiện thao tác. Kiểm tra log máy chủ.'},503);
    }
  },
};
