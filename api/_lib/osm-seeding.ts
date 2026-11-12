import { dbQuery } from './database.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { stageCoreCandidate } from './core-candidates.js';
import { checkCoreSubjectSpecificity } from '../../src/utils/coreSubjectSpecificity.js';

// Read-only open-data mirrors. Private.coffee explicitly offers this public endpoint;
// avoid retry loops and reduce expensive queries after timeouts.
export const OSM_ENDPOINTS=[
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
] as const;
export type OsmQueryGroup='tourism'|'heritage'|'tourism-lite'|'heritage-lite';
const UA='VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; open geodata research)';
const allowedTourism=new Set(['attraction','museum','viewpoint','theme_park','gallery','zoo','aquarium']);
const allowedHistoric=new Set(['monument','memorial','castle','fort','archaeological_site','ruins']);
const allowedNatural=new Set(['peak','waterfall','cave_entrance','beach']);
type Obj=Record<string,unknown>;
const obj=(x:unknown):Obj=>x&&typeof x==='object'&&!Array.isArray(x)?x as Obj:{};
const validLoc=(lat:number,lon:number)=>Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=8&&lat<=24&&lon>=102&&lon<=110;

export interface OsmDestination {
  provinceId:ProvinceId;name:string;osmType:'node'|'way'|'relation';
  osmId:number;latitude:number;longitude:number;category:string;sourceUrl:string;
}
/** No uncontrolled Overpass code from user input. Admin area names are
 * selected only from provincesData (34 recognized province/city IDs). */
