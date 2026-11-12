import { createHash } from 'node:crypto';
import { dbQuery } from './database.js';
import { provinceDetailsCatalog } from '../../src/data/provinceDetailsData.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';
import { checkCoreSubjectSpecificity } from '../../src/utils/coreSubjectSpecificity.js';

export interface ImageReviewCandidate {
  image:string; sourceUrl:string; sourceKind:'commons'|'flickr';
  license:string; attribution:string; width:number; height:number;
}
const UA='VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; source attribution)';
const json=(value:unknown):Record<string,unknown>=>value && typeof value==='object' && !Array.isArray(value)
  ? value as Record<string,unknown> : {};
const text=(value:unknown)=>typeof value==='string'
  ?value.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/\s+/g,' ').trim().slice(0,240):'';
const approvedCommons=(name:string)=>
  /^(CC0(?: 1\.0)?|CC BY(?: [234]\.0)?|CC BY-SA(?: [234]\.0)?|PUBLIC DOMAIN)$/i.test(name);
const commonsCdn=(input:string)=>{
  try{const url=new URL(input);return url.protocol==='https:' &&
    url.hostname==='upload.wikimedia.org' &&
    url.pathname.startsWith('/wikipedia/commons/');}catch{return false;}
};
const flickrCdn=(input:string)=>{
  try{const url=new URL(input);return url.protocol==='https:'&&
    url.hostname==='live.staticflickr.com';}catch{return false;}
};
function dims(value:unknown){const n=Number(value);return Number.isFinite(n)?n:0;}
function bigEnough(width:number,height:number){
  return width>=800 && height>=450 && width/height>=1.15;
}
const fetchJson=async(url:URL,fetcher:typeof fetch,hosts:string[])=>{
  if(url.protocol!=='https:'||!hosts.includes(url.hostname))throw Error('HOST_NOT_ALLOWED');
  const response=await fetcher(url.toString(),{
    headers:{Accept:'application/json','User-Agent':UA},redirect:'error',
    signal:AbortSignal.timeout(10000),
  });
  if(!response.ok)throw Error('PHOTO_API_HTTP_'+response.status);
  const body=await response.text();if(body.length>700_000)throw Error('PHOTO_RESPONSE_LARGE');
  return json(JSON.parse(body));
};
function safeCommonsFile(name:string){
  return /^File:[^/\\]{3,180}\.(?:jpe?g|png|webp)$/i.test(name);
}

