import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { after, test } from 'node:test';
import { trustedSourceForUrl, VERIFIED_NEWS_FEEDS } from '../.api-test-dist/src/data/trustedSources.js';
import { parseTrustedRss, scanTrustedNewsFeeds, classifyNewsLeads } from '../.api-test-dist/api/_lib/trusted-feeds.js';
import { findVerifiedCommonsPhoto } from '../.api-test-dist/api/_lib/verified-photo.js';

const folder=mkdtempSync(join(tmpdir(),'vtravel-trusted-'));
process.env.LOCAL_DB_PATH=join(folder,'catalog.sqlite');
process.env.TURSO_DATABASE_URL='';
process.env.TURSO_AUTH_TOKEN='';
const { dbQuery,closeLocalDatabase } = await import('../.api-test-dist/api/_lib/database.js');
const { repairMissingPhotos } = await import('../.api-test-dist/api/_lib/photo-repair.js');
after(()=>{closeLocalDatabase();rmSync(folder,{force:true,recursive:true})});

const thumb='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Ha_Long_Bay.jpg/640px-Ha_Long_Bay.jpg';
const entity={claims:{P18:[{mainsnak:{snaktype:'value',datavalue:{value:'Ha_Long_Bay.jpg'}}}]}};
const photoFetch=(license='CC BY-SA 4.0')=>async url=>{
  const parsed=new URL(url);
  if(parsed.hostname==='www.wikidata.org')return Response.json({entities:{Q12345:entity}});
  assert.equal(parsed.hostname,'commons.wikimedia.org');
  assert.equal(parsed.searchParams.get('titles'),'File:Ha_Long_Bay.jpg');
  return Response.json({query:{pages:[{title:'File:Ha_Long_Bay.jpg',
    imageinfo:[{thumburl:thumb,descriptionurl:'https://commons.wikimedia.org/wiki/File:Ha_Long_Bay.jpg',
      extmetadata:{LicenseShortName:{value:license},Artist:{value:'Photographer Test'}}}]}]}});
};

test('site allowlist distinguishes actual culinary association from unrelated copyright association',()=>{
  assert.equal(trustedSourceForUrl('https://vcca.vn/')?.id,'vcca_food');
  assert.equal(trustedSourceForUrl('https://vcca.org.vn/'),null);
  assert.equal(trustedSourceForUrl('https://vnexpress.net.evil.example/rss'),null);
  assert.equal(trustedSourceForUrl('http://vnexpress.net/rss'),null);
  assert.equal(VERIFIED_NEWS_FEEDS.length,3);
  assert.ok(VERIFIED_NEWS_FEEDS.some(x=>x.feed==='https://thanhnien.vn/rss/du-lich.rss'));
});

test('Wikidata P18 produces an attributed photo even without a Wikipedia thumbnail',async()=>{
  const photo=await findVerifiedCommonsPhoto({wikidataId:'Q12345',wikidataEntry:entity,fetcher:photoFetch()});
  assert.equal(photo?.image,thumb);
  assert.match(photo?.imageAttribution??'',/Photographer Test/);
  const restricted=await findVerifiedCommonsPhoto({wikidataId:'Q12345',wikidataEntry:entity,fetcher:photoFetch('CC BY-NC 4.0')});
  assert.equal(restricted,null,'Non-commercial-only photos cannot be auto-used');
  const wrong=await findVerifiedCommonsPhoto({wikidataId:'not-a-qid',wikidataEntry:entity,fetcher:photoFetch()});
  assert.equal(wrong,null);
});