export function provinceAreaNames(provinceId:ProvinceId):string[]{
  const province=provincesData[provinceId];
  if(!province || provinceId==='Hoang Sa'||provinceId==='Truong Sa')
    throw Error('INVALID_PROVINCE');
  const name=province.name.replace(/^(Tỉnh|TP\.)\s*/i,'').trim();
  return [...new Set([name,
    ...(provinceId==='Ho Chi Minh'?['Thành phố Hồ Chí Minh']:[]),
    ...(provinceId==='Da Nang'?['Thành phố Đà Nẵng']:[]),
    ...(provinceId==='Ha Noi'?['Thành phố Hà Nội']:[]),
    ...(provinceId==='Can Tho'?['Thành phố Cần Thơ']:[]),
    ...(provinceId==='Hai Phong'?['Thành phố Hải Phòng']:[]),
    ...(provinceId==='Hue'?['Thành phố Huế']:[]),
  ])];
}
export function makeOverpassQuery(provinceId:ProvinceId,group:OsmQueryGroup='tourism'):string{
  const names=provinceAreaNames(provinceId).map(name=>{
    const value=name.replace(/[\\\\\"\\n\\r]/g,'');
    return '  area["name"="'+value+'"]["boundary"="administrative"]["admin_level"="4"];';
  }).join('\\n');
  // The old query searched tourism + historic + natural across a whole
  // province in ONE request, routinely exhausting the public Overpass slots.
  // Retry only with a SMALLER tag set, never the same heavyweight query.
  const filters:Record<OsmQueryGroup,string[]>={
    tourism:[
      'nwr["tourism"~"^(attraction|museum|viewpoint|theme_park|gallery)$"]["name"](area.province);',
    ],
    heritage:[
      'nwr["historic"~"^(monument|memorial|castle|fort|archaeological_site|ruins)$"]["name"](area.province);',
      'nwr["natural"~"^(peak|waterfall|cave_entrance|beach)$"]["name"](area.province);',
    ],
    'tourism-lite':[
      'nwr["tourism"~"^(attraction|museum)$"]["name"](area.province);',
    ],
    'heritage-lite':[
      'nwr["historic"~"^(monument|memorial|castle)$"]["name"](area.province);',
    ],
  };
  return [
    '[out:json][timeout:25];',
    '(',names,')->.province;',
    '(',
    ...filters[group].map(part=>'  '+part),
    ');',
    'out center 60;',
  ].join('\\n');
}
export function parseOsmDestinations(provinceId:ProvinceId,payload:unknown,max=40):OsmDestination[]{
  const elements=obj(payload).elements;
  if(!Array.isArray(elements))return [];
  const accepted:OsmDestination[]=[];
  const seen=new Set<string>();
  for(const raw of elements.slice(0,120)){
    const item=obj(raw),tags=obj(item.tags);
    const type=item.type;
    if(type!=='node'&&type!=='way'&&type!=='relation')continue;
    const id=Number(item.id);
    if(!Number.isSafeInteger(id)||id<=0)continue;
    const name=String(tags['name:vi']??tags.name??'').trim();
    if(name.length<4||name.length>140||
      !checkCoreSubjectSpecificity(name,'places').specific)continue;
    let category='';
    if(allowedTourism.has(String(tags.tourism))) category='tourism:'+tags.tourism;
    else if(allowedHistoric.has(String(tags.historic)))category='historic:'+tags.historic;
    else if(allowedNatural.has(String(tags.natural)))category='natural:'+tags.natural;
    if(!category)continue;
    // Never turn grave sites, event headings, cities or news into destinations.
    if(tags.boundary==='administrative'||tags.place==='city'||tags.place==='town')continue;
    const pos=type==='node'?item:obj(item.center);
    const lat=Number(pos.lat),lon=Number(pos.lon);
    if(!validLoc(lat,lon))continue;
    const dedupKey=type+':'+id;
    if(seen.has(dedupKey))continue;
    seen.add(dedupKey);
    accepted.push({
      provinceId,name,osmType:type,osmId:id,
      latitude:lat,longitude:lon,category,
      sourceUrl:'https://www.openstreetmap.org/'+type+'/'+id,
    });
    if(accepted.length>=Math.min(80,Math.max(1,max)))break;
  }
  return accepted;
}
export async function queryOsmProvince(provinceId:ProvinceId,fetcher:typeof fetch=fetch):
  Promise<OsmDestination[]>{
  const collected:OsmDestination[]=[];
  const seen=new Set<string>();
  const failures:string[]=[];
  let completed=0;
  let usedFallback=false;
  for(const group of ['tourism','heritage'] as const){
    // If a previous request already required a fallback, do not run another
    // heavyweight category on the same shared public instances.
    if(usedFallback)break;
    let phaseData:OsmDestination[]|null=null;
    for(let index=0;index<OSM_ENDPOINTS.length;index++){
      const endpoint=OSM_ENDPOINTS[index];
      const smaller:OsmQueryGroup =
        index===0?group:group==='tourism'?'tourism-lite':'heritage-lite';
      const query=makeOverpassQuery(provinceId,smaller);
      try{
        const response=await fetcher(endpoint,{
          method:'POST',redirect:'error',headers:{
            'User-Agent':UA,'Accept':'application/json',
            'Content-Type':'application/x-www-form-urlencoded',
          },
          body:new URLSearchParams({data:query}).toString(),
          signal:AbortSignal.timeout(34000),
        });
        if(response.status===429){
          throw Error('OVERPASS_RATE_LIMIT_429: stop and retry another day');
        }
        if(!response.ok)throw Error('OVERPASS_HTTP_'+response.status);
        const body=await response.text();
        if(body.length>1_500_000)throw Error('OVERPASS_TOO_LARGE');
        const raw=obj(JSON.parse(body));
        if(typeof raw.remark==='string'&&raw.remark.length){
          throw Error('OVERPASS_RUNTIME: '+raw.remark.slice(0,160));
        }
        if(!Array.isArray(raw.elements))throw Error('OVERPASS_INVALID_RESPONSE');
        phaseData=parseOsmDestinations(provinceId,raw,60);
        completed++;
        if(index>0){
          usedFallback=true;
          console.log('[OSM] Mirror fallback succeeded (reduced query):',endpoint);
        }
        break;
      }catch(error){
        const reason=String(error).slice(0,150);
        failures.push(group+' '+endpoint+': '+reason);
        console.warn('[OSM]',group,'failed at',endpoint,reason);
        if(reason.includes('OVERPASS_RATE_LIMIT_429'))break;
        if(index===0)console.warn('[OSM] Trying a smaller query on the mirror instead of repeating the same query.');
      }
    }
    if(phaseData){
      for(const place of phaseData){
        const id=place.osmType+':'+place.osmId;
        if(seen.has(id))continue;
        seen.add(id);collected.push(place);
      }
    }
  }
  if(completed===0)throw Error('OSM_FETCH_UNAVAILABLE: '+failures.join(' | ').slice(0,500));
  if(failures.length)console.warn('[OSM] Partial query failures:',failures.length,
    '; keeping',collected.length,'verified-location candidates from successful responses.');
  return collected;
}
export async function stageOsmProvince(provinceId:ProvinceId,fetcher:typeof fetch=fetch){
  const places=await queryOsmProvince(provinceId,fetcher);
  const summary={provinceId,fetched:places.length,staged:0,newEntities:0,
    updatedGeodata:0,skipped:0,license:'ODbL © OpenStreetMap contributors'};
  for(const place of places){
    const stage=await stageCoreCandidate({
      provinceId,section:'places',name:place.name,
      description:'Gợi ý từ dữ liệu bản đồ OpenStreetMap ('+place.category+
        '); vị trí '+place.latitude+', '+place.longitude+
        '. Cần kiểm chứng độc lập trước khi xuất bản.',
      sourceUrl:place.sourceUrl,
    });
    if(!stage){summary.skipped++;continue;}
    summary.staged++;
    if(stage.newEntity)summary.newEntities++;
    const inserted=await dbQuery(
      `INSERT OR IGNORE INTO travel_external_geodata
        (osm_type,osm_id,candidate_id,province_id,name,latitude,longitude,
         category,source_url,license,checked_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [place.osmType,place.osmId,stage.id,place.provinceId,place.name,
        place.latitude,place.longitude,place.category,place.sourceUrl,
        'ODbL © OpenStreetMap contributors',new Date().toISOString()],
    );
    summary.updatedGeodata+=inserted.changes;
  }
  return summary;
}
