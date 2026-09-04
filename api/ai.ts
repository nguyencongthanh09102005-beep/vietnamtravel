import { provinceDetailsCatalog } from '../src/data/provinceDetailsData';
import { provincesData } from '../src/data/provincesData';
import {
  createGoogleMapsDirectionsUrl,
  createGoogleMapsSearchUrl,
  type MapAction,
} from '../src/utils/googleMaps';

interface HistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

interface RequestBody {
  provinceId?: string;
  message?: string;
  history?: HistoryItem[];
}

interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...(init.headers ?? {}),
    },
  });
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function provinceAliases(id: string, displayName: string) {
  const aliases = new Set<string>();
  const add = (value: string) => {
    const normalized = normalize(value);
    if (normalized.length >= 5) aliases.add(normalized);
  };

  add(id);
  add(displayName);
  add(displayName.replace(/^(tp|tỉnh|thành phố)\.?\s*/i, ''));

  if (id === 'Ho Chi Minh') {
    add('Hồ Chí Minh');
    add('TPHCM');
    add('Sài Gòn');
  }

  return [...aliases];
}

function mentionsAnotherProvince(message: string, selectedProvinceId: string) {
  const normalizedMessage = normalize(message);

  return Object.entries(provincesData).some(([id, item]) => {
    if (id === selectedProvinceId) return false;
    return provinceAliases(id, item.name).some((alias) =>
      normalizedMessage.includes(alias),
    );
  });
}

function inferIntent(message: string) {
  const value = normalize(message);
  return {
    food: /(quan an|nha hang|am thuc|mon an|an gi|do an|food|restaurant)/.test(value),
    places: /(dia diem|tham quan|di dau|du lich|check in|checkin|lich trinh|vui choi|dang den)/.test(
      value,
    ),
    directions: /(chi duong|duong di|google map|maps|di chuyen|den dau|toi dau)/.test(value),
    itinerary: /(lich trinh|1 ngay|2 ngay|3 ngay|mot ngay|hai ngay|ba ngay)/.test(value),
  };
}

function extractDestination(message: string) {
  return message.match(/(?:đến|tới)\s+(.+?)(?:[?.!]|$)/i)?.[1]?.trim() ?? '';
}

function fallbackMapActions(message: string, provinceName: string): MapAction[] {
  const intent = inferIntent(message);
  const actions: MapAction[] = [];
  const destination = extractDestination(message);

  if (intent.food) {
    actions.push({
      label: 'Quán ăn trên Google Maps',
      url: createGoogleMapsSearchUrl(`quán ăn ngon tại ${provinceName}`),
    });
  }

  if (intent.places || intent.itinerary) {
    actions.push({
      label: 'Điểm tham quan trên Google Maps',
      url: createGoogleMapsSearchUrl(`địa điểm du lịch tại ${provinceName}`),
    });
  }

  if (intent.directions) {
    actions.push({
      label: destination ? `Chỉ đường đến ${destination}` : `Chỉ đường tại ${provinceName}`,
      url: createGoogleMapsDirectionsUrl(
        destination ? `${destination}, ${provinceName}` : provinceName,
      ),
    });
  }

  if (!actions.length) {
    actions.push({
      label: `Mở ${provinceName} trên Google Maps`,
      url: createGoogleMapsSearchUrl(provinceName),
    });
  }

  return actions.slice(0, 4);
}

async function searchGooglePlaces(query: string): Promise<GooglePlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri',
    },
    body: JSON.stringify({
      textQuery: query,
      pageSize: 5,
      languageCode: 'vi',
      regionCode: 'VN',
    }),
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as { places?: GooglePlace[] };
  return payload.places ?? [];
}

async function getLivePlaces(message: string, provinceName: string) {
  const intent = inferIntent(message);
  const queries: string[] = [];

  if (intent.food || intent.itinerary) queries.push(`quán ăn ngon tại ${provinceName}`);
  if (intent.places || intent.itinerary) queries.push(`địa điểm du lịch nổi bật tại ${provinceName}`);

  if (!queries.length) return [];

  const settled = await Promise.allSettled(queries.slice(0, 2).map(searchGooglePlaces));
  const places = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const unique = new Map<string, GooglePlace>();

  for (const place of places) {
    const key = place.id ?? `${place.displayName?.text}-${place.formattedAddress}`;
    if (key) unique.set(key, place);
  }

  return [...unique.values()].slice(0, 8);
}

function livePlacesAsContext(places: GooglePlace[]) {
  if (!places.length) return 'Không có dữ liệu Google Places trực tiếp cho lượt hỏi này.';

  return places
    .map((place, index) => {
      const name = place.displayName?.text ?? 'Không rõ tên';
      const rating = place.rating ? ` | ${place.rating}/5 (${place.userRatingCount ?? 0} lượt)` : '';
      return `${index + 1}. ${name} | ${place.formattedAddress ?? 'Chưa rõ địa chỉ'}${rating}`;
    })
    .join('\n');
}

