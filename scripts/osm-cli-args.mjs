/** Normalize npm/PowerShell/CMD argument forwarding on Windows.
 * npm can forward a quoted province as ^Can^ Tho^ or split it into two argv
 * parts. Resolve only against known 2025 province IDs/names.
 */
function normalized(value) {
  return value.replace(/\^/g,'').replace(/["“”'‘’]/g,'')
    .replace(/[_-]/g,' ').trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[đĐ]/g,'d').toLowerCase()
    .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function withoutPrefix(value){
  return value.replace(/^(?:tinh|tp|thanh pho)\s+/, '');
}
export const OSM_CLI_USAGE =
  'Usage: npm run catalog:osm -- --province Can_Tho (or --province="Can Tho") | --all';

export function resolveOsmCliArgs(args,provinceRecords){
  const provinceIds=Object.keys(provinceRecords).filter(id=>
    !['Truong Sa','Hoang Sa'].includes(id));
  if(args.length===1 && args[0]==='--all') return provinceIds;
  let raw='';
  if(args[0]==='--province'&&args.length>=2)
    raw=args.slice(1).join(' ');
  else if(args.length>=1&&args[0].startsWith('--province='))
    raw=[args[0].slice('--province='.length),...args.slice(1)].join(' ');
  else throw Error(OSM_CLI_USAGE);
  const given=withoutPrefix(normalized(raw));
  const candidates=provinceIds.filter(id=>{
    const name=withoutPrefix(normalized(provinceRecords[id].name));
    const key=withoutPrefix(normalized(id));
    return [name,key,name.replace(/ /g,''),key.replace(/ /g,'')].includes(given);
  });
  if(candidates.length!==1) {
    throw Error('Unknown province ID: '+raw+
      '. Try --province Can_Tho or --province=Can_Tho. '+OSM_CLI_USAGE);
  }
  return candidates;
}
