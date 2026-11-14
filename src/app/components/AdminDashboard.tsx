import { useEffect, useMemo, useState } from 'react';
import { Archive, ArrowLeft, BookOpen, Check, ChevronRight, Clock3, ExternalLink,
  FileSearch, ImageOff, Images, LoaderCircle, MapPinned, MoreHorizontal,
  Pencil, Plus, RefreshCw, Search, ShieldCheck, Utensils, X } from 'lucide-react';
import { provincesData } from '../../data/provincesData';

type Tab='content'|'review'|'update'|'report';
type Section='places'|'cuisine';
type Item={id:string;provinceId:string;section:Section;versionId:string;name:string;
  description:string;detail:string;image:string;imageLicense:string;imageAttribution:string;
  sourceUrls:string[];status:'published'|'archived'};
type ProvinceStat={provinceId:string;name:string;published:number;pending:number;
  missingImages:number;missingSources:number;missingCredits:number;errors:number};
type Totals={provinces:number;published:number;pending:number;missingImages:number;
  missingSources:number;missingCredits:number;pendingPhotos:number};
type QueueVersion={versionId:string;contentId:string;provinceId:string;section:Section;
  payload:Record<string,unknown>;sourceRef:string;createdAt:string};
type QueuePhoto={imageId:string;contentId:string;provinceId:string;section:Section;
  subjectName:string;imageUrl:string;sourceUrl:string;sourceKind:string;
  license:string;attribution:string;width:number;height:number};
type AdminJob={job_id:string;province_id:string;kind:string;state:string;
  result_json:string;error:string;created_at:string};
type FormState={mode:'create'|'edit'|'archive';id:string;provinceId:string;section:Section;
  name:string;description:string;detail:string;sourceOne:string;sourceTwo:string;reason:string};

const emptyForm:FormState={mode:'create',id:'',provinceId:'Ha Noi',section:'places',
  name:'',description:'',detail:'',sourceOne:'',sourceTwo:'',reason:''};
const provinceOptions=Object.entries(provincesData).filter(([id])=>!['Truong Sa','Hoang Sa'].includes(id));
const badge=(value:string)=>value==='published'?'bg-emerald-50 text-emerald-700':
  value==='archived'?'bg-slate-100 text-slate-600':'bg-amber-50 text-amber-700';
const label=(value:string)=>value==='published'?'Đã xuất bản':value==='archived'?'Đã gỡ':
  value==='queued'?'Chờ chạy':value==='running'?'Đang chạy':value==='completed'?'Hoàn tất':
  value==='failed'?'Có lỗi':value==='photos'?'Tìm ảnh':value==='sources'?'Tìm nguồn':value==='places'?'Địa điểm':'Ẩm thực';
const safeText=(value:unknown)=>typeof value==='string'?value:'';

async function apiGet<T>(view:string,query=''):Promise<T> {
  const response=await fetch('/api/admin?view='+view+query,{credentials:'same-origin',cache:'no-store'});
  const payload=await response.json() as T & {error?:string};
  if(!response.ok)throw Error(payload.error??'Không thể tải dữ liệu quản trị');
  return payload;
}
async function apiPost(body:Record<string,unknown>):Promise<void> {
  const response=await fetch('/api/admin',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json','X-VT-Admin':'1'},body:JSON.stringify(body)});
  const data=await response.json() as {error?:string};
  if(!response.ok)throw Error(data.error??'Không lưu được thay đổi');
}
function Thumb({src,kind}:{src:string;kind:Section}) {
  const [broken,setBroken]=useState(false);
  useEffect(()=>setBroken(false),[src]);
  return <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
    {src&&!broken?<img src={src} alt="" loading="lazy" onError={()=>setBroken(true)}
      className="h-full w-full object-cover"/>:kind==='cuisine'?<Utensils className="h-5 w-5 text-slate-400"/>:
      <ImageOff className="h-5 w-5 text-slate-400"/>}
  </div>;
}
function StatCard({label:caption,value,icon:Icon}:{label:string;value:number;icon:typeof MapPinned}) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3 sm:p-4">
    <Icon className="mb-2 h-4 w-4 text-slate-400" aria-hidden="true"/>
    <p className="text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
    <p className="mt-0.5 text-xs text-slate-500">{caption}</p>
  </div>;
}