function placeActions(places: GooglePlace[]): MapAction[] {
  return places
    .filter((place) => place.googleMapsUri && place.displayName?.text)
    .slice(0, 3)
    .map((place) => ({
      label: place.displayName!.text!,
      url: place.googleMapsUri!,
    }));
}

async function askGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText.slice(0, 500));
    return null;
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  return (
    payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() || null
  );
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    let body: RequestBody;
    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
    }

    const provinceId = body.provinceId?.trim() ?? '';
    const message = body.message?.trim().slice(0, 1600) ?? '';
    const current = provinceDetailsCatalog[provinceId as keyof typeof provinceDetailsCatalog];

    if (!provinceId || !message || !current) {
      return json({ error: 'Hãy chọn một tỉnh và nhập câu hỏi trước.' }, { status: 400 });
    }

    const provinceName = current.title;
    const baseActions = fallbackMapActions(message, provinceName);

    if (mentionsAnotherProvince(message, provinceId)) {
      return json({
        reply: `Cuộc chat này đang khóa theo ${provinceName}, nên mình chỉ trả lời nội dung thuộc ${provinceName}. Bạn hãy chọn tỉnh khác trên bản đồ nếu muốn hỏi về nơi đó.`,
        mapActions: baseActions,
        livePlaces: false,
      });
    }

    const livePlaces = await getLivePlaces(message, provinceName);
    const liveActions = placeActions(livePlaces);
    const mapActions = [...liveActions, ...baseActions]
      .filter((item, index, all) => all.findIndex((other) => other.url === item.url) === index)
      .slice(0, 4);

    const localPlaces = current.data.places
      .slice(0, 8)
      .map((item) => `- ${item.name}: ${item.description}`)
      .join('\n');
    const localCuisine = current.data.cuisine
      .slice(0, 6)
      .map((item) => `- ${item.name}: ${item.description}`)
      .join('\n');

    const history = (body.history ?? [])
      .slice(-6)
      .map((item) => `${item.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${item.text.slice(0, 900)}`)
      .join('\n');

    const prompt = `Bạn là trợ lý du lịch bên trong website Vietnam Travel.\n\nQUY TẮC CỨNG:\n1. Tỉnh đang chọn là: ${provinceName} (id: ${provinceId}). Chỉ trả lời về địa điểm, ẩm thực, lịch trình, cách di chuyển và thông tin du lịch thuộc tỉnh/thành này.\n2. Không chuyển sang tư vấn tỉnh/thành khác dù người dùng yêu cầu. Nếu câu hỏi nằm ngoài phạm vi, nhắc họ đổi tỉnh trên bản đồ.\n3. Trả lời bằng tiếng Việt, tự nhiên, gọn, dễ đọc. Ưu tiên gợi ý thực tế theo buổi sáng/trưa/chiều/tối khi lập lịch trình.\n4. Không bịa giờ mở cửa, giá vé, khoảng cách, rating hay trạng thái hoạt động. Chỉ dùng rating/địa chỉ khi chúng xuất hiện trong dữ liệu Google Places bên dưới.\n5. Khi tư vấn đường đi, mô tả hướng di chuyển ở mức tổng quát và nhắc người dùng dùng nút Google Maps để có chỉ dẫn thời gian thực.\n6. Nếu dữ liệu dự án và Google Places khác nhau, ưu tiên Google Places cho quán/địa điểm đang hoạt động nhưng vẫn nói theo hướng tham khảo.\n\nDỮ LIỆU NỘI BỘ VỀ ${provinceName}:\n${current.data.overview.description}\n\nĐịa điểm trong dự án:\n${localPlaces || '- Chưa có dữ liệu.'}\n\nẨm thực trong dự án:\n${localCuisine || '- Chưa có dữ liệu.'}\n\nDỮ LIỆU GOOGLE PLACES TRỰC TIẾP (nếu có):\n${livePlacesAsContext(livePlaces)}\n\nLỊCH SỬ CHAT GẦN NHẤT:\n${history || '(chưa có)'}\n\nCÂU HỎI HIỆN TẠI:\n${message}\n\nHãy trả lời tối đa khoảng 350 từ. Không dùng markdown table.`;

    const reply = await askGemini(prompt);

    if (!reply) {
      return json(
        {
          reply:
            'Trợ lý AI chưa được cấu hình hoặc đang tạm lỗi trên bản deploy này. Các nút Google Maps bên dưới vẫn hoạt động bình thường.',
          mapActions,
          livePlaces: livePlaces.length > 0,
        },
        { status: process.env.GEMINI_API_KEY ? 502 : 503 },
      );
    }

    return json({
      reply,
      mapActions,
      livePlaces: livePlaces.length > 0,
    });
  },
};
