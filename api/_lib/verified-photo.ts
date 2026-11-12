import { createHash } from 'node:crypto';

const UA='VietnamTravel/1.0 (https://github.com/nguyencongthanh09102005-beep/vietnamtravel; contact via GitHub)';
type RecordValue=Record<string,unknown>;
const asRecord=(value:unknown):RecordValue=>value && typeof value==='object' && !Array.isArray(value)
  ? value as RecordValue : {};
const clean=(value:unknown)=>typeof value==='string'
  ? value.replace(/<[^>]+>/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim().slice(0,180) : '';
const supportedLicense=(license:string)=>/^(?:CC0(?: 1\.0)?|CC BY(?: [234]\.0)?|CC BY-SA(?: [234]\.0)?|PUBLIC DOMAIN|PD-OLD|PD-USGOV)$/.test(license.toUpperCase());
const validImage=(url:string)=>{
  try { const p=new URL(url); return p.protocol==='https:' &&
    p.hostname==='upload.wikimedia.org' &&
    /^\/wikipedia\/commons\//.test(p.pathname) &&
    /\.(?:jpe?g|png|webp)(?:\/|$)/i.test(p.pathname); }
  catch{return false;}
};
export interface VerifiedCommonsPhoto {
  image:string;
  imageAttribution:string;
  imageLicense:string;
  imageCreditUrl:string;
}

/** Retrieve a pageimage only if the source Wikipedia article belongs to the
 * exact Wikidata entity on the card. Never search for a picture by word. */
export async function verifiedArticlePageimage(args:{
  articleUrl:string; wikidataId:string; fetcher?:typeof fetch;
}):Promise<string|null>{
  let url:URL;
  try {url=new URL(args.articleUrl);} catch{return null;}
  if(url.protocol!=='https:'||url.hostname!=='vi.wikipedia.org'||
     !url.pathname.startsWith('/wiki/')||url.username||url.password)return null;
  let title:string;
  try{title=decodeURIComponent(url.pathname.slice(6)).replace(/_/g,' ');}catch{return null;}
  if(title.length<3||title.length>180||title.includes('/')||!/^Q\d+$/.test(args.wikidataId))return null;
  const api=new URL('https://vi.wikipedia.org/w/api.php');
  api.search=new URLSearchParams({
    action:'query',format:'json',formatversion:'2',
    titles:title,prop:'pageprops|pageimages',piprop:'name',redirects:'1',
  }).toString();
  try{
    const response=await (args.fetcher??fetch)(api.toString(),{
      headers:{'User-Agent':UA,Accept:'application/json'},
      redirect:'error',signal:AbortSignal.timeout(10000),
    });
    if(!response.ok)return null;
    const raw=await response.text();
    if(raw.length>500_000)return null;
    const pages=asRecord(asRecord(JSON.parse(raw)).query).pages;
    const page=Array.isArray(pages)?asRecord(pages[0]):{};
    if(asRecord(page.pageprops).wikibase_item!==args.wikidataId)return null;
    const filename=page.pageimage;
    if(typeof filename!=='string'||filename.length>180||
      !/\.(?:jpe?g|png|webp)$/i.test(filename)||filename.includes('/'))return null;
    return filename;
  }catch{return null;}
}

function commonsFileFromP18(item:RecordValue):string|null {
  const claims=asRecord(item.claims);
  const p18=Array.isArray(claims.P18)?claims.P18:[];
  const statement=asRecord(p18[0]);
  const snak=asRecord(statement.mainsnak);
  if (snak.snaktype!=='value') return null;
  const filename=asRecord(snak.datavalue).value;
  if (typeof filename!=='string'||filename.length>180||
    !/\.(?:jpg|jpeg|png|webp)$/i.test(filename) || filename.includes('/') || filename.includes('\\')) return null;
  return filename.trim();
}
/**
 * An image is linked to a SPECIFIC Wikidata entity (P18), or to that entity's
 * exact Wikipedia article pageimage. Never choose the first Commons search hit
 * for a generic province/word: that produces unrelated food and attraction art.
 */
export async function findVerifiedCommonsPhoto(args:{
  wikidataId:string; articlePageimage?:string; articleThumbnail?:string;
  articleUrl?:string; wikidataEntry?:unknown; fetcher?:typeof fetch;
}):Promise<VerifiedCommonsPhoto|null>{
  if(!/^Q\d+$/.test(args.wikidataId)) return null;
  const fetcher=args.fetcher??fetch;
  let entity=asRecord(args.wikidataEntry);
  if(!args.wikidataEntry) {
    const url=new URL('https://www.wikidata.org/w/api.php');
    url.search=new URLSearchParams({
      action:'wbgetentities',ids:args.wikidataId,props:'claims',
      format:'json',formatversion:'2',
    }).toString();
    try {
      const response=await fetcher(url.toString(),{
        headers:{'User-Agent':UA,Accept:'application/json'},
        redirect:'error',signal:AbortSignal.timeout(10000),
      });
      if(!response.ok) return null;
      const body=await response.text();
      if(body.length>500_000) return null;
      entity=asRecord(asRecord(JSON.parse(body)).entities)[args.wikidataId] as RecordValue ?? {};
    }catch{return null;}
  }
  const p18=commonsFileFromP18(entity);
  const articleFile=typeof args.articlePageimage==='string' &&
    args.articlePageimage.length<=180 &&
    /\.(?:jpe?g|png|webp)$/i.test(args.articlePageimage) &&
    !args.articlePageimage.includes('/') ? args.articlePageimage :
    (args.articleUrl && !p18 ? await verifiedArticlePageimage({
      articleUrl:args.articleUrl,wikidataId:args.wikidataId,fetcher,
    }) : null);
  // Prefer P18. The page's own cover is a fallback ONLY if the exact article
  // matches the entity QID and the image is the Wikipedia pageimage.
  const files=[p18,articleFile].filter((name):name is string=>Boolean(name));
  for(const filename of [...new Set(files)]){
    const endpoint=new URL('https://commons.wikimedia.org/w/api.php');
    endpoint.search=new URLSearchParams({
      action:'query',format:'json',formatversion:'2',
      titles:'File:'+filename,prop:'imageinfo',
      iiprop:'url|extmetadata',iiurlwidth:'640',iilimit:'1',
    }).toString();
    try{
      const response=await fetcher(endpoint.toString(),{
        headers:{'User-Agent':UA,Accept:'application/json'},
        redirect:'error',signal:AbortSignal.timeout(10000),
      });
      if(!response.ok) continue;
      const raw=await response.text();
      if(raw.length>650_000) continue;
      const pages=asRecord(asRecord(JSON.parse(raw)).query).pages;
      const page=Array.isArray(pages)?asRecord(pages[0]):{};
      if(Object.hasOwn(page,'missing')) continue;
      const infos=Array.isArray(page.imageinfo)?page.imageinfo:[];
      const meta=asRecord(infos[0]), details=asRecord(meta.extmetadata);
      const license=clean(asRecord(details.LicenseShortName).value);
      const artist=clean(asRecord(details.Artist).value);
      const creditUrl=String(meta.descriptionurl??'');
      const image=String(meta.thumburl??meta.url??'');
      if(!supportedLicense(license)||artist.length<2||!validImage(image)||
        !creditUrl.startsWith('https://commons.wikimedia.org/wiki/File:')) continue;
      // Guard against a malformed result unexpectedly naming another file.
      if(typeof page.title==='string' &&
        decodeURIComponent(page.title.slice(5)).replace(/_/g,' ').toLowerCase() !==
        filename.replace(/_/g,' ').toLowerCase()) continue;
      const detailsUrl=clean(asRecord(details.LicenseUrl).value);
      const licenseUrl=detailsUrl.startsWith('https://creativecommons.org/')
        ? detailsUrl : '';
      return {
        image, imageLicense:license, imageCreditUrl:creditUrl,
        imageAttribution:artist+' · '+license+' · '+creditUrl+
          (licenseUrl?' · '+licenseUrl:''),
      };
    }catch{continue;}
  }
  return null;
}

export function photoVersionId(contentId:string,payload:unknown):string{
  return 'auto_v2_photo_'+createHash('sha256').update(contentId+'|'+JSON.stringify(payload)).digest('hex').slice(0,48);
}
