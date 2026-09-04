import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_PATH = path.join(ROOT, 'src/app/components/ProvinceDetails.tsx');
const DATA_PATH = path.join(ROOT, 'src/data/provinceDetailsData.ts');

const OFFICIAL_SOURCE =
  'https://xaydungchinhsach.chinhphu.vn/chi-tiet-34-don-vi-hanh-chinh-cap-tinh-tu-12-6-2025-119250612141845533.htm';

const provinceToData = {
  'Ha Noi': 'HANOI_DATA',
  'Ho Chi Minh': 'HCM_DATA',
  'Da Nang': 'DANANG_DATA',
  'Dien Bien': 'DIENBIEN_DATA',
  'Lai Chau': 'LAICHAU_DATA',
  'Son La': 'SONLA_DATA',
  'Lao Cai': 'LAOCAI_DATA',
  'Tuyen Quang': 'TUYENQUANG_DATA',
  'Cao Bang': 'CAOBANG_DATA',
  'Thai Nguyen': 'THAINGUYEN_DATA',
  'Lang Son': 'LANGSON_DATA',
  'Phu Tho': 'PHUTHO_DATA',
  'Bac Ninh': 'BACNINH_DATA',
  'Quang Ninh': 'QUANGNINH_DATA',
  'Hai Phong': 'HAIPHONG_DATA',
  'Hung Yen': 'HUNGYEN_DATA',
  'Ninh Binh': 'NINHBINH_DATA',
  'Thanh Hoa': 'THANHHOA_DATA',
  'Nghe An': 'NGHEAN_DATA',
  'Ha Tinh': 'HATINH_DATA',
  'Quang Tri': 'QUANGTRI_DATA',
  Hue: 'HUE_DATA',
  'Quang Ngai': 'QUANGNGAI_DATA',
  'Gia Lai': 'GIALAI_DATA',
  'Dak Lak': 'DAKLAK_DATA',
  'Khanh Hoa': 'KHANHHOA_DATA',
  'Lam Dong': 'LAMDONG_DATA',
  'Dong Nai': 'DONGNAI_DATA',
  'Tay Ninh': 'TAYNINH_DATA',
  'Dong Thap': 'DONGTHAP_DATA',
  'Vinh Long': 'VINHLONG_DATA',
  'Can Tho': 'CANTHO_DATA',
  'An Giang': 'ANGIANG_DATA',
  'Ca Mau': 'CAMAU_DATA',
  'Truong Sa': 'QUANDAOTRUONGSA_DATA',
  'Hoang Sa': 'HOANGSA_DATA',
};

const merged = {
  TUYENQUANG_DATA: ['13.795,50 km²', '1.865.270 người', 'Hà Giang và Tuyên Quang'],
  LAOCAI_DATA: ['13.256,92 km²', '1.778.785 người', 'Yên Bái và Lào Cai'],
  THAINGUYEN_DATA: ['8.375,21 km²', '1.799.489 người', 'Bắc Kạn và Thái Nguyên'],
  PHUTHO_DATA: ['9.361,38 km²', '4.022.638 người', 'Vĩnh Phúc, Hòa Bình và Phú Thọ'],
  BACNINH_DATA: ['4.718,60 km²', '3.619.433 người', 'Bắc Giang và Bắc Ninh'],
  HUNGYEN_DATA: ['2.514,81 km²', '3.567.943 người', 'Thái Bình và Hưng Yên'],
  HAIPHONG_DATA: ['3.194,72 km²', '4.664.124 người', 'thành phố Hải Phòng và Hải Dương'],
  NINHBINH_DATA: ['3.942,62 km²', '4.412.264 người', 'Hà Nam, Nam Định và Ninh Bình'],
  QUANGTRI_DATA: ['12.700 km²', '1.870.845 người', 'Quảng Bình và Quảng Trị'],
  DANANG_DATA: ['11.859,59 km²', '3.065.628 người', 'thành phố Đà Nẵng và Quảng Nam'],
  QUANGNGAI_DATA: ['14.832,55 km²', '2.161.755 người', 'Kon Tum và Quảng Ngãi'],
  GIALAI_DATA: ['21.576,53 km²', '3.583.693 người', 'Bình Định và Gia Lai'],
  KHANHHOA_DATA: ['8.555,86 km²', '2.243.554 người', 'Ninh Thuận và Khánh Hòa'],
  LAMDONG_DATA: ['24.233,07 km²', '3.872.999 người', 'Đắk Nông, Bình Thuận và Lâm Đồng'],
  DAKLAK_DATA: ['18.096,40 km²', '3.346.853 người', 'Phú Yên và Đắk Lắk'],
  HCM_DATA: ['6.772,59 km²', '14.002.598 người', 'TP. Hồ Chí Minh, Bà Rịa - Vũng Tàu và Bình Dương'],
  DONGNAI_DATA: ['12.737,18 km²', '4.491.408 người', 'Bình Phước và Đồng Nai'],
  TAYNINH_DATA: ['8.536,44 km²', '3.254.170 người', 'Long An và Tây Ninh'],
  CANTHO_DATA: ['6.360,83 km²', '4.199.824 người', 'TP. Cần Thơ, Sóc Trăng và Hậu Giang'],
  VINHLONG_DATA: ['6.296,20 km²', '4.257.581 người', 'Bến Tre, Trà Vinh và Vĩnh Long'],
  DONGTHAP_DATA: ['5.938,64 km²', '4.370.046 người', 'Tiền Giang và Đồng Tháp'],
  CAMAU_DATA: ['7.942,39 km²', '2.606.672 người', 'Bạc Liêu và Cà Mau'],
  ANGIANG_DATA: ['9.888,91 km²', '4.952.238 người', 'Kiên Giang và An Giang'],
};

