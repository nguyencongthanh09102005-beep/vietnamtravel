import { useEffect, useState, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Clock, Info, MapPin, Utensils } from 'lucide-react';
import { provinceDetailsCatalog } from '../../data/provinceDetailsData';
import { ImageWithFallback } from './figma/ImageWithFallback';

type TabType = 'overview' | 'history' | 'places' | 'cuisine';

const TABS: Array<{ id: TabType; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Tổng quan', icon: Info },
  { id: 'history', label: 'Lịch sử', icon: Clock },
  { id: 'places', label: 'Địa điểm', icon: Camera },
  { id: 'cuisine', label: 'Ẩm thực', icon: Utensils },
];

function formatStatValue(value: string) {
  return value.replace(/\s*\(NQ\s*202\/2025\/QH15\)\s*$/i, '').trim();
}

export function ProvinceDetails({ province }: { province: string }) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const current = provinceDetailsCatalog[province as keyof typeof provinceDetailsCatalog];

  useEffect(() => {
    setActiveTab('overview');
  }, [province]);

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
        <div>
          <MapPin className="mx-auto mb-3 h-9 w-9 text-gray-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Chọn một tỉnh thành</h2>
          <p className="mt-1 text-sm text-gray-500">Click trên bản đồ hoặc dùng ô tìm kiếm để bắt đầu khám phá.</p>
        </div>
      </div>
    );
  }

  const { title, banner, data, administrativeSource } = current;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-[220px] w-full shrink-0 sm:h-[240px]">
        <ImageWithFallback
          key={province}
          src={banner}
          alt={title}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
          <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <div className="flex items-center text-sm font-medium text-white/90">
            <MapPin className="mr-1 h-4 w-4" aria-hidden="true" />
            <span>Việt Nam</span>
          </div>
        </div>
      </div>

      <div className="hide-scrollbar flex shrink-0 overflow-x-auto border-b border-gray-100 px-3 pt-3 sm:px-6 sm:pt-4" role="tablist" aria-label="Thông tin tỉnh thành">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF385C]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${province}-${activeTab}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <p className="text-[15px] leading-7 text-gray-600">{data.overview.description}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
                  {data.overview.stats.map((stat) => (
                    <div key={stat.label} className="min-w-0 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">{stat.label}</p>
                      <p className="break-words text-[15px] font-semibold leading-6 text-gray-900 sm:text-base">
                        {formatStatValue(stat.value)}
                      </p>
                    </div>
                  ))}
                </div>
                {administrativeSource && (
                  <p className="text-xs leading-relaxed text-gray-400">
                    Số liệu hành chính cập nhật theo{' '}
                    <a
                      href={administrativeSource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-700"
                    >
                      {administrativeSource.label}
                    </a>{' '}
                    (chính quyền mới hoạt động từ {administrativeSource.updatedAt}).
                  </p>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="relative ml-3 space-y-8 border-l border-gray-200 pb-4">
                {data.history.map((item, index) => (
                  <div key={`${item.year}-${index}`} className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#FF385C] ring-4 ring-white" />
                    <span className="mb-2 inline-block rounded bg-red-50 px-2 py-1 text-xs font-bold text-[#FF385C]">
                      {item.year.match(/^\d/) ? `Năm ${item.year}` : item.year}
                    </span>
                    <p className="text-sm leading-relaxed text-gray-700">{item.event}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'places' && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.places.map((place) => (
                  <article key={place.name} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
                    <div className="h-40 overflow-hidden">
                      <ImageWithFallback
                        src={place.image}
                        alt={place.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-1 font-semibold text-gray-900">{place.name}</h3>
                      <p className="line-clamp-2 text-sm text-gray-500">{place.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {activeTab === 'cuisine' && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.cuisine.map((food) => (
                  <article key={food.name} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50">
                    <ImageWithFallback
                      src={food.image}
                      alt={food.name}
                      loading="lazy"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                    <div className="flex min-w-0 flex-col justify-center">
                      <h3 className="mb-1 font-semibold text-gray-900">{food.name}</h3>
                      <p className="line-clamp-2 text-xs text-gray-500">{food.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
