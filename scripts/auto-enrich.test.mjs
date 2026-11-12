import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { after, test } from 'node:test';

const dir = mkdtempSync(join(tmpdir(),'vt-enrich-test-'));
process.env.LOCAL_DB_PATH = join(dir,'enriched.sqlite');
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';

const { assessCandidate, enrichSection } = await import('../.api-test-dist/api/_lib/auto-enrich.js');
const { closeLocalDatabase, dbQuery } = await import('../.api-test-dist/api/_lib/database.js');
const { default: contentApi } = await import('../.api-test-dist/api/content.js');
after(() => {
  closeLocalDatabase();
  rmSync(dir,{recursive:true,force:true});
});
const thumbnail = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Ho_Du_Lich.jpg/640px-Ho_Du_Lich.jpg';
const title = 'Hồ du lịch thử nghiệm';
const intro = 'Hồ du lịch thử nghiệm là một hồ nước và địa điểm tham quan tại tỉnh Thanh Hóa, Việt Nam. '
 + 'Địa điểm có quang cảnh đẹp, du khách đến tham quan và khám phá cảnh quan. '.repeat(4);
const candidate = {
  contentId:'wiki_content_test',
  versionId:'wiki_version_test',
  provinceId:'Thanh Hoa',
  section:'places',
  sourceRef:'https://vi.wikipedia.org/wiki/H%E1%BB%93_du_l%E1%BB%8Bch_th%E1%BB%AD_nghi%E1%BB%87m',
  payload: {
    name:title,description:intro.slice(0,360),detail:intro,
    image:thumbnail,sourceUrl:'https://vi.wikipedia.org/wiki/Test',
    imageAttribution:'Needs license verification',
  },
};

const fetcherFor = (license='CC BY-SA 4.0', artist='Photo contributor') => async url => {
  const parsed=new URL(url);
  assert.ok(['vi.wikipedia.org','commons.wikimedia.org','www.wikidata.org'].includes(parsed.hostname));
  if(parsed.searchParams.get('generator')==='search') {
    return Response.json({query:{pages:[{title,extract:intro,thumbnail:{source:thumbnail}}]}});
  }
  if(parsed.hostname==='vi.wikipedia.org') return Response.json({
    query:{pages:[{title,pageimage:'Ho_Du_Lich.jpg',
      pageprops:{wikibase_item:'Q12345678'},
      categories:[{title:'Thể loại:Địa điểm du lịch Thanh Hóa'}],
      coordinates:[{lat:19.8,lon:105.7}]}]},
  });
  if(parsed.hostname==='www.wikidata.org') return Response.json({
    entities:{Q12345678:{descriptions:{vi:{value:'hồ du lịch và điểm tham quan ở Việt Nam'}}}},
  });
  return Response.json({query:{pages:[{title:'File:Ho_Du_Lich.jpg',
    imageinfo:[{descriptionurl:'https://commons.wikimedia.org/wiki/File:Ho_Du_Lich.jpg',
      thumburl:thumbnail,
      extmetadata:{LicenseShortName:{value:license},Artist:{value:artist}}}]}]}});
};
test('publishes only image-licensed, article-linked and region-matching content',async ()=>{
  const approved=await assessCandidate(candidate,fetcherFor());
  assert.equal(approved.approved,true);
  assert.match(approved.payload.imageAttribution,/CC BY-SA/);
  assert.equal(approved.payload.wikidataId,'Q12345678');
  const bad=await assessCandidate(candidate,fetcherFor('CC BY-NC 4.0'));
  assert.equal(bad.approved,true,'Real supported content should remain publishable without a photo');
  assert.equal(bad.payload.image,'','Restricted images must never be reused in a tourism website');
  assert.equal(bad.payload.imageStatus,'pending');
  const wrongPlace=await assessCandidate({
    ...candidate,
    payload:{...candidate.payload,detail:intro.replaceAll('Thanh Hóa','Hà Nội')},
  },fetcherFor());
  assert.equal(wrongPlace.approved,false,'Wrong province must never be auto-published');
});

test('verified content appears immediately in public API, but not duplicated on re-scan',async ()=>{
  const first=await enrichSection('Thanh Hoa','places',{fetcher:fetcherFor(),force:true});
  assert.equal(first.found,1);
  assert.equal(first.approved,1);
  assert.equal(first.pending,0);
  const response=await contentApi.fetch(new Request('https://example.test/api/content?provinceId=Thanh%20Hoa'));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.equal(data.source,'approved_database');
  assert.ok(data.data.data.places.some(x=>x.name===title));
  assert.ok(data.data.data.places.find(x=>x.name===title).imageAttribution.includes('Photo contributor'));
  assert.equal(data.data.data.cuisine.length,3);
  const second=await enrichSection('Thanh Hoa','places',{fetcher:async()=>{throw Error('Should not fetch recently scanned sources')}});
  assert.equal(second.skipped,true);
  const third=await enrichSection('Thanh Hoa','places',{fetcher:fetcherFor(),force:true});
  assert.equal(third.approved,0);
  const rows=await dbQuery("SELECT COUNT(*) AS count FROM travel_content_items WHERE province_id='Thanh Hoa'");
  assert.equal(rows.rows[0].count,1);
  const versions=await dbQuery("SELECT current_version_id FROM travel_content_items WHERE province_id='Thanh Hoa'");
  assert.match(String(versions.rows[0].current_version_id),/^auto_v2_/);
});

