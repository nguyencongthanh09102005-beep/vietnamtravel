import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {after,test} from 'node:test';
const dir=mkdtempSync(join(tmpdir(),'vtravel-sources-'));
process.env.LOCAL_DB_PATH=join(dir,'sources.sqlite');
process.env.TURSO_DATABASE_URL='';
process.env.TURSO_AUTH_TOKEN='';
delete process.env.BRAVE_SEARCH_API_KEY;
const {dbQuery,closeLocalDatabase}=await import('../.api-test-dist/api/_lib/database.js');
const {findSourceCandidates,rankSourceCandidates,saveSourceSuggestions}=await import('../.api-test-dist/api/_lib/source-finder.js');
const {processNextAdminJob}=await import('../.api-test-dist/api/_lib/admin-jobs.js');
after(()=>{closeLocalDatabase();rmSync(dir,{recursive:true,force:true});});
const name='Bê chao Mộc Châu';
const province='Tỉnh Sơn La';
const u1='https://vietnamtourism.gov.vn/be-chao-moc-chau';
const u2='https://vnexpress.net/be-chao-moc-chau';
test('search evidence needs specific food and province, not ornamental fish or wrong region',()=>{
  const rows=[
    {url:u1,title:'Bê chao Mộc Châu tại Sơn La',snippet:'Món ăn Sơn La',host:'vietnamtourism.gov.vn',provider:'brave',status:'suggested'},
    {url:u2,title:'Bê chao Mộc Châu Sơn La',snippet:'Địa phương Tây Bắc',host:'vnexpress.net',provider:'brave',status:'suggested'},
    {url:'https://example.com/koi',title:'Cá Koi Nhật Bản',snippet:'Cá cảnh đẹp',host:'example.com',provider:'brave',status:'suggested'},
    {url:'https://example.com/no-province',title:'Bê chao Mộc Châu',snippet:'Ẩm thực chung',host:'example.com',provider:'brave',status:'suggested'},
    {url:'http://example.com/insecure',title:'Bê chao Mộc Châu Sơn La',snippet:'Việt Nam',host:'example.com',provider:'brave',status:'suggested'},
  ];
  const ranked=rankSourceCandidates(rows,name,province);
  assert.deepEqual(ranked.map(x=>x.url),[u1,u2]);
});
test('keyed provider yields link suggestions, which do not publish a catalog item',async()=>{
  const fake=async (url,init)=>{
    assert.equal(new URL(url).hostname,'api.search.brave.com');
    assert.equal(init.headers['X-Subscription-Token'],'test-search-key');
    return Response.json({web:{results:[
      {url:u1,title:'Bê chao Mộc Châu ở Sơn La',description:'Đặc sản vùng Sơn La'},
      {url:u2,title:'Bê chao Mộc Châu Sơn La',description:'Món ăn ở Sơn La'},
      {url:'https://example.net/koi',title:'Cá Koi Nhật Bản',description:'Cá cảnh'},
    ]}});
  };
  const result=await findSourceCandidates({name,provinceId:'Son La',section:'cuisine',fetcher:fake,apiKey:'test-search-key'});
  assert.equal(result.providerConfigured,true);
  assert.equal(result.suggestions.length,2);
  const added=await saveSourceSuggestions('legacy_food_demo','Son La','cuisine',result.suggestions);
  assert.equal(added,2);
  const again=await saveSourceSuggestions('legacy_food_demo','Son La','cuisine',result.suggestions);
  assert.equal(again,0,'Same URL is deduplicated');
  assert.equal((await dbQuery('SELECT COUNT(*) count FROM travel_content_items')).rows[0].count,0);
  assert.equal((await dbQuery('SELECT COUNT(*) count FROM travel_content_versions')).rows[0].count,0);
});
test('without web-search key uses stored RSS leads and reports configured limitation',async()=>{
  const now=new Date().toISOString();
  await dbQuery("INSERT INTO travel_source_leads(lead_id,source_id,article_url,headline,summary,first_seen_at) VALUES (?,?,?,?,?,?)",
    ['lead1','news',u2,'Bê chao Mộc Châu Sơn La','Món ăn tại Sơn La',now]);
  const result=await findSourceCandidates({name,provinceId:'Son La',section:'cuisine'});
  assert.equal(result.providerConfigured,false);
  assert.equal(result.suggestions.length,1);
  assert.match(result.errors[0],/NOT_CONFIGURED/);
});
test('bulk source worker processes a bounded item and only queues suggestions',async()=>{
  const now=new Date().toISOString();
  const task={id:'legacy_food_pending',provinceId:'Son La',section:'cuisine',name};
  await dbQuery("INSERT INTO travel_admin_jobs(job_id,province_id,kind,requested_by,result_json,created_at) VALUES (?,?,?,?,?,?)",
    ['bulk-test','*','source-bulk','admin',JSON.stringify({targets:[task],cursor:0,found:0,empty:0,total:1}),now]);
  const result=await processNextAdminJob();
  assert.equal(result.state,'completed');
  const saved=await dbQuery('SELECT source_url FROM travel_content_source_suggestions WHERE content_id=?',[task.id]);
  assert.equal(saved.rows.length,1);
  const job=await dbQuery('SELECT state,result_json FROM travel_admin_jobs WHERE job_id=?',['bulk-test']);
  assert.equal(job.rows[0].state,'completed');
  assert.equal(JSON.parse(String(job.rows[0].result_json)).cursor,1);
  assert.equal((await dbQuery('SELECT COUNT(*) count FROM travel_content_items')).rows[0].count,0);
});