const assetAliases = new Map([
  ['/banner/landmark81.jpg', '/banner/landmark81.jpeg'],
  ['/banner/banhtrangcuon.jpg', '/banner/banhtrancuon.jpg'],
  ['/banner/xoinepnuong.webp', '/banner/xoinephuong.webp'],
  ['/banner/ganuong.pnj', '/banner/ganuong.png'],
]);

function findObjectEnd(source, openBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error('Unable to find closing brace for province data object.');
}

function extractDataBlocks(source) {
  const regex = /const\s+([A-Z][A-Z0-9_]*_DATA)\s*=\s*\{/g;
  const blocks = new Map();
  let match;

  while ((match = regex.exec(source)) !== null) {
    const name = match[1];
    const openBraceIndex = source.indexOf('{', match.index);
    const closeBraceIndex = findObjectEnd(source, openBraceIndex);
    let endIndex = closeBraceIndex + 1;
    while (/\s/.test(source[endIndex] ?? '')) endIndex += 1;
    if (source[endIndex] === ';') endIndex += 1;
    blocks.set(name, source.slice(match.index, endIndex));
    regex.lastIndex = endIndex;
  }

  return blocks;
}

function modernizeBlock(name, block) {
  for (const [from, to] of assetAliases) block = block.split(from).join(to);

  const stats = merged[name];
  if (!stats) return block;

  const [area, population, origins] = stats;
  block = block.replace(
    /(\{\s*label:\s*"Diện tích",\s*value:\s*")[^"]*("\s*\})/,
    `$1${area}$2`,
  );
  block = block.replace(
    /(\{\s*label:\s*"Dân số",\s*value:\s*")[^"]*("\s*\})/,
    `$1${population} (NQ 202/2025/QH15)$2`,
  );

  const description = `Đơn vị hành chính hiện nay được hình thành sau đợt sắp xếp cấp tỉnh năm 2025 trên cơ sở ${origins}. Khu vực mới kế thừa không gian văn hóa, cảnh quan, di sản và thế mạnh du lịch của các địa phương trước sắp xếp.`;
  block = block.replace(
    /(overview:\s*\{\s*description:\s*)"(?:\\.|[^"\\])*"/s,
    `$1${JSON.stringify(description)}`,
  );

  const event = `Thực hiện Nghị quyết 202/2025/QH15, đơn vị hành chính mới được hình thành trên cơ sở ${origins}; chính quyền địa phương mới chính thức hoạt động từ ngày 01/07/2025.`;
  block = block.replace(
    /history:\s*\[/,
    `history: [\n    { year: "2025", event: ${JSON.stringify(event)} },`,
  );

  return block;
}

function makeDataFile(blocks) {
  const neededNames = new Set(Object.values(provinceToData));
  const missing = [...neededNames].filter((name) => !blocks.has(name));
  if (missing.length) throw new Error(`Missing data blocks: ${missing.join(', ')}`);

  const orderedBlocks = [...neededNames]
    .map((name) => modernizeBlock(name, blocks.get(name)))
    .join('\n\n');

  const catalogEntries = Object.entries(provinceToData)
    .map(([province, dataName]) => {
      const source = merged[dataName]
        ? `,\n    administrativeSource: { label: 'Nghị quyết 202/2025/QH15', url: OFFICIAL_SOURCE, updatedAt: '01/07/2025' }`
        : '';
      return `  ${JSON.stringify(province)}: {\n    title: provincesData[${JSON.stringify(province)}].name,\n    banner: provincesData[${JSON.stringify(province)}].banner,\n    data: ${dataName}${source}\n  }`;
    })
    .join(',\n');

  return `import { provincesData, type ProvinceId } from './provincesData';\n\nexport interface ProvinceContent {\n  overview: {\n    description: string;\n    stats: Array<{ label: string; value: string }>;\n  };\n  history: Array<{ year: string; event: string }>;\n  places: Array<{ name: string; description: string; image: string }>;\n  cuisine: Array<{ name: string; description: string; image: string }>;\n}\n\nexport interface ProvinceDetailsCatalogItem {\n  title: string;\n  banner: string;\n  data: ProvinceContent;\n  administrativeSource?: { label: string; url: string; updatedAt: string };\n}\n\nconst OFFICIAL_SOURCE = ${JSON.stringify(OFFICIAL_SOURCE)};\n\n${orderedBlocks}\n\nexport const provinceDetailsCatalog = {\n${catalogEntries}\n} satisfies Record<ProvinceId, ProvinceDetailsCatalogItem>;\n`;
}

function makeComponentFile() {
  return `import { useEffect, useState, type ComponentType } from 'react';\nimport { AnimatePresence, motion } from 'framer-motion';\nimport { Camera, Clock, Info, MapPin, Utensils } from 'lucide-react';\nimport { provinceDetailsCatalog } from '../../data/provinceDetailsData';\nimport { ImageWithFallback } from './figma/ImageWithFallback';\n\ntype TabType = 'overview' | 'history' | 'places' | 'cuisine';\n\nconst TABS: Array<{ id: TabType; label: string; icon: ComponentType<{ className?: string }> }> = [\n  { id: 'overview', label: 'Tổng quan', icon: Info },\n  { id: 'history', label: 'Lịch sử', icon: Clock },\n  { id: 'places', label: 'Địa điểm', icon: Camera },\n  { id: 'cuisine', label: 'Ẩm thực', icon: Utensils },\n];\n\nexport function ProvinceDetails({ province }: { province: string }) {\n  const [activeTab, setActiveTab] = useState<TabType>('overview');\n  const current = provinceDetailsCatalog[province as keyof typeof provinceDetailsCatalog];\n\n  useEffect(() => {\n    setActiveTab('overview');\n  }, [province]);\n\n  if (!current) {\n    return (\n      <div className=\"flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm\">\n        <div>\n          <MapPin className=\"mx-auto mb-3 h-9 w-9 text-gray-300\" aria-hidden=\"true\" />\n          <h2 className=\"text-lg font-semibold text-gray-900\">Chọn một tỉnh thành</h2>\n          <p className=\"mt-1 text-sm text-gray-500\">Click trên bản đồ hoặc dùng ô tìm kiếm để bắt đầu khám phá.</p>\n        </div>\n      </div>\n    );\n  }\n\n  const { title, banner, data, administrativeSource } = current;\n\n  return (\n    <div className=\"flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm\">\n      <div className=\"relative h-[220px] w-full shrink-0 sm:h-[240px]\">\n        <ImageWithFallback\n          key={province}\n          src={banner}\n          alt={title}\n          className=\"h-full w-full object-cover\"\n          loading=\"eager\"\n        />\n        <div className=\"absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent\" />\n        <div className=\"absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6\">\n          <h1 className=\"mb-2 text-3xl font-bold text-white sm:text-4xl\">{title}</h1>\n          <div className=\"flex items-center text-sm font-medium text-white/90\">\n            <MapPin className=\"mr-1 h-4 w-4\" aria-hidden=\"true\" />\n            <span>Việt Nam</span>\n          </div>\n        </div>\n      </div>\n\n      <div className=\"hide-scrollbar flex shrink-0 overflow-x-auto border-b border-gray-100 px-3 pt-3 sm:px-6 sm:pt-4\" role=\"tablist\" aria-label=\"Thông tin tỉnh thành\">\n        {TABS.map((tab) => {\n          const Icon = tab.icon;\n          const isActive = activeTab === tab.id;\n          return (\n            <button\n              key={tab.id}\n              type=\"button\"\n              role=\"tab\"\n              aria-selected={isActive}\n              onClick={() => setActiveTab(tab.id)}\n              className={\`relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 \${\n                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'\n              }\`}\n            >\n              <Icon className=\"h-4 w-4\" />\n              {tab.label}\n              {isActive && (\n                <motion.div\n                  layoutId=\"activeTab\"\n                  className=\"absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C]\"\n                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}\n                />\n              )}\n            </button>\n          );\n        })}\n      </div>\n\n      <div className=\"custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6\">\n        <AnimatePresence mode=\"wait\">\n          <motion.div\n            key={\`\${province}-\${activeTab}\`}\n            initial={{ opacity: 0, y: 8 }}\n            animate={{ opacity: 1, y: 0 }}\n            exit={{ opacity: 0, y: -8 }}\n            transition={{ duration: 0.18 }}\n          >\n            {activeTab === 'overview' && (\n              <div className=\"space-y-6\">\n                <p className=\"leading-relaxed text-gray-600\">{data.overview.description}</p>\n                <div className=\"grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4\">\n                  {data.overview.stats.map((stat) => (\n                    <div key={stat.label} className=\"rounded-2xl bg-gray-50 p-4\">\n                      <p className=\"mb-1 text-xs text-gray-500\">{stat.label}</p>\n                      <p className=\"font-semibold text-gray-900\">{stat.value}</p>\n                    </div>\n                  ))}\n                </div>\n                {administrativeSource && (\n                  <p className=\"text-xs leading-relaxed text-gray-400\">\n                    Số liệu hành chính cập nhật theo{' '}\n                    <a\n                      href={administrativeSource.url}\n                      target=\"_blank\"\n                      rel=\"noreferrer\"\n                      className=\"font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700\"\n                    >\n                      {administrativeSource.label}\n                    </a>{' '}\n                    (chính quyền mới hoạt động từ {administrativeSource.updatedAt}).\n                  </p>\n                )}\n              </div>\n            )}\n\n            {activeTab === 'history' && (\n              <div className=\"relative ml-3 space-y-8 border-l border-gray-200 pb-4\">\n                {data.history.map((item, index) => (\n                  <div key={\`\${item.year}-\${index}\`} className=\"relative pl-6\">\n                    <div className=\"absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#FF385C] ring-4 ring-white\" />\n                    <span className=\"mb-2 inline-block rounded bg-red-50 px-2 py-1 text-xs font-bold text-[#FF385C]\">\n                      {item.year.match(/^\\d/) ? \`Năm \${item.year}\` : item.year}\n                    </span>\n                    <p className=\"text-sm leading-relaxed text-gray-700\">{item.event}</p>\n                  </div>\n                ))}\n              </div>\n            )}\n\n            {activeTab === 'places' && (\n              <div className=\"grid grid-cols-1 gap-4 lg:grid-cols-2\">\n                {data.places.map((place) => (\n                  <article key={place.name} className=\"group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md\">\n                    <div className=\"h-40 overflow-hidden\">\n                      <ImageWithFallback\n                        src={place.image}\n                        alt={place.name}\n                        loading=\"lazy\"\n                        className=\"h-full w-full object-cover transition-transform duration-500 group-hover:scale-105\"\n                      />\n                    </div>\n                    <div className=\"p-4\">\n                      <h3 className=\"mb-1 font-semibold text-gray-900\">{place.name}</h3>\n                      <p className=\"line-clamp-2 text-sm text-gray-500\">{place.description}</p>\n                    </div>\n                  </article>\n                ))}\n              </div>\n            )}\n\n            {activeTab === 'cuisine' && (\n              <div className=\"grid grid-cols-1 gap-4 lg:grid-cols-2\">\n                {data.cuisine.map((food) => (\n                  <article key={food.name} className=\"flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50\">\n                    <ImageWithFallback\n                      src={food.image}\n                      alt={food.name}\n                      loading=\"lazy\"\n                      className=\"h-20 w-20 shrink-0 rounded-xl object-cover\"\n                    />\n                    <div className=\"flex min-w-0 flex-col justify-center\">\n                      <h3 className=\"mb-1 font-semibold text-gray-900\">{food.name}</h3>\n                      <p className=\"line-clamp-2 text-xs text-gray-500\">{food.description}</p>\n                    </div>\n                  </article>\n                ))}\n              </div>\n            )}\n          </motion.div>\n        </AnimatePresence>\n      </div>\n    </div>\n  );\n}\n`;
}

const source = fs.readFileSync(SOURCE_PATH, 'utf8');
if (!source.includes('const HANOI_DATA')) {
  console.log('ProvinceDetails is already refactored; nothing to migrate.');
  process.exit(0);
}

const blocks = extractDataBlocks(source);
console.log(`Found ${blocks.size} province data blocks.`);

fs.writeFileSync(DATA_PATH, makeDataFile(blocks));
fs.writeFileSync(SOURCE_PATH, makeComponentFile());
console.log('Province data migrated and component refactored.');
