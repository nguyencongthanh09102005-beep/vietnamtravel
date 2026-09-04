import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  ExternalLink,
  LoaderCircle,
  MapPinned,
  MessageCircle,
  Route,
  Send,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import { provinceDetailsCatalog } from '../../data/provinceDetailsData';
import {
  createGoogleMapsDirectionsUrl,
  createGoogleMapsSearchUrl,
  type MapAction,
} from '../../utils/googleMaps';

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  mapActions?: MapAction[];
  livePlaces?: boolean;
}

interface ApiResponse {
  reply?: string;
  mapActions?: MapAction[];
  livePlaces?: boolean;
  error?: string;
}

interface TravelAiAssistantProps {
  province: string;
  open: boolean;
  onToggle: () => void;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createStarterMessage(province: string): ChatMessage | null {
  const current = provinceDetailsCatalog[province as keyof typeof provinceDetailsCatalog];
  if (!current) return null;

  const places = current.data.places.slice(0, 3).map((item) => item.name);
  const cuisine = current.data.cuisine.slice(0, 2).map((item) => item.name);

  const placeLine = places.length ? `\n📍 Nên xem: ${places.join(' • ')}` : '';
  const foodLine = cuisine.length ? `\n🍜 Nên thử: ${cuisine.join(' • ')}` : '';

  return {
    id: makeId(),
    role: 'assistant',
    text: `Mình đang hỗ trợ riêng về ${current.title}. Bạn có thể hỏi lịch trình, địa điểm đáng đến, quán ăn hoặc cách đi. Mình sẽ không chuyển sang tỉnh khác trong cuộc chat này.${placeLine}${foodLine}`,
    mapActions: [
      {
        label: `Mở ${current.title} trên Google Maps`,
        url: createGoogleMapsSearchUrl(current.title),
      },
    ],
  };
}

function localFallbackActions(message: string, provinceName: string): MapAction[] {
  const normalized = message.toLowerCase();
  const actions: MapAction[] = [];

  if (/quán|ăn|ẩm thực|nhà hàng|món/.test(normalized)) {
    actions.push({
      label: 'Tìm quán ăn trên Google Maps',
      url: createGoogleMapsSearchUrl(`quán ăn ngon tại ${provinceName}`),
    });
  }

  if (/địa điểm|tham quan|đi đâu|du lịch|check.?in|lịch trình/.test(normalized)) {
    actions.push({
      label: 'Xem điểm tham quan trên Google Maps',
      url: createGoogleMapsSearchUrl(`địa điểm du lịch tại ${provinceName}`),
    });
  }

  if (/chỉ đường|đường đi|google map|maps/.test(normalized)) {
    const destination = message.match(/(?:đến|tới)\s+(.+?)(?:[?.!]|$)/i)?.[1]?.trim();
    actions.push({
      label: destination ? `Chỉ đường đến ${destination}` : `Mở chỉ đường tại ${provinceName}`,
      url: createGoogleMapsDirectionsUrl(
        destination ? `${destination}, ${provinceName}` : provinceName,
      ),
    });
  }

  return actions.length
    ? actions
    : [
        {
          label: `Mở ${provinceName} trên Google Maps`,
          url: createGoogleMapsSearchUrl(provinceName),
        },
      ];
}

export function TravelAiAssistant({ province, open, onToggle }: TravelAiAssistantProps) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesByProvince, setMessagesByProvince] = useState<Record<string, ChatMessage[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const current = provinceDetailsCatalog[province as keyof typeof provinceDetailsCatalog];
  const provinceName = current?.title ?? '';
  const messages = province ? messagesByProvince[province] ?? [] : [];

  useEffect(() => {
    if (!province || messagesByProvince[province]) return;
    const starter = createStarterMessage(province);
    if (!starter) return;

    setMessagesByProvince((previous) => ({
      ...previous,
      [province]: [starter],
    }));
  }, [province, messagesByProvince]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages, open, loading]);

  const quickPrompts = useMemo(
    () => [
      { icon: Sparkles, text: 'Gợi ý lịch trình 1 ngày' },
      { icon: MapPinned, text: 'Địa điểm nào đáng đến nhất?' },
      { icon: Utensils, text: 'Gợi ý quán ăn ngon và món nên thử' },
      { icon: Route, text: 'Tư vấn cách di chuyển thuận tiện' },
    ],
    [],
  );

  const sendMessage = async (value = draft) => {
    const text = value.trim();
    if (!text || !province || !current || loading) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: 'user',
      text,
    };

    const previousMessages = messages;
    setDraft('');
    setLoading(true);
    setMessagesByProvince((previous) => ({
      ...previous,
      [province]: [...(previous[province] ?? []), userMessage],
    }));

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provinceId: province,
          message: text,
          history: previousMessages
            .slice(-6)
            .filter((item) => item.role === 'user' || item.role === 'assistant')
            .map((item) => ({ role: item.role, text: item.text })),
        }),
      });

      const payload = (await response.json()) as ApiResponse;
      const fallbackActions = localFallbackActions(text, provinceName);

      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: 'assistant',
        text:
          payload.reply ??
          payload.error ??
          'Mình chưa trả lời được lúc này. Bạn vẫn có thể mở Google Maps bằng nút bên dưới.',
        mapActions: payload.mapActions?.length ? payload.mapActions : fallbackActions,
        livePlaces: payload.livePlaces,
      };

      setMessagesByProvince((previous) => ({
        ...previous,
        [province]: [...(previous[province] ?? []), assistantMessage],
      }));
    } catch {
      setMessagesByProvince((previous) => ({
        ...previous,
        [province]: [
          ...(previous[province] ?? []),
          {
            id: makeId(),
            role: 'assistant',
            text: 'Kết nối AI đang gặp lỗi. Bạn vẫn có thể dùng các nút Google Maps bên dưới.',
            mapActions: localFallbackActions(text, provinceName),
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:bottom-7 md:right-7"
        aria-label="Mở trợ lý AI du lịch"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        AI du lịch
      </button>
    );
  }

  return (
    <aside className="fixed inset-x-3 bottom-3 top-16 z-50 flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl md:static md:inset-auto md:z-auto md:h-full md:shadow-sm">
      <header className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-gray-950">Trợ lý AI du lịch</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Theo tỉnh
              </span>
            </div>
            <p className="truncate text-xs text-gray-500">
              {provinceName || 'Chọn một tỉnh để bắt đầu'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-label="Thu gọn trợ lý AI"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {!current ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div>
            <MapPinned className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
            <p className="font-semibold text-gray-900">Chọn một tỉnh trên bản đồ trước nha</p>
            <p className="mt-1 text-sm text-gray-500">
              AI sẽ tự khóa ngữ cảnh theo tỉnh bạn đang chọn.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[92%]">
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-3 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-gray-950 text-white'
                        : 'rounded-bl-md bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.role === 'assistant' && message.mapActions?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.mapActions.map((action) => (
                        <a
                          key={`${message.id}-${action.url}`}
                          href={action.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
                          {action.label}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {message.livePlaces ? (
                    <p className="mt-1.5 text-[10px] text-gray-400">
                      Gợi ý địa điểm có tham chiếu dữ liệu Google Places.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-3 text-sm text-gray-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  AI đang nghĩ về {provinceName}...
                </div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-gray-100 bg-white p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickPrompts.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => void sendMessage(text)}
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {text}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
              className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
            >
              <label htmlFor="travel-ai-message" className="sr-only">
                Hỏi AI về {provinceName}
              </label>
              <textarea
                id="travel-ai-message"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder={`Hỏi về ${provinceName}...`}
                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!draft.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Gửi tin nhắn"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              AI chỉ trả lời trong phạm vi {provinceName}. Hãy kiểm tra lại thông tin quan trọng trước chuyến đi.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
