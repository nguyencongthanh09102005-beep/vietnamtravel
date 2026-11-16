import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after,test } from 'node:test';

const dir=mkdtempSync(join(tmpdir(),'vt-admin-v1-'));
process.env.LOCAL_DB_PATH=join(dir,'admin.sqlite');
process.env.TURSO_DATABASE_URL='';
process.env.TURSO_AUTH_TOKEN='';
process.env.ADMIN_EMAILS='admin@example.test';
const {dbQuery,closeLocalDatabase}=await import('../.api-test-dist/api/_lib/database.js');
const {default:admin}=await import('../.api-test-dist/server/api/admin.js');
const {default:publicContent}=await import('../.api-test-dist/server/api/content.js');
const {archiveLegacyCatalog}=await import('../.api-test-dist/src/utils/contentArchive.js');
after(()=>{closeLocalDatabase();rmSync(dir,{recursive:true,force:true});});

const site='https://site.example.test';
const token='an_admin_local_test_session_token';
const otherToken='regular_session_token';
const sha=value=>createHash('sha256').update(value).digest('hex');
const now=new Date().toISOString();
await dbQuery("INSERT INTO users(id,email,password_hash,display_name,created_at) VALUES (?,?,?,?,?)",
  ['admin001','admin@example.test','unusable-hash','Admin Test',now]);
await dbQuery("INSERT INTO users(id,email,password_hash,display_name,created_at) VALUES (?,?,?,?,?)",
  ['user002','visitor@example.test','unusable-hash','Visitor Test',now]);
await dbQuery("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)",
  [sha(token),'admin001',Math.floor(Date.now()/1000)+86400]);
await dbQuery("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES (?,?,?)",
  [sha(otherToken),'user002',Math.floor(Date.now()/1000)+86400]);

const request=(view='summary',userToken=token)=>new Request(site+'/api/admin?view='+view,
  {headers:{Cookie:'vt_session='+userToken}});
const post=(body,userToken=token,origin=site)=>new Request(site+'/api/admin',
  {method:'POST',headers:{Cookie:'vt_session='+userToken,Origin:origin,
    'X-VT-Admin':'1','Content-Type':'application/json'},body:JSON.stringify(body)});
const submit=async body=>{
  const response=await admin.fetch(post(body));
  return {status:response.status,data:await response.json()};
};
const publicRead=async()=>{
  const response=await publicContent.fetch(new Request(site+'/api/content?provinceId=Son%20La'));
  return (await response.json()).data.data.places;
};
const name='Địa điểm thử nghiệm dành cho admin';
const sourceUrls=['https://vcca.vn/diadiem/dia-diem-test','https://vietnamtourism.gov.vn/dia-diem-test'];
let itemId='',firstVersion='',editVersion='';

test('server denies unauthenticated and non-admin users; blocks cross-site writes',async()=>{
  assert.equal((await admin.fetch(new Request(site+'/api/admin'))).status,403);
  assert.equal((await admin.fetch(request('summary',otherToken))).status,403);
  assert.equal((await admin.fetch(post({action:'create'},token,'https://evil.example'))).status,403);
  const dashboard=await admin.fetch(request());
  assert.equal(dashboard.status,200);
  const data=await dashboard.json();
  assert.equal(data.totals.provinces,34);
});

test('create stays pending; approval requires independent sources',async()=>{
  const bad=await submit({action:'create',provinceId:'Son La',section:'places',name,
    description:'Một địa điểm thử nghiệm có mô tả kiểm tra.',sourceUrls:[sourceUrls[0],sourceUrls[0]]});
  assert.equal(bad.status,400);
  const created=await submit({action:'create',provinceId:'Son La',section:'places',name,
    description:'Một địa điểm thử nghiệm phục vụ kiểm tra quy trình quản trị.',
    detail:'Nội dung thử nghiệm không xuất bản trước khi duyệt.',sourceUrls});
  assert.equal(created.status,200,JSON.stringify(created.data));
  itemId=created.data.contentId;firstVersion=created.data.versionId;
  assert.ok(! (await publicRead()).some(x=>x.name===name));
  const approved=await submit({action:'moderate',decision:'approve',versionId:firstVersion});
  assert.equal(approved.status,200,JSON.stringify(approved.data));
  assert.ok((await publicRead()).some(x=>x.name===name));
});

test('edit creates a new version; older publication remains until manual approval',async()=>{
  const edited=await submit({action:'edit',contentId:itemId,provinceId:'Son La',section:'places',
    name,description:'Bản mô tả đã chỉnh sửa với hai nguồn đối chiếu độc lập.',
    detail:'Nội dung chi tiết được kiểm tra trước khi xuất bản.',sourceUrls});
  assert.equal(edited.status,200,JSON.stringify(edited.data));
  editVersion=edited.data.versionId;
  const versionsResponse=await admin.fetch(request('versions&contentId='+encodeURIComponent(itemId)));
  assert.equal(versionsResponse.status,200);
  assert.ok((await versionsResponse.json()).versions.length>=2);
  assert.ok(!(await publicRead()).some(x=>x.description.includes('đã chỉnh sửa')));
  const accepted=await submit({action:'moderate',decision:'approve',versionId:editVersion});
  assert.equal(accepted.status,200);
  assert.ok((await publicRead()).some(x=>x.description.includes('đã chỉnh sửa')));
  const old=await submit({action:'moderate',decision:'restore-version',versionId:firstVersion});
  assert.equal(old.status,200);
  assert.ok(!(await publicRead()).some(x=>x.description.includes('đã chỉnh sửa')));
});

