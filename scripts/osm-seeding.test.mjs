import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { after,test } from 'node:test';

const root=mkdtempSync(join(tmpdir(),'vtravel-osm-'));
process.env.LOCAL_DB_PATH=join(root,'data.sqlite');
process.env.TURSO_DATABASE_URL='';process.env.TURSO_AUTH_TOKEN='';
const { dbQuery,closeLocalDatabase }=await import('../.api-test-dist/api/_lib/database.js');
const {
  makeOverpassQuery,parseOsmDestinations,queryOsmProvince,stageOsmProvince,
}=await import('../.api-test-dist/api/_lib/osm-seeding.js');
const {assessCoreGate}=await import('../.api-test-dist/api/_lib/core-candidates.js');
after(()=>{closeLocalDatabase();rmSync(root,{recursive:true,force:true});});

const fixtures={elements:[
  {type:'node',id:1001,lat:10.03,lon:105.78,
    tags:{'name:vi':'Làng du lịch Mỹ Khánh',tourism:'attraction'}},
  {type:'way',id:1002,center:{lat:10.03,lon:105.76},
    tags:{name:'Bảo tàng Cần Thơ',tourism:'museum'}},
  {type:'way',id:1003,center:{lat:10.03,lon:105.76},
    tags:{name:'Cần Thơ',tourism:'attraction'}},
  {type:'node',id:1004,lat:10.03,lon:105.76,
    tags:{name:'Sự cố sập cầu Cần Thơ',historic:'memorial'}},
  {type:'node',id:1005,lat:55,lon:104,
    tags:{name:'Địa điểm ngoài Việt Nam',tourism:'attraction'}},
  {type:'node',id:1006,lat:10.04,lon:105.7,
    tags:{name:'Trụ sở Huyện X',amenity:'townhall'}},
  {type:'node',id:1001,lat:10.03,lon:105.78,
    tags:{name:'Làng du lịch Mỹ Khánh',tourism:'attraction'}},
]};
const fake=async(url,opts)=>{
  assert.equal(url,'https://overpass-api.de/api/interpreter');
  assert.equal(opts.method,'POST');
  assert.equal(opts.redirect,'error');
  const body=new URLSearchParams(opts.body);
  assert.match(String(body.get('data')),/Cần Thơ/);
  assert.match(String(body.get('data')),/admin_level/);
  assert.match(String(body.get('data')),/out center/);
  return Response.json(fixtures);
};

test('OSM queries only selected province boundaries; 34 supported local areas',async()=>{
  const query=makeOverpassQuery('Can Tho');
  assert.match(query,/area\[\"name\"=\"Cần Thơ\"\]/);
  assert.doesNotMatch(query,/area\[\"name\"=\"Quảng Ninh\"\]/);
  assert.throws(()=>makeOverpassQuery('Truong Sa'));
  assert.equal((await queryOsmProvince('Can Tho',fake)).length,3,
    'Specificity filters remove generic city and invalid non-tourist objects; accident is rejected at core gate');
});

test('OSM geodata creates non-public candidate evidence with exact map URL, source license and coordinates',async()=>{
  const result=await stageOsmProvince('Can Tho',fake);
  assert.equal(result.fetched,3);
  assert.equal(result.newEntities,2,
    'Accident headline must be rejected before saving');
  assert.equal(result.updatedGeodata,2);
  const count=await dbQuery('SELECT COUNT(*) AS total FROM travel_core_candidates');
  assert.equal(count.rows[0].total,2);
  const geodata=await dbQuery('SELECT * FROM travel_external_geodata ORDER BY osm_id');
  assert.equal(geodata.rows.length,2);
  assert.equal(geodata.rows[0].osm_type,'node');
  assert.equal(geodata.rows[0].latitude,10.03);
  assert.equal(geodata.rows[0].source_url,'https://www.openstreetmap.org/node/1001');
  assert.match(String(geodata.rows[0].license),/ODbL/);
  const refs=await dbQuery('SELECT source_role,source_id FROM travel_core_candidate_sources');
  assert.ok(refs.rows.every(row=>row.source_role==='open_geodata'&&row.source_id==='openstreetmap'));
  const candidates=await dbQuery('SELECT candidate_id FROM travel_core_candidates');
  for(const candidate of candidates.rows){
    const gate=await assessCoreGate(String(candidate.candidate_id));
    assert.equal(gate.eligible,false,'OSM alone is insufficient for direct publication');
    assert.equal(gate.officialSources,0);
  }
  const publicItems=await dbQuery('SELECT COUNT(*) AS total FROM travel_content_items');
  assert.equal(publicItems.rows[0].total,0);
  const again=await stageOsmProvince('Can Tho',fake);
  assert.equal(again.newEntities,0);
  assert.equal(again.updatedGeodata,0);
});
