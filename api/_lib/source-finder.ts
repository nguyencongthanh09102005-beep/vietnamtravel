import { dbQuery } from './database.js';
import { provincesData, type ProvinceId } from '../../src/data/provincesData.js';

export type SourceSuggestion={url:string;title:string;snippet:string;host:string;provider:'brave'|'saved_news';status:'suggested'};
type Dict=Record<string,unknown>;
const record=(x:unknown):Dict=>x&&typeof x==='object'&&!Array.isArray(x)?x as Dict:{};
const plain=(x:unknown,max:number)=>typeof x==='string'?x.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';
const normalize=(x:string)=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function safeUrl(input:string):{url:string;host:string}|null{
  try{const u=new URL(input);
    if(u.protocol!=='https:'||u.username||u.password||u.port||input.length>650||u.hostname==='localhost'||u.hostname.endsWith('.local'))return null;
    return {url:u.toString(),host:u.hostname.replace(/^(www|m)\./,'').toLowerCase()};
  }catch{return null;}
}
export function sourceGroup(host:string){
  return /(^|\.)(wikipedia|wikidata|wikimedia|wikivoyage)\.org$/.test(host)?'wikimedia-group':host;
}
export function rankSourceCandidates(rows:SourceSuggestion[],name:string,provinceName:string):SourceSuggestion[]{
  const subject=normalize(name),location=normalize(provinceName.replace(/^(Tỉnh|TP\.|Thành phố)\s+/i,''));
  const seen=new Set<string>();
  return rows.filter(row=>{
    const url=safeUrl(row.url);if(!url||seen.has(url.url))return false;
    const evidence=normalize(row.title+' '+row.snippet);
    if(subject.length<3||!evidence.includes(subject))return false;
    // Regional name must be present in the search evidence; this is only
    // a lead, not proof of a dish's place of origin.
    if(location.length>3&&!evidence.includes(location))return false;
    seen.add(url.url);return true;
  }).slice(0,8);
}
export async function findSourceCandidates(args:{
  name:string;provinceId:ProvinceId;section:'places'|'cuisine';fetcher?:typeof fetch;apiKey?:string;
}):Promise<{suggestions:SourceSuggestion[];providerConfigured:boolean;errors:string[]}>{
  const province=provincesData[args.provinceId]?.name??args.provinceId;
  const cleanName=plain(args.name,150);
  if(!cleanName||!/^(places|cuisine)$/.test(args.section))return {suggestions:[],providerConfigured:false,errors:['INVALID_SUBJECT']};
  const result:SourceSuggestion[]=[];
  const errors:string[]=[];
  // Metadata that has already been lawfully collected via approved RSS feeds.
  const leads=await dbQuery("SELECT article_url,headline,summary FROM travel_source_leads WHERE review_status!='discarded' ORDER BY first_seen_at DESC LIMIT 1200");
  for(const lead of leads.rows){
    const u=safeUrl(String(lead.article_url??''));if(!u)continue;
    result.push({url:u.url,host:u.host,title:plain(lead.headline,250),
      snippet:plain(lead.summary,430),provider:'saved_news',status:'suggested'});
  }
  const key=args.apiKey??process.env.BRAVE_SEARCH_API_KEY;
  if(key){
    try{
      const url=new URL('https://api.search.brave.com/res/v1/web/search');
      url.search=new URLSearchParams({q:'"'+cleanName.replace(/"/g,'')+'" "'+province+'" du lịch ẩm thực',country:'VN',search_lang:'vi',count:'15',text_decorations:'false',result_filter:'web'}).toString();
      const response=await (args.fetcher??fetch)(url.toString(),{
        headers:{Accept:'application/json','X-Subscription-Token':key},
        redirect:'error',signal:AbortSignal.timeout(9000),
      });
      if(!response.ok)throw Error('BRAVE_HTTP_'+response.status);
      const raw=await response.text();
      if(raw.length>500_000)throw Error('BRAVE_RESPONSE_TOO_LARGE');
      const items=record(record(JSON.parse(raw)).web).results;
      for(const item of Array.isArray(items)?items.slice(0,20):[]){
        const obj=record(item),u=safeUrl(String(obj.url??''));if(!u)continue;
        result.push({url:u.url,host:u.host,title:plain(obj.title,250),
          snippet:plain(obj.description,430),provider:'brave',status:'suggested'});
      }
    }catch(error){errors.push(String(error).slice(0,180));}
  }else errors.push('BRAVE_SEARCH_API_KEY_NOT_CONFIGURED: chỉ tìm trong nguồn RSS đã lưu');
  return {suggestions:rankSourceCandidates(result,cleanName,province),providerConfigured:Boolean(key),errors};
}
export async function saveSourceSuggestions(contentId:string,provinceId:string,section:string,items:SourceSuggestion[]){
  let added=0;
  for(const item of items){
    const row=await dbQuery("INSERT OR IGNORE INTO travel_content_source_suggestions(content_id,province_id,section,source_url,title,snippet,source_host,provider,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
      [contentId,provinceId,section,item.url,item.title,item.snippet,item.host,item.provider,new Date().toISOString()]);
    added+=row.changes;
  }
  return added;
}