test('previously published photo-less cards gain a new version without losing the original',async()=>{
  const row={name:'Vịnh Hạ Long',description:'Một địa điểm du lịch',detail:'Nổi tiếng tại Quảng Ninh',
    image:'',wikidataId:'Q12345',imageStatus:'pending',taxonomyGateVersion:2,
    sourceUrl:'https://vi.wikipedia.org/wiki/Vinh_Ha_Long'};
  await dbQuery(`INSERT INTO travel_content_versions
    (version_id,content_id,province_id,section,payload_json,source_kind,source_ref,reviewed_status,created_at)
    VALUES (?,?,?,?,?,'verified_external',?,'approved',?)`,
    ['auto_v2_old','test-hal','Quang Ninh','places',JSON.stringify(row),row.sourceUrl,new Date().toISOString()]);
  await dbQuery(`INSERT INTO travel_content_items(content_id,province_id,section,current_version_id,updated_at)
    VALUES (?,?,?,?,?)`,['test-hal','Quang Ninh','places','auto_v2_old',new Date().toISOString()]);
  const result=await repairMissingPhotos({fetcher:photoFetch(),maxItems:20});
  assert.equal(result.updated,1);
  const current=await dbQuery(`SELECT i.current_version_id,v.payload_json FROM travel_content_items i
    JOIN travel_content_versions v ON v.version_id=i.current_version_id
    WHERE i.content_id=?`,['test-hal']);
  assert.match(String(current.rows[0].current_version_id),/^auto_v2_photo_/);
  assert.equal(JSON.parse(String(current.rows[0].payload_json)).image,thumb);
  const history=await dbQuery('SELECT COUNT(*) AS n FROM travel_content_versions WHERE content_id=?',['test-hal']);
  assert.equal(history.rows[0].n,2);
  const again=await repairMissingPhotos({fetcher:async()=>{throw Error('Already has photo')},maxItems:20});
  assert.equal(again.updated,0);
});