test('original handwritten destination is enriched without deleting source or history',async ()=>{
  const { archiveLegacyCatalog } = await import('../.api-test-dist/src/utils/contentArchive.js');
  const { provinceDetailsCatalog } = await import('../.api-test-dist/src/data/provinceDetailsData.js');
  const original = archiveLegacyCatalog().records.find(row =>
    row.provinceId==='Thanh Hoa' && row.section==='places'
    && row.payload.name==='Biển Sầm Sơn');
  assert.ok(original);
  const oldVersion = 'legacy_original_samson_test';
  const now = new Date().toISOString();
  await dbQuery(`INSERT OR IGNORE INTO travel_content_versions
    (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,created_at)
    VALUES (?,?,?,?,?,'legacy_manual',?,'approved',?)`,
    [oldVersion,original.id,'Thanh Hoa','places',JSON.stringify(original.payload),original.sourceFile,now]);
  await dbQuery(`INSERT OR IGNORE INTO travel_content_items
    (content_id,province_id,section,current_version_id,updated_at) VALUES (?,?,?,?,?)`,
    [original.id,'Thanh Hoa','places',oldVersion,now]);
  const beachIntro='Biển Sầm Sơn là một bãi biển du lịch tại tỉnh Thanh Hóa, Việt Nam. '
    +'Địa điểm nằm bên bờ biển, có bãi cát dài và là điểm tham quan quen thuộc. '.repeat(4);
  const photo='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sam_Son.jpg/640px-Sam_Son.jpg';
  const fetcher = async url => {
    const u = new URL(url);
    if (u.searchParams.get('generator') === 'search') return Response.json({query:{pages:[{
      title:'Biển Sầm Sơn',extract:beachIntro,thumbnail:{source:photo},
    }]}});
    if (u.hostname === 'vi.wikipedia.org') return Response.json({query:{pages:[{
      title:'Biển Sầm Sơn',pageimage:'Sam_Son.jpg',pageprops:{wikibase_item:'Q12345'},
      categories:[{title:'Thể loại:Bãi biển Thanh Hóa'}],
      coordinates:[{lat:19.75,lon:105.9}],
    }]}});
    if (u.hostname === 'www.wikidata.org') return Response.json({
      entities:{Q12345:{descriptions:{vi:{value:'bãi biển và điểm du lịch tại Thanh Hóa'}}}},
    });
    return Response.json({query:{pages:[{imageinfo:[{
      descriptionurl:'https://commons.wikimedia.org/wiki/File:Sam_Son.jpg',
      thumburl:photo,
      extmetadata:{LicenseShortName:{value:'CC BY 4.0'},Artist:{value:'Licensed photographer'}},
    }]}]}});
  };
  const result=await enrichSection('Thanh Hoa','places',{fetcher,force:true});
  assert.equal(result.approved,1);
  const response=await contentApi.fetch(new Request('https://example.test/api/content?provinceId=Thanh%20Hoa'));
  assert.equal(response.status,200);
  const data=await response.json();
  assert.ok(data.data.data.places.find(x=>x.name==='Biển Sầm Sơn').detail.includes('bãi biển du lịch'));
  assert.equal(provinceDetailsCatalog['Thanh Hoa'].data.places.find(x=>x.name==='Biển Sầm Sơn').detail,
    undefined,'Original TypeScript record stays untouched');
  const active=await dbQuery('SELECT current_version_id FROM travel_content_items WHERE content_id=?',[original.id]);
  assert.notEqual(active.rows[0].current_version_id,oldVersion);
  const history=await dbQuery('SELECT reviewed_status FROM travel_content_versions WHERE version_id=?',[oldVersion]);
  assert.equal(history.rows[0].reviewed_status,'approved','Old version retained for rollback');
});

test('Wikipedia missing thumbnail can still recover a licensed image from article pageimage',async ()=>{
  const noPhoto={...candidate,payload:{...candidate.payload,image:''}};
  const verdict=await assessCandidate(noPhoto,fetcherFor());
  assert.equal(verdict.approved,true);
  assert.equal(verdict.payload.image,thumbnail);
  assert.equal(verdict.payload.imageStatus,'verified');
  assert.equal(verdict.payload.wikidataId,'Q12345678');
  assert.match(verdict.payload.imageAttribution,/Photo contributor/);
});

test('a correct-source Wikidata item without licensed photo is still visible in API',async ()=>{
  const noImageTitle='Hồ tham quan chưa có ảnh';
  const noImageIntro='Hồ tham quan chưa có ảnh là hồ nước và điểm tham quan tại tỉnh Thanh Hóa, Việt Nam. '
    +'Nơi đây là một địa điểm có cảnh quan và hoạt động tham quan. '.repeat(5);
  const src=async url=>{
    const u=new URL(url);
    if(u.searchParams.get('generator')==='search') return Response.json({query:{pages:[{
      title:noImageTitle,extract:noImageIntro,
    }]}});
    if(u.hostname==='vi.wikipedia.org') return Response.json({query:{pages:[{
      title:noImageTitle,pageprops:{wikibase_item:'Q345678'},
      categories:[{title:'Thể loại:Địa điểm du lịch tại Thanh Hóa'}],
      coordinates:[{lat:19.8,lon:105.7}],
    }]}});
    if(u.hostname==='www.wikidata.org') return Response.json({
      entities:{Q345678:{descriptions:{vi:{value:'địa điểm tham quan ở Thanh Hóa'}}}},
    });
    throw new Error('Should never request Commons when there is no image');
  };
  const refreshed=await enrichSection('Thanh Hoa','places',{fetcher:src,force:true});
  assert.equal(refreshed.approved,1);
  const response=await contentApi.fetch(new Request('https://example.test/api/content?provinceId=Thanh%20Hoa'));
  assert.equal(response.status,200);
  const payload=await response.json();
  const item=payload.data.data.places.find(x=>x.name===noImageTitle);
  assert.ok(item);
  assert.equal(item.image,'');
  assert.equal(item.wikidataId,'Q345678');
});
