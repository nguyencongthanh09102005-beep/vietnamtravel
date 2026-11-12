import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { after,test } from 'node:test';

const root=mkdtempSync(join(tmpdir(),'vt-core-stage-'));
process.env.LOCAL_DB_PATH=join(root,'catalog.sqlite');
process.env.TURSO_DATABASE_URL='';
process.env.TURSO_AUTH_TOKEN='';
const { dbQuery,closeLocalDatabase }=await import('../.api-test-dist/api/_lib/database.js');
const { stageCoreCandidate,stageRssCoreCandidates,assessCoreGate,refreshCoreReviewQueue }=
  await import('../.api-test-dist/api/_lib/core-candidates.js');
const { enqueueImagesForReview,searchCommonsImageCandidates,searchFlickrImageCandidates }=
  await import('../.api-test-dist/api/_lib/photo-queue.js');
const { reviewPhotoImage }=await import('../.api-test-dist/api/_lib/photo-review.js');
after(()=>{closeLocalDatabase();rmSync(root,{recursive:true,force:true});});

let candidateId='';
const commonsImg='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Don_Quang_Ngai.jpg/900px-Don_Quang_Ngai.jpg';
const flickrImg='https://live.staticflickr.com/12345/98765_abcd_c.jpg';
const fetcher=async url=>{
  const p=new URL(url);
  if(p.hostname==='commons.wikimedia.org'){
    if(p.searchParams.get('list')==='search')return Response.json({query:{search:[
      {ns:6,title:'File:Don Quang Ngai.jpg'},
      {ns:0,title:'This is not a file'},
      {ns:6,title:'File:Invalid.svg'},
    ]}});
    assert.equal(p.searchParams.get('titles'),'File:Don Quang Ngai.jpg');
    return Response.json({query:{pages:[{
      title:'File:Don Quang Ngai.jpg',
      imageinfo:[{thumburl:commonsImg,width:1200,height:800,
        descriptionurl:'https://commons.wikimedia.org/wiki/File:Don_Quang_Ngai.jpg',
        extmetadata:{LicenseShortName:{value:'CC BY-SA 4.0'},Artist:{value:'Photographer Commons'}}}],
    }]}});
  }
  if(p.hostname==='www.flickr.com'){
    assert.equal(p.searchParams.get('license'),'4,5,9,11,12');
    assert.equal(p.searchParams.get('method'),'flickr.photos.search');
    return Response.json({stat:'ok',photos:{photo:[
      {id:'111',owner:'123@N01',ownername:'NC photo',license:2,url_c:flickrImg,width_c:'1024',height_c:'800'},
      {id:'222',owner:'123@N01',ownername:'Licensed photographer',license:4,
        url_c:flickrImg,width_c:'1024',height_c:'768'},
    ]}});
  }
  throw Error('Unexpected test host '+p.hostname);
};