export function AdminDashboard() {
  const [tab,setTab]=useState<Tab>('content');
  const [province,setProvince]=useState('');
  const [kind,setKind]=useState('');
  const [keyword,setKeyword]=useState('');
  const [totals,setTotals]=useState<Totals>({provinces:34,published:0,pending:0,
    missingImages:0,missingSources:0,missingCredits:0,pendingPhotos:0});
  const [stats,setStats]=useState<ProvinceStat[]>([]);
  const [items,setItems]=useState<Item[]>([]);
  const [versions,setVersions]=useState<QueueVersion[]>([]);
  const [photos,setPhotos]=useState<QueuePhoto[]>([]);
  const [jobs,setJobs]=useState<AdminJob[]>([]);
  const [history,setHistory]=useState<Array<{audit_id:string;action:string;created_at:string;reason:string;content_id:string}>>([]);
  const [draft,setDraft]=useState<FormState|null>(null);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [fatal,setFatal]=useState('');
  const [message,setMessage]=useState('');
  const [selectedPhotos,setSelectedPhotos]=useState<Record<string,string>>({});

  const loadSummary=async()=>{const data=await apiGet<{totals:Totals;provinces:ProvinceStat[]}>('summary');
    setTotals(data.totals);setStats(data.provinces);};
  const loadItems=async(id=province)=>{const data=await apiGet<{items:Item[]}>('items',id?'&provinceId='+encodeURIComponent(id):'');setItems(data.items);};
  const loadQueue=async()=>{const data=await apiGet<{versions:QueueVersion[];photos:QueuePhoto[]}>('queue');setVersions(data.versions);setPhotos(data.photos);};
  const loadJobs=async()=>{const data=await apiGet<{jobs:AdminJob[]}>('jobs');setJobs(data.jobs);};
  const loadHistory=async()=>{const data=await apiGet<{history:typeof history}>('history');setHistory(data.history);};
  const reload=async()=>{await Promise.all([loadSummary(),loadItems(),loadQueue(),loadJobs(),loadHistory()]);};
  useEffect(()=>{
    let active=true;
    void Promise.all([loadSummary(),loadItems('')]).then(()=>{if(active)setLoading(false);})
      .catch(err=>{if(active){setFatal(String(err));setLoading(false);}});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{if(!fatal)void loadItems(province).catch(err=>setMessage(String(err)));},[province]);
  useEffect(()=>{
    if(fatal)return;
    const execute=tab==='review'?loadQueue:tab==='update'?loadJobs:tab==='report'?loadHistory:loadSummary;
    void execute().catch(err=>setMessage(String(err)));
  },[tab]);
  useEffect(()=>{
    if(tab!=='update')return;
    const timer=setInterval(()=>{void loadJobs().catch(()=>{});},20000);
    return ()=>clearInterval(timer);
  },[tab]);
  const filtered=useMemo(()=>items.filter(item=>
    (!kind||kind===item.section)&&
    (item.name+' '+provincesData[item.provinceId as keyof typeof provincesData]?.name)
      .toLocaleLowerCase('vi').includes(keyword.toLocaleLowerCase('vi'))
  ),[items,kind,keyword]);
  const groupedPhotos=useMemo(()=>{
    const groups=new Map<string,QueuePhoto[]>();
    for(const photo of photos)groups.set(photo.contentId,[...(groups.get(photo.contentId)??[]),photo]);
    return [...groups.entries()];
  },[photos]);
  const openEdit=(item:Item)=>{
    setDraft({mode:'edit',id:item.id,provinceId:item.provinceId,section:item.section,
      name:item.name,description:item.description,detail:item.detail,
      sourceOne:item.sourceUrls[0]??'',sourceTwo:item.sourceUrls[1]??'',reason:''});
  };
  const openVersionEdit=(item:QueueVersion)=>{
    setDraft({mode:'edit',id:item.contentId,provinceId:item.provinceId,section:item.section,
      name:safeText(item.payload.name),description:safeText(item.payload.description),
      detail:safeText(item.payload.detail),
      sourceOne:Array.isArray(item.payload.sourceUrls)?safeText(item.payload.sourceUrls[0]):item.sourceRef,
      sourceTwo:Array.isArray(item.payload.sourceUrls)?safeText(item.payload.sourceUrls[1]):'',reason:''});
  };
  const mutate=async(body:Record<string,unknown>,success:string)=>{
    setBusy(true);setMessage('');
    try {await apiPost(body);setDraft(null);await reload();setMessage(success);}
    catch(err){setMessage(err instanceof Error?err.message:String(err));}
    finally {setBusy(false);}
  };
  const submit=async()=>{
    if(!draft)return;
    if(draft.mode==='archive'){
      await mutate({action:'archive',contentId:draft.id,reason:draft.reason},'Đã gỡ nội dung khỏi website.');
      return;
    }
    await mutate({action:draft.mode,contentId:draft.id,provinceId:draft.provinceId,
      section:draft.section,name:draft.name,description:draft.description,
      detail:draft.detail,sourceUrls:[draft.sourceOne,draft.sourceTwo]},
      'Đã lưu bản nháp. Nội dung sẽ chờ duyệt trước khi xuất bản.');
    setTab('review');
  };
  if(loading)return <main className="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin"/>Đang kiểm tra quyền quản trị...</main>;
  if(fatal)return <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-6">
    <div className="max-w-sm rounded-2xl border bg-white p-7 text-center shadow-sm">
      <ShieldCheck className="mx-auto mb-3 h-9 w-9 text-slate-400"/>
      <h1 className="text-xl font-bold text-slate-900">Không thể mở trang quản trị</h1>
      <p className="mt-3 text-sm text-slate-600">{fatal}</p>
      <a href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ArrowLeft className="h-4 w-4"/> Về trang du lịch</a>
    </div>
  </main>;

  return <main className="min-h-dvh bg-[#f7faf9] px-3 py-5 font-sans text-slate-900 sm:px-6 sm:py-9">
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <MapPinned className="h-5 w-5"/>
          </div>
          <div><h1 className="text-xl font-bold tracking-tight">VietnamTravel</h1>
            <p className="text-xs text-slate-500">Content Management</p></div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Admin</span>
          <a href="/" className="text-xs font-semibold text-emerald-700 hover:underline">Xem website</a>
        </div>
      </header>

      <section aria-label="Thống kê nội dung" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tỉnh / thành" value={totals.provinces} icon={MapPinned}/>
        <StatCard label="Thiếu ảnh" value={totals.missingImages} icon={ImageOff}/>
        <StatCard label="Món thiếu nguồn" value={totals.missingSources} icon={BookOpen}/>
        <StatCard label="Chờ duyệt ảnh" value={totals.pendingPhotos} icon={Clock3}/>
      </section>
      <div className="my-6 border-t border-slate-100"/>
      <nav aria-label="Khu vực quản trị" className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
        {([{id:'content',name:'Nội dung'},{id:'review',name:'Duyệt'},{id:'update',name:'Cập nhật'},{id:'report',name:'Báo cáo'}] as const).map(x=>
          <button key={x.id} type="button" onClick={()=>{setTab(x.id);setMessage('');}}
            aria-current={tab===x.id?'page':undefined}
            className={'rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:text-sm '+(tab===x.id?'bg-white text-emerald-800 shadow-sm':'text-slate-500 hover:text-slate-800')}>{x.name}</button>)}
      </nav>
      {message&&<div role="status" className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</div>}

      {tab==='content'&&<section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div><h2 className="text-base font-semibold">Quản lý nội dung</h2>
            <p className="mt-1 text-xs text-slate-500">Địa điểm & ẩm thực · Thêm, sửa, gỡ và khôi phục</p></div>
          <button type="button" onClick={()=>setDraft({...emptyForm,provinceId:province||'Ha Noi'})}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 sm:text-sm">
            <Plus className="h-4 w-4"/> Thêm mới
          </button>
        </div>
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_190px_145px]">
          <label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/>
            <span className="sr-only">Tìm kiếm nội dung</span>
            <input value={keyword} onChange={event=>setKeyword(event.target.value)} placeholder="Tìm tên địa điểm, món ăn..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"/></label>
          <select aria-label="Lọc tỉnh" value={province} onChange={e=>setProvince(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
            <option value="">Tất cả tỉnh/thành</option>
            {provinceOptions.map(([id,p])=><option key={id} value={id}>{p.name}</option>)}
          </select>
          <select aria-label="Lọc loại nội dung" value={kind} onChange={e=>setKind(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
            <option value="">Tất cả loại</option><option value="places">Địa điểm</option><option value="cuisine">Ẩm thực</option>
          </select>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.slice(0,120).map(item=><div key={item.id} className="flex items-center gap-3 py-3">
            <Thumb src={item.image} kind={item.section}/>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{provincesData[item.provinceId as keyof typeof provincesData]?.name} · {label(item.section)}</p>
              <span className={'mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium '+badge(item.status)}>{label(item.status)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" title="Sửa nội dung" aria-label={'Sửa '+item.name} onClick={()=>openEdit(item)}
                className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800"><Pencil className="h-4 w-4"/></button>
              {item.status==='published'?
                <button type="button" title="Gỡ khỏi hiển thị" aria-label={'Gỡ '+item.name}
                  onClick={()=>setDraft({...emptyForm,mode:'archive',id:item.id,name:item.name,provinceId:item.provinceId,section:item.section})}
                  className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Archive className="h-4 w-4"/></button>:
                <button type="button" title="Khôi phục nội dung" aria-label={'Khôi phục '+item.name}
                  disabled={busy} onClick={()=>void mutate({action:'unarchive',contentId:item.id},'Đã khôi phục mục.')}
                  className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"><RefreshCw className="h-4 w-4"/></button>}
            </div>
          </div>)}
          {!filtered.length&&<div className="py-12 text-center text-sm text-slate-500">Không có nội dung phù hợp.</div>}
        </div>
        {filtered.length>120&&<p className="py-3 text-xs text-slate-500">Đang hiển thị 120 mục đầu; chọn tỉnh để xem các mục còn lại.</p>}
      </section>}

      {tab==='review'&&<section className="mt-6 space-y-5">
        <div><h2 className="font-semibold">Hàng chờ duyệt</h2>
          <p className="mt-1 text-xs text-slate-500">Kiểm tra đủ hai nguồn độc lập và giấy phép ảnh trước khi công bố.</p></div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Nội dung ({versions.length})</h3>
          <button type="button" onClick={()=>void loadQueue()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Tải lại hàng duyệt"><RefreshCw className="h-4 w-4"/></button>
        </div>
        {!versions.length&&<p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Không có nội dung mới đang chờ duyệt.</p>}
        {versions.map(v=><article key={v.versionId} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <div><h4 className="text-sm font-semibold">{safeText(v.payload.name)||'Chưa có tên'}</h4>
              <p className="mt-1 text-xs text-slate-500">{provincesData[v.provinceId as keyof typeof provincesData]?.name} · {label(v.section)}</p></div>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">Chờ duyệt</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{safeText(v.payload.description)}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {(Array.isArray(v.payload.sourceUrls)?v.payload.sourceUrls:[v.sourceRef]).filter(x=>typeof x==='string'&&x.startsWith('https://')).map((url,index)=>
              <a key={index} href={url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 underline">Nguồn {index+1} <ExternalLink className="h-3 w-3"/></a>)}
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={()=>openVersionEdit(v)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Sửa / bổ sung nguồn</button>
            <button type="button" disabled={busy} onClick={()=>void mutate({action:'moderate',decision:'reject',versionId:v.versionId},'Đã từ chối bản nháp.')}
              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">Từ chối</button>
            <button type="button" disabled={busy} onClick={()=>void mutate({action:'moderate',decision:'approve',versionId:v.versionId},'Đã duyệt và xuất bản nội dung.')}
              className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Duyệt & xuất bản</button>
          </div>
        </article>)}
        <h3 className="pt-2 text-sm font-semibold">Ảnh ứng viên ({photos.length})</h3>
        {!groupedPhotos.length&&<p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có ảnh ứng viên. Có thể yêu cầu tìm lại ở tab Cập nhật.</p>}
        {groupedPhotos.map(([contentId,group])=><article key={contentId} className="rounded-2xl border border-slate-200 p-4">
          <h4 className="text-sm font-semibold">{group[0].subjectName}</h4>
          <p className="mt-1 text-xs text-slate-500">{provincesData[group[0].provinceId as keyof typeof provincesData]?.name} · Chọn đúng chủ thể trước khi duyệt</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {group.map(photo=><label key={photo.imageId}
              className={'cursor-pointer overflow-hidden rounded-xl border-2 '+(selectedPhotos[contentId]===photo.imageId?'border-emerald-600':'border-slate-100')}>
              <input type="radio" name={'photo-'+contentId} className="sr-only"
                checked={selectedPhotos[contentId]===photo.imageId}
                onChange={()=>setSelectedPhotos(x=>({...x,[contentId]:photo.imageId}))}/>
              <img src={photo.imageUrl} alt={'Ứng viên ảnh '+photo.subjectName} loading="lazy" className="aspect-[4/3] w-full object-cover"/>
              <div className="p-2"><p className="text-[11px] font-semibold">{photo.license}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{photo.attribution}</p>
                <a href={photo.sourceUrl} onClick={e=>e.stopPropagation()} target="_blank" rel="noopener noreferrer"
                  className="mt-1 inline-block text-[11px] text-emerald-700 underline">Trang nguồn</a></div>
            </label>)}
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button type="button" disabled={busy||!selectedPhotos[contentId]} onClick={()=>void mutate({action:'photo',decision:'reject',imageId:selectedPhotos[contentId]},'Đã từ chối ảnh.')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs disabled:opacity-40">Từ chối ảnh</button>
            <button type="button" disabled={busy||!selectedPhotos[contentId]} onClick={()=>void mutate({action:'photo',decision:'approve',imageId:selectedPhotos[contentId]},'Đã duyệt ảnh.')}
              className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Chọn ảnh & duyệt</button>
          </div>
        </article>)}
      </section>}

      {tab==='update'&&<section className="mt-6 space-y-4">
        <h2 className="text-base font-semibold">Cập nhật theo tỉnh</h2>
        <p className="text-sm text-slate-500">Yêu cầu được xếp hàng, không giữ trang web chờ Openverse hoặc Overpass.</p>
        <select aria-label="Tỉnh cần cập nhật" value={province} onChange={e=>setProvince(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm sm:max-w-sm">
          <option value="">Chọn tỉnh/thành</option>
          {provinceOptions.map(([id,p])=><option key={id} value={id}>{p.name}</option>)}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={!province||busy} onClick={()=>void mutate({action:'enqueue',provinceId:province,kind:'photos'},'Đã đưa yêu cầu tìm ảnh vào hàng đợi.')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-400 disabled:opacity-40">
            <Images className="h-6 w-6 text-emerald-700"/><span className="text-sm font-semibold">Tìm lại hình ảnh<small className="mt-1 block font-normal text-slate-500">Wikimedia / Openverse · chỉ thêm vào hàng chờ duyệt</small></span><ChevronRight className="ml-auto h-4 w-4"/>
          </button>
          <button type="button" disabled={!province||busy} onClick={()=>void mutate({action:'enqueue',provinceId:province,kind:'sources'},'Đã đưa yêu cầu kiểm tra nguồn vào hàng đợi.')}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-400 disabled:opacity-40">
            <FileSearch className="h-6 w-6 text-sky-700"/><span className="text-sm font-semibold">Kiểm tra nội dung & nguồn<small className="mt-1 block font-normal text-slate-500">Địa điểm / ẩm thực · không tự xuất bản</small></span><ChevronRight className="ml-auto h-4 w-4"/>
          </button>
        </div>
        <div className="flex items-center justify-between pt-2"><h3 className="text-sm font-semibold">Tiến độ tác vụ</h3>
          <button type="button" onClick={()=>void loadJobs()} className="inline-flex items-center gap-2 text-xs text-emerald-700"><RefreshCw className="h-4 w-4"/> Làm mới</button></div>
        {!jobs.length&&<p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Chưa có yêu cầu cập nhật.</p>}
        {jobs.map(job=><div key={job.job_id} className="flex items-start gap-3 border-b border-slate-100 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100"><Clock3 className="h-4 w-4 text-slate-500"/></div>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{label(job.kind)} · {provincesData[job.province_id as keyof typeof provincesData]?.name}</p>
            <p className="mt-1 text-xs text-slate-500">{job.error||safeText(job.result_json)}</p></div>
          <span className={'rounded-full px-2 py-1 text-xs '+(job.state==='failed'?'bg-rose-50 text-rose-700':job.state==='completed'?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-600')}>{label(job.state)}</span>
        </div>)}
      </section>}

      {tab==='report'&&<section className="mt-6">
        <h2 className="text-base font-semibold">Báo cáo chất lượng dữ liệu</h2>
        <p className="mt-1 text-xs text-slate-500">Ảnh thiếu ghi công chưa đồng nghĩa vi phạm bản quyền; đây là các mục cần rà soát.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[630px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500"><tr>
              <th className="px-3 py-3">Tỉnh/thành</th><th className="px-3 py-3 text-right">Đã công bố</th>
              <th className="px-3 py-3 text-right">Chờ duyệt</th><th className="px-3 py-3 text-right">Thiếu ảnh</th>
              <th className="px-3 py-3 text-right">Thiếu nguồn</th><th className="px-3 py-3 text-right">Thiếu ghi công</th>
              <th className="px-3 py-3 text-right">Lỗi</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">{stats.map(p=><tr key={p.provinceId}
              onClick={()=>{setProvince(p.provinceId);setTab('content');}} className="cursor-pointer hover:bg-emerald-50/40">
              <td className="px-3 py-3 font-medium">{p.name}</td>
              {[p.published,p.pending,p.missingImages,p.missingSources,p.missingCredits,p.errors].map((v,i)=><td key={i} className="px-3 py-3 text-right tabular-nums">{v}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
        <h3 className="mt-6 text-sm font-semibold">Nhật ký thay đổi gần đây</h3>
        <div className="mt-2 divide-y divide-slate-100">
          {history.slice(0,15).map(h=><div key={h.audit_id} className="flex justify-between gap-2 py-2 text-xs">
            <span className="min-w-0 truncate text-slate-600">{h.action} · {h.content_id||h.reason}</span>
            <time className="shrink-0 text-slate-400">{new Date(h.created_at).toLocaleString('vi-VN')}</time>
          </div>)}
          {!history.length&&<p className="py-3 text-xs text-slate-500">Chưa có thay đổi nào được ghi lại.</p>}
        </div>
      </section>}
    </div>

    {draft&&<div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" role="presentation" onClick={()=>!busy&&setDraft(null)}>
      <section role="dialog" aria-modal="true" aria-label={draft.mode==='archive'?'Gỡ nội dung':'Chỉnh sửa nội dung'}
        onClick={event=>event.stopPropagation()} className="flex h-full w-full max-w-xl flex-col overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-bold">{draft.mode==='create'?'Thêm nội dung':draft.mode==='edit'?'Sửa nội dung':'Gỡ khỏi hiển thị'}</h2>
          <p className="mt-1 text-xs text-slate-500">{draft.mode==='archive'?'Nội dung được giữ lại để khôi phục':'Thay đổi sẽ vào hàng chờ duyệt'}</p></div>
          <button type="button" aria-label="Đóng" disabled={busy} onClick={()=>setDraft(null)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5"/></button>
        </div>
        {draft.mode==='archive'?<div className="space-y-4">
          <p className="text-sm">Bạn muốn gỡ <strong>{draft.name}</strong> khỏi website?</p>
          <label className="block text-sm font-medium">Lý do gỡ
            <textarea value={draft.reason} onChange={e=>setDraft(x=>x?{...x,reason:e.target.value}:x)}
              placeholder="Ví dụ: Thông tin cần kiểm chứng lại..." rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/>
          </label>
        </div>:<div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold">Tỉnh/thành
              <select disabled={draft.mode==='edit'} value={draft.provinceId} onChange={e=>setDraft(x=>x?{...x,provinceId:e.target.value}:x)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
                {provinceOptions.map(([id,p])=><option key={id} value={id}>{p.name}</option>)}
              </select></label>
            <label className="block text-xs font-semibold">Loại nội dung
              <select disabled={draft.mode==='edit'} value={draft.section} onChange={e=>setDraft(x=>x?{...x,section:e.target.value as Section}:x)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <option value="places">Địa điểm</option><option value="cuisine">Ẩm thực</option>
              </select></label>
          </div>
          {([{key:'name',label:'Tên địa điểm / món ăn',max:150},{key:'description',label:'Mô tả ngắn',max:850},{key:'detail',label:'Thông tin chi tiết',max:2400}] as const).map(field=>
            <label key={field.key} className="block text-xs font-semibold">{field.label}
              <textarea rows={field.key==='name'?1:field.key==='description'?3:5}
                maxLength={field.max} value={draft[field.key]}
                onChange={e=>setDraft(x=>x?{...x,[field.key]:e.target.value}:x)}
                className="mt-1 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-600 focus:outline-none"/>
            </label>)}
          <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">Cần hai nguồn thông tin độc lập. Ảnh được chọn tại tab Duyệt sau khi kiểm tra giấy phép.</p>
          <label className="block text-xs font-semibold">URL nguồn 1
            <input type="url" value={draft.sourceOne} onChange={e=>setDraft(x=>x?{...x,sourceOne:e.target.value}:x)}
              placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
          <label className="block text-xs font-semibold">URL nguồn 2 (website độc lập)
            <input type="url" value={draft.sourceTwo} onChange={e=>setDraft(x=>x?{...x,sourceTwo:e.target.value}:x)}
              placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
        </div>}
        <div className="mt-auto flex justify-end gap-2 border-t border-slate-100 pt-5">
          <button type="button" disabled={busy} onClick={()=>setDraft(null)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">Hủy</button>
          <button type="button" disabled={busy||(draft.mode==='archive'?draft.reason.trim().length<5:
            !draft.name.trim()||!draft.description.trim()||!draft.sourceOne.trim()||!draft.sourceTwo.trim())}
            onClick={()=>void submit()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Check className="h-4 w-4"/>}
            {draft.mode==='archive'?'Xác nhận gỡ':'Lưu chờ duyệt'}
          </button>
        </div>
      </section>
    </div>}
  </main>;
}