/** Keyword search produces review CANDIDATES, never a verified picture. */
export async function searchCommonsImageCandidates(args:{
  subject:string;province:string;fetcher?:typeof fetch;limit?:number;
}):Promise<ImageReviewCandidate[]>{
  const fetcher=args.fetcher??fetch;
  const query=(args.subject+' '+args.province).trim().slice(0,110);
  if(!args.subject.trim()||query.length<5)return [];
  const list=new URL('https://commons.wikimedia.org/w/api.php');
  list.search=new URLSearchParams({
    action:'query',format:'json',formatversion:'2',list:'search',
    srsearch:query,srnamespace:'6',srlimit:'10',
  }).toString();
  try{
    const result=await fetchJson(list,fetcher,['commons.wikimedia.org']);
    const rows=json(result.query).search;
    if(!Array.isArray(rows))return [];
    const names=rows.slice(0,10).map(x=>json(x))
      .filter(x=>x.ns===6&&typeof x.title==='string'&&safeCommonsFile(x.title))
      .map(x=>String(x.title)).slice(0,6);
    if(!names.length)return [];
    const info=new URL('https://commons.wikimedia.org/w/api.php');
    info.search=new URLSearchParams({
      action:'query',format:'json',formatversion:'2',titles:names.join('|'),
      prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'900',iilimit:'1',
    }).toString();
    const meta=await fetchJson(info,fetcher,['commons.wikimedia.org']);
    const files=json(meta.query).pages;
    if(!Array.isArray(files))return [];
    const candidates:ImageReviewCandidate[]=[];
    for(const file of files){
      const row=json(file),data=Array.isArray(row.imageinfo)?json(row.imageinfo[0]):{};
      const ext=json(data.extmetadata);
      const license=text(json(ext.LicenseShortName).value);
      const artist=text(json(ext.Artist).value);
      const sourceUrl=String(data.descriptionurl??'');
      const image=String(data.thumburl??data.url??'');
      const width=dims(data.width),height=dims(data.height);
      if(!approvedCommons(license)||artist.length<2||
        !commonsCdn(image)||!bigEnough(width,height)||
        !sourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:'))continue;
      candidates.push({image,sourceUrl,sourceKind:'commons',license,
        attribution:artist+' · '+license+' · '+sourceUrl,width,height});
      if(candidates.length>=Math.min(args.limit??4,6))break;
    }
    return candidates;
  }catch(error){console.warn('[photo-queue] Commons search unavailable',String(error).slice(0,130));return [];}
}

/** Flickr requires a developer API key and separate commercial API rights.
 * Allow only CC BY, CC BY-SA and CC0: NEVER NC/ND/rights-reserved.
 * A search match is still ONLY a human-review candidate. */
export async function searchFlickrImageCandidates(args:{
  subject:string;province:string;apiKey?:string;fetcher?:typeof fetch;limit?:number;
}):Promise<ImageReviewCandidate[]>{
  const key=(args.apiKey??'').trim();
  if(!key||!args.subject.trim())return [];
  const url=new URL('https://www.flickr.com/services/rest/');
  url.search=new URLSearchParams({
    method:'flickr.photos.search',api_key:key,format:'json',nojsoncallback:'1',
    text:(args.subject+' '+args.province).slice(0,120),
    sort:'relevance',safe_search:'1',content_type:'1',privacy_filter:'1',
    per_page:'12',page:'1',license:'4,5,9,11,12',
    extras:'license,url_c,owner_name',
  }).toString();
  try{
    const response=await fetchJson(url,args.fetcher??fetch,['www.flickr.com']);
    if(response.stat!=='ok')return [];
    const list=json(response.photos).photo;
    if(!Array.isArray(list))return [];
    const candidates:ImageReviewCandidate[]=[];
    const licenses:Record<string,string>={
      '4':'CC BY 2.0','5':'CC BY-SA 2.0','9':'CC0 1.0',
      '11':'CC BY 4.0','12':'CC BY-SA 4.0',
    };
    for(const photo of list.slice(0,12)){
      const row=json(photo),license=licenses[String(row.license)]??'';
      const image=String(row.url_c??'');
      const width=dims(row.width_c),height=dims(row.height_c);
      const owner=String(row.owner??''),id=String(row.id??'');
      const artist=text(row.ownername);
      if(!license||!flickrCdn(image)||!bigEnough(width,height)||
        !/^[0-9@A-Za-z]+$/.test(owner)||!/^\d+$/.test(id)||!artist)continue;
      const sourceUrl='https://www.flickr.com/photos/'+owner+'/'+id+'/';
      candidates.push({image,sourceUrl,sourceKind:'flickr',
        license,attribution:artist+' · '+license+' · '+sourceUrl,width,height});
      if(candidates.length>=Math.min(args.limit??4,6))break;
    }
    return candidates;
  }catch(error){console.warn('[photo-queue] Flickr search unavailable',String(error).slice(0,130));return [];}
}

function photoId(contentId:string,sourceUrl:string){
  return 'photo_'+createHash('sha256').update(contentId+'|'+sourceUrl).digest('hex').slice(0,44);
}
/** All photo searches are additive to a queue. Nothing alters public cards. */
export async function enqueueImagesForReview(options:{
  fetcher?:typeof fetch;flickrApiKey?:string;maxItems?:number;
}={}){
  const max=Math.max(1,Math.min(50,options.maxItems??25));
  const rows=await dbQuery(
    `SELECT i.content_id,i.province_id,i.section,v.payload_json
     FROM travel_content_items i JOIN travel_content_versions v
     ON v.version_id=i.current_version_id
     WHERE i.current_version_id LIKE 'auto_v2_%'
       AND v.reviewed_status='approved' AND i.section IN ('places','cuisine')
     UNION ALL
     SELECT candidate_id AS content_id,province_id,section,
       json_object('name',name,'image',image_url,'taxonomyGateVersion',2) AS payload_json
     FROM travel_core_candidates WHERE status IN ('pending','ready_for_review')
     ORDER BY province_id,section LIMIT 400`,
  );
  const summary={checked:0,newImages:0,missing:0};
  for(const row of rows.rows){
    if(summary.checked>=max)break;
    let payload:Record<string,unknown>;
    try{payload=json(JSON.parse(String(row.payload_json)));}catch{continue;}
    if(payload.taxonomyGateVersion!==2||typeof payload.name!=='string'||payload.image)continue;
    // Defense-in-depth: do not fetch art for whole cities/provinces, even if
    // the caller forgot to run the cleanup command first.
    const kind=String(row.section);
    if(!['places','cuisine'].includes(kind) ||
        !checkCoreSubjectSpecificity(payload.name,kind as 'places'|'cuisine').specific)continue;
    const id=String(row.province_id) as ProvinceId;
    const province=provinceDetailsCatalog[id]?.title??id;
    summary.checked++;
    const fromCommons=await searchCommonsImageCandidates({
      subject:payload.name,province,fetcher:options.fetcher,limit:4,
    });
    const fromFlickr=options.flickrApiKey ? await searchFlickrImageCandidates({
      subject:payload.name,province,apiKey:options.flickrApiKey,
      fetcher:options.fetcher,limit:4,
    }) : [];
    const combined=[...fromCommons,...fromFlickr].slice(0,5);
    if(!combined.length)summary.missing++;
    for(const item of combined){
      const result=await dbQuery(
        `INSERT OR IGNORE INTO travel_image_candidates
          (image_id,content_id,province_id,section,subject_name,image_url,
           source_url,source_kind,license,attribution,width,height,created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [photoId(String(row.content_id),item.sourceUrl),String(row.content_id),id,
         String(row.section),payload.name,item.image,item.sourceUrl,item.sourceKind,
         item.license,item.attribution,item.width,item.height,new Date().toISOString()],
      );
      summary.newImages+=result.changes;
    }
    if(!options.fetcher)await new Promise(resolve=>setTimeout(resolve,400));
  }
  return summary;
}
