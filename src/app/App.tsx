import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { ProvinceDetails } from './components/ProvinceDetails';
import { TravelAiAssistant } from './components/TravelAiAssistant';
import { VietnamMap } from './components/VietnamMap';
import { provincesData } from '../data/provincesData';
import { normalizeSearchText } from '../utils/text';

export default function App() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [keyword, setKeyword] = useState('');
  const [started, setStarted] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const provinces = useMemo(
    () => Object.keys(provincesData) as Array<keyof typeof provincesData>,
    [],
  );

  const filtered = useMemo(() => {
    const normalizedKeyword = normalizeSearchText(keyword);
    if (!normalizedKeyword) return [];

    return provinces.filter((province) =>
      normalizeSearchText(provincesData[province].name).includes(normalizedKeyword),
    );
  }, [keyword, provinces]);

  const selectProvince = (province: string) => {
    setSelectedProvince(province);
    setKeyword('');
  };

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.main
          key="welcome"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
          className="relative min-h-dvh w-full overflow-hidden"
        >
          <img
            src="/banner/vietnam-bg.jpg"
            alt="Phong cảnh Việt Nam"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white">
            <div className="mb-10 h-px w-[80%] bg-white/60 md:mb-16" />

            <motion.h1
              initial={{ y: 56, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-[clamp(3rem,11vw,7.5rem)] font-black leading-none tracking-[0.12em]"
            >
              VIETNAM
            </motion.h1>

            <motion.h2
              initial={{ y: 56, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-[clamp(2.4rem,8vw,5.625rem)] font-black tracking-[0.08em] md:mt-6"
            >
              TRAVEL
            </motion.h2>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              onClick={() => setStarted(true)}
              className="mt-10 rounded-full border border-white/40 bg-black/25 px-10 py-3 text-xl font-bold backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:mt-14 md:px-14 md:py-4 md:text-3xl"
            >
              BẮT ĐẦU
            </motion.button>

            <div className="mt-12 h-px w-[55%] bg-white/60 md:mt-20" />
          </div>
        </motion.main>
      ) : (
        <motion.main
          key="main"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="min-h-dvh"
        >
          <div className="flex min-h-dvh flex-col gap-6 bg-white p-4 font-sans md:flex-row md:p-6">
            <section className="flex h-[52dvh] w-full shrink-0 flex-col md:h-[calc(100dvh-3rem)] md:w-[45%]">
              <div className="relative mb-4 shrink-0 px-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                  Khám phá Việt Nam
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Chọn một tỉnh thành trên bản đồ hoặc tìm kiếm theo tên
                </p>

                <label htmlFor="province-search" className="sr-only">
                  Tìm tỉnh thành
                </label>
                <div className="relative mt-3">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="province-search"
                    type="search"
                    autoComplete="off"
                    placeholder="Tìm tỉnh, ví dụ: Ha Noi..."
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    aria-controls="province-search-results"
                    aria-expanded={Boolean(keyword)}
                  />
                </div>

                {keyword && (
                  <div
                    id="province-search-results"
                    role="listbox"
                    className="absolute left-2 right-2 z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
                  >
                    {filtered.length > 0 ? (
                      filtered.map((province) => (
                        <button
                          key={province}
                          type="button"
                          role="option"
                          aria-selected={selectedProvince === province}
                          onClick={() => selectProvince(province)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
                        >
                          {provincesData[province].name}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-500">
                        Không tìm thấy tỉnh thành phù hợp
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1">
                <VietnamMap
                  selectedProvince={selectedProvince}
                  onSelect={selectProvince}
                />
              </div>
            </section>

            <section className="relative flex h-[66dvh] w-full min-w-0 flex-col md:h-[calc(100dvh-3rem)] md:flex-1">
              <div
                className={`grid h-full min-h-0 gap-4 transition-all ${
                  aiOpen ? 'md:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                <div className="min-h-0 min-w-0">
                  <ProvinceDetails province={selectedProvince} />
                </div>

                <TravelAiAssistant
                  province={selectedProvince}
                  open={aiOpen}
                  onToggle={() => setAiOpen((value) => !value)}
                />
              </div>
            </section>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
