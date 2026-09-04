import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, Search } from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { ProvinceDetails } from './components/ProvinceDetails';
import { TravelAiAssistant } from './components/TravelAiAssistant';
import { UserMenu } from './components/UserMenu';
import { VietnamMap } from './components/VietnamMap';
import { provincesData } from '../data/provincesData';
import type { AuthStateResponse, AuthUser } from '../types/auth';
import { normalizeSearchText } from '../utils/text';

export default function App() {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [keyword, setKeyword] = useState('');
  const [started, setStarted] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authConfigured, setAuthConfigured] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const payload = (await response.json()) as AuthStateResponse;
        if (!active) return;
        setAuthConfigured(Boolean(payload.configured));
        setUser(payload.user ?? null);
      } catch {
        if (!active) return;
        setAuthConfigured(false);
        setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setGuestMode(false);
      setAiOpen(false);
    }
  };

  const openAuth = () => {
    setGuestMode(false);
    setAiOpen(false);
  };

  let content;

  if (!started) {
    content = (
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
    );
  } else if (authLoading) {
    content = (
      <motion.main
        key="auth-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-dvh items-center justify-center bg-gray-950 text-white"
      >
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin" aria-hidden="true" />
          <p className="mt-3 text-sm text-white/70">Đang kiểm tra hành trình của bạn...</p>
        </div>
      </motion.main>
    );
  } else if (!user && !guestMode) {
    content = (
      <motion.div
        key="auth"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.45 }}
      >
        <AuthScreen
          configured={authConfigured}
          onAuthenticated={(authenticatedUser) => {
            setUser(authenticatedUser);
            setGuestMode(false);
            setAuthConfigured(true);
          }}
          onGuest={() => setGuestMode(true)}
        />
      </motion.div>
    );
  } else {
    content = (
      <motion.main
        key="main"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-dvh"
      >
        <div className="flex min-h-dvh flex-col gap-5 bg-gradient-to-br from-white via-sky-50/35 to-emerald-50/30 p-4 font-sans md:flex-row md:p-6">
          <section className="flex h-[52dvh] w-full shrink-0 flex-col md:h-[calc(100dvh-3rem)] md:w-[46%]">
            <div className="relative mb-4 shrink-0 px-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Khám phá Việt Nam
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Chọn một tỉnh thành trên bản đồ hoặc tìm kiếm theo tên
                  </p>
                </div>

                <UserMenu
                  user={user}
                  guest={guestMode}
                  onLogout={logout}
                  onOpenAuth={openAuth}
                />
              </div>

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
                  className="w-full rounded-xl border border-gray-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:outline-none"
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
              className={`h-full min-h-0 transition-all duration-300 ${
                aiOpen ? 'invisible scale-[0.985] opacity-0' : 'visible scale-100 opacity-100'
              }`}
              aria-hidden={aiOpen}
            >
              <ProvinceDetails province={selectedProvince} />
            </div>

            <div className={aiOpen ? 'absolute inset-0 z-20 min-h-0' : 'contents'}>
              <TravelAiAssistant
                province={selectedProvince}
                open={aiOpen}
                onToggle={() => setAiOpen((value) => !value)}
                authenticated={Boolean(user)}
              />
            </div>
          </section>
        </div>
      </motion.main>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