test('dedupe the same regional dish and append sources, never publish RSS cards',async()=>{
  const first=await stageCoreCandidate({provinceId:'Quang Ngai',section:'cuisine',
    name:'Don Quảng Ngãi',description:'Món don Quảng Ngãi',
    sourceUrl:'https://vcca.vn/am-thuc/don-quang-ngai'});
  assert.equal(first?.newEntity,true);
  candidateId=first.id;
  const second=await stageCoreCandidate({provinceId:'Quang Ngai',section:'cuisine',
    name:'Don (món ăn)',description:'Don là món ăn địa phương',
    sourceUrl:'https://vnexpress.net/du-lich/don-123.html'});
  assert.equal(second?.newEntity,false);
  assert.equal(second?.id,candidateId);
  assert.equal(second?.newReference,true);
  assert.equal((await stageCoreCandidate({provinceId:'Lao Cai',section:'cuisine',
    name:'Người Dao',sourceUrl:'https://vnexpress.net/du-lich/nguoi-dao.html'})),null);
  assert.equal((await stageCoreCandidate({provinceId:'Quang Ngai',section:'cuisine',
    name:'Don Quảng Ngãi',sourceUrl:'https://vcca.org.vn/food/don'})),null);
  await dbQuery("INSERT INTO travel_source_leads (lead_id,source_id,article_url,headline,summary,kind,province_id,subject,first_seen_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ['rss_001','tuoitre_travel','https://tuoitre.vn/du-lich/don-123.html',
      'Don Quảng Ngãi','Món don là đặc sản Quảng Ngãi','cuisine','Quang Ngai','Don Quảng Ngãi',new Date().toISOString()]);
  const rss=await stageRssCoreCandidates();
  assert.equal(rss.newEntities,0);
  assert.equal(rss.newReferences,1);
  const references=await dbQuery('SELECT COUNT(*) AS count FROM travel_core_candidate_sources WHERE candidate_id=?',[candidateId]);
  assert.equal(references.rows[0].count,3);
  const gate=await assessCoreGate(candidateId);
  assert.equal(gate.eligible,false);
  assert.equal(gate.officialSources,1);
  assert.equal(gate.newsHosts,2);
  const published=await dbQuery('SELECT COUNT(*) AS total FROM travel_content_items');
  assert.equal(published.rows[0].total,0);
});

test('Commons and Flickr candidates are license filtered and never selected automatically',async()=>{
  const commons=await searchCommonsImageCandidates({subject:'Don Quảng Ngãi',province:'Quảng Ngãi',fetcher});
  assert.equal(commons.length,1);
  assert.equal(commons[0].sourceKind,'commons');
  const flickr=await searchFlickrImageCandidates({subject:'Don Quảng Ngãi',province:'Quảng Ngãi',
    apiKey:'test-key',fetcher});
  assert.equal(flickr.length,1,'Non-commercial CC BY-NC must not be accepted');
  assert.equal(flickr[0].license,'CC BY 2.0');
  assert.equal((await searchFlickrImageCandidates({subject:'Don Quảng Ngãi',province:'Quảng Ngãi',fetcher})).length,0);
  const queue=await enqueueImagesForReview({fetcher,flickrApiKey:'test-key'});
  assert.equal(queue.checked,1);
  assert.equal(queue.newImages,2);
  const rows=await dbQuery('SELECT image_id,source_kind,state FROM travel_image_candidates ORDER BY source_kind');
  assert.equal(rows.rows.length,2);
  assert.ok(rows.rows.every(row=>row.state==='pending'));
});

test('review attaches a chosen image and gates ready status without public exposure',async()=>{
  const rows=await dbQuery("SELECT image_id FROM travel_image_candidates WHERE source_kind='commons'");
  const id=String(rows.rows[0].image_id);
  assert.equal((await reviewPhotoImage(id,'approve')).attached,true);
  const repeated=await reviewPhotoImage(id,'approve');
  assert.equal(repeated.ok,false);
  const flickrRows=await dbQuery("SELECT image_id FROM travel_image_candidates WHERE source_kind='flickr'");
  const rejected=await reviewPhotoImage(String(flickrRows.rows[0].image_id),'reject');
  assert.equal(rejected.ok,true);
  let gate=await assessCoreGate(candidateId);
  assert.equal(gate.eligible,false,'An image is insufficient without verified detailed description');
  await dbQuery('UPDATE travel_core_candidates SET detail=? WHERE candidate_id=?',
    ['Don Quảng Ngãi là món ăn đặc trưng của địa phương. '.repeat(8),candidateId]);
  gate=await assessCoreGate(candidateId);
  assert.equal(gate.eligible,true);
  const state=await refreshCoreReviewQueue();
  assert.equal(state.ready,1);
  const published=await dbQuery('SELECT COUNT(*) AS total FROM travel_content_items');
  assert.equal(published.rows[0].total,0,'No core candidate should ever auto-publish');
});