test('archive and restore never delete version history',async()=>{
  const archived=await submit({action:'archive',contentId:itemId,reason:'Kiểm tra hiển thị trước khi phục hồi'});
  assert.equal(archived.status,200);
  assert.ok(!(await publicRead()).some(x=>x.name===name));
  const restored=await submit({action:'unarchive',contentId:itemId});
  assert.equal(restored.status,200);
  assert.ok((await publicRead()).some(x=>x.name===name));
  const versions=await dbQuery('SELECT COUNT(*) count FROM travel_content_versions WHERE content_id=?',[itemId]);
  assert.ok(Number(versions.rows[0].count)>=2);
});

test('legacy handwritten card can be hidden and unhidden without database migration',async()=>{
  const original=archiveLegacyCatalog().records.find(x=>x.provinceId==='Son La' && x.section==='places');
  assert.ok(original);
  assert.ok((await publicRead()).some(x=>x.name===original.payload.name));
  const removed=await submit({action:'archive',contentId:original.id,reason:'Nội dung gốc cần đối chiếu nguồn'});
  assert.equal(removed.status,200);
  assert.ok(!(await publicRead()).some(x=>x.name===original.payload.name));
  const back=await submit({action:'unarchive',contentId:original.id});
  assert.equal(back.status,200);
  assert.ok((await publicRead()).some(x=>x.name===original.payload.name));
});

test('photo review accepts licensed original image with author credit',async()=>{
  const photoId='photo_'+sha('photo-test').slice(0,44);
  const url='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Example.jpg/900px-Example.jpg';
  const page='https://commons.wikimedia.org/wiki/File:Example.jpg';
  await dbQuery('INSERT INTO travel_image_candidates(image_id,content_id,province_id,section,subject_name,image_url,source_url,source_kind,license,attribution,width,height,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [photoId,itemId,'Son La','places',name,url,page,'commons','CC BY-SA 4.0',
      'Photographer · CC BY-SA 4.0 · '+page,900,600,now]);
  const approved=await submit({action:'photo',imageId:photoId,decision:'approve'});
  assert.equal(approved.status,200,JSON.stringify(approved.data));
  const pub=(await publicRead()).find(x=>x.name===name);
  assert.equal(pub?.image,url);
  assert.match(pub?.imageAttribution??'',/Photographer/);
});

test('province jobs are queued and deduplicated; audit captures admin actions',async()=>{
  const first=await submit({action:'enqueue',provinceId:'Son La',kind:'photos'});
  assert.equal(first.status,200);
  assert.equal(first.data.state,'queued');
  const repeat=await submit({action:'enqueue',provinceId:'Son La',kind:'photos'});
  assert.equal(repeat.status,200);
  assert.equal(repeat.data.state,'already_queued');
  const jobs=await admin.fetch(request('jobs'));
  assert.equal(jobs.status,200);
  assert.equal((await jobs.json()).jobs.length,1);
  const history=await admin.fetch(request('history'));
  assert.equal(history.status,200);
  assert.ok((await history.json()).history.length>=6);
});

test('bulk approve must be explicit and skips invalid source candidates',async()=>{
  const approved=await submit({action:'create',provinceId:'Son La',section:'cuisine',
    name:'Món thử nghiệm được duyệt theo lô',
    description:'Món thử nghiệm chỉ dùng để kiểm chứng quy trình duyệt hàng loạt.',
    sourceUrls});
  assert.equal(approved.status,200);
  const validId=approved.data.versionId;
  const other='admin_v1_invalid_source_test';
  await dbQuery("INSERT INTO travel_content_versions(version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,created_at) VALUES (?,?,?,?,?,'ai_draft',?,'pending',?)",
    [other,'invalid_source_item','Son La','cuisine',JSON.stringify({
      name:'Món chưa đủ nguồn',description:'Chỉ có một bài gợi ý',image:'',sourceUrls:[sourceUrls[0]]
    }),sourceUrls[0],new Date().toISOString()]);
  const denied=await submit({action:'approve-many',versionIds:[validId,other],confirmHumanReview:false});
  assert.equal(denied.status,400);
  const before=await dbQuery('SELECT reviewed_status FROM travel_content_versions WHERE version_id=?',[validId]);
  assert.equal(before.rows[0].reviewed_status,'pending');
  const accepted=await submit({action:'approve-many',versionIds:[validId,other],confirmHumanReview:true});
  assert.equal(accepted.status,200);
  assert.equal(accepted.data.approved,1);
  assert.equal(accepted.data.skipped,1);
  const bad=await dbQuery('SELECT reviewed_status FROM travel_content_versions WHERE version_id=?',[other]);
  assert.equal(bad.rows[0].reviewed_status,'pending');
  assert.equal((await submit({action:'approve-many',versionIds:Array(21).fill(validId),confirmHumanReview:true})).status,400);
});