test('RSS extracts only headlines+short descriptions on approved host; never auto-publishes',async()=>{
  const xml=`<?xml version="1.0"?><rss version="2.0"><channel>
    <item><title><![CDATA[Khám phá Vịnh Hạ Long ở Quảng Ninh]]></title>
    <link>https://vnexpress.net/du-lich/ha-long-123.html</link>
    <description><![CDATA[Du khách khám phá thắng cảnh và những điểm tham quan nổi bật.]]></description></item>
    <item><title>Sự cố tại cầu Cần Thơ</title>
    <link>https://vnexpress.net/du-lich/cau-can-tho-456.html</link>
    <description>Đây là bài tin về một sự cố.</description></item>
    <item><title>Không hợp lệ</title><link>https://evil.example/a</link></item>
  </channel></rss>`;
  const leads=parseTrustedRss(xml,'vnexpress_travel');
  assert.equal(leads.length,2);
  assert.ok(leads.every(x=>x.kind==='unknown' && x.provinceId===null));
  assert.ok(leads[0].title.includes('Vịnh Hạ Long'));
  assert.equal(parseTrustedRss(xml,'vcca_food').length,0);

  const old=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-opaque';
  try{
    const results=await classifyNewsLeads(leads,async()=>JSON.stringify({items:[
      {id:leads[0].id,kind:'places',provinceId:'Quang Ninh',subject:'Vịnh Hạ Long'},
      {id:leads[1].id,kind:'places',provinceId:'Can Tho',subject:'Sự cố tại cầu Cần Thơ'},
    ]}));
    assert.equal(results[0].kind,'places');
    assert.equal(results[1].kind,'news','Accident headlines must never become attractions');
  }finally{if(old===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=old;}
});

test('RSS scanner stores review-only leads without adding any public catalog rows',async()=>{
  const fake=async url=>{
    const hostname=new URL(url).hostname;
    return new Response(`<rss><channel><item>
      <title><![CDATA[Du lịch tại Vịnh Hạ Long hôm nay]]></title>
      <link>https://${hostname}/du-lich/bai-viet-123.html</link>
      <description>Tham khảo thông tin điểm đến</description>
    </item></channel></rss>`,{status:200});
  };
  const result=await scanTrustedNewsFeeds({fetcher:fake});
  assert.equal(result.failed,0);
  assert.equal(result.inserted,3);
  const leads=await dbQuery('SELECT COUNT(*) AS n FROM travel_source_leads WHERE review_status=?',['pending']);
  assert.equal(leads.rows[0].n,3);
  const published=await dbQuery('SELECT COUNT(*) AS n FROM travel_content_items WHERE content_id!=?',['test-hal']);
  assert.equal(published.rows[0].n,0);
});

test('Gemini --ai reclassifies already saved pending RSS headlines, without new inserts',async()=>{
  const old=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY='test-key-not-sent';
  let calls=0;
  try{
    const fake=async url=>{
      const host=new URL(url).hostname;
      return new Response(`<rss><channel><item>
        <title>Du lịch tại Vịnh Hạ Long hôm nay</title>
        <link>https://${host}/du-lich/bai-viet-123.html</link>
        <description>Tham khảo thông tin điểm đến</description>
      </item></channel></rss>`,{status:200});
    };
    const generator=async prompt=>{
      calls++;
      const entries=JSON.parse(prompt.split('Nguồn chỉ có tiêu đề và tóm tắt: ')[1]);
      return JSON.stringify({items:entries.map(x=>({
        id:x.id,kind:'places',provinceId:'Quang Ninh',subject:'Vịnh Hạ Long',
      }))});
    };
    const second=await scanTrustedNewsFeeds({fetcher:fake,withAi:true,generator});
    assert.equal(second.inserted,0,'Previously saved RSS headlines must not be duplicated');
    assert.equal(second.classified,3,'Old pending leads must be updated by --ai');
    assert.equal(second.aiBatches,1);
    assert.equal(second.remainingUnclassified,0);
    assert.equal(calls,1);
    const stored=await dbQuery('SELECT kind,province_id,review_status FROM travel_source_leads');
    assert.ok(stored.rows.every(x=>x.kind==='places' && x.province_id==='Quang Ninh' &&
      x.review_status==='pending'));
    const again=await scanTrustedNewsFeeds({fetcher:fake,withAi:true,generator});
    assert.equal(again.inserted,0);
    assert.equal(again.classified,0);
    assert.equal(again.aiBatches,0,'Already classified leads should not cost more Gemini requests');
    assert.equal(calls,1);
    const published=await dbQuery('SELECT COUNT(*) AS n FROM travel_content_items WHERE content_id!=?',['test-hal']);
    assert.equal(published.rows[0].n,0,'News headlines are never public tourism cards');
  }finally{
    if(old===undefined)delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY=old;
  }
});

test('when Wikidata P18 is missing, photo comes only from a Wikipedia article with matching QID',async()=>{
  const fetcher=async url=>{
    const u=new URL(url);
    if(u.hostname==='vi.wikipedia.org')return Response.json({query:{pages:[{
      title:'Vịnh Hạ Long',pageprops:{wikibase_item:'Q12345'},pageimage:'Ha_Long_Bay.jpg',
    }]}});
    if(u.hostname==='commons.wikimedia.org')return photoFetch()(url);
    throw Error('No Wikidata call required when entry has empty claims');
  };
  const props={wikidataId:'Q12345',wikidataEntry:{claims:{}},
    articleUrl:'https://vi.wikipedia.org/wiki/V%E1%BB%8Bnh_H%E1%BA%A1_Long',fetcher};
  const result=await findVerifiedCommonsPhoto(props);
  assert.equal(result?.image,thumb);
  assert.match(result?.imageAttribution??'',/Photographer Test/);
  const badArticle=async url=>{
    const u=new URL(url);
    if(u.hostname==='vi.wikipedia.org')return Response.json({query:{pages:[{
      pageprops:{wikibase_item:'Q9999'},pageimage:'Ha_Long_Bay.jpg',
    }]}});
    throw Error('Commons should not be called for mismatched article entity');
  };
  assert.equal(await findVerifiedCommonsPhoto({...props,fetcher:badArticle}),null);
  assert.equal(await findVerifiedCommonsPhoto({...props,
    articleUrl:'https://vi.wikipedia.org.evil.example/wiki/H%E1%BA%A1_Long',fetcher:badArticle}),null);
});
