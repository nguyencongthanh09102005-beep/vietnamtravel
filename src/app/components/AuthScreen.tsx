import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPinned,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { AuthUser } from '../../types/auth';

type AuthMode = 'login' | 'register';

interface AuthScreenProps {
  configured: boolean;
  onAuthenticated: (user: AuthUser) => void;
  onGuest: () => void;
}

interface AuthApiResponse {
  user?: AuthUser | null;
  needsEmailConfirmation?: boolean;
  error?: string;
}

export function AuthScreen({ configured, onAuthenticated, onGuest }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !password) {
      setError('Bạn nhập email và mật khẩu trước nha.');
      return;
    }

    if (mode === 'register') {
      if (displayName.trim().length < 2) {
        setError('Tên hiển thị cần ít nhất 2 ký tự.');
        return;
      }
      if (password.length < 8) {
        setError('Mật khẩu cần ít nhất 8 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Hai mật khẩu chưa khớp nhau.');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
        }),
      });
      const payload = (await response.json()) as AuthApiResponse;

      if (!response.ok || payload.error) {
        setError(payload.error ?? 'Không thể thực hiện lúc này.');
        return;
      }

      if (payload.user) {
        onAuthenticated(payload.user);
        return;
      }

      if (payload.needsEmailConfirmation) {
        setNotice('Đăng ký thành công. Bạn kiểm tra email để xác nhận tài khoản rồi đăng nhập nha.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Không kết nối được máy chủ. Thử lại sau một chút nha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gray-950 p-4 sm:p-6 lg:p-10">
      <img
        src="/banner/vietnam-bg.jpg"
        alt="Phong cảnh Việt Nam"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/85 via-gray-950/45 to-blue-950/75" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur-md">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              VIETNAM TRAVEL
            </div>

            <div className="mt-20 max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-blue-100">
                Khám phá theo cách của bạn
              </p>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight">
                Lưu hành trình.
                <br />
                Nhớ từng nơi đã đi.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
                Đăng nhập để giữ lại tỉnh yêu thích, lịch sử trò chuyện với AI, lịch trình và những nơi bạn muốn ghé trong các lần sử dụng tiếp theo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ['AI theo tỉnh', Sparkles],
              ['Dữ liệu riêng', ShieldCheck],
              ['Lưu hành trình', MapPinned],
            ].map(([label, Icon]) => {
              const FeatureIcon = Icon as typeof Sparkles;
              return (
                <div key={label as string} className="rounded-2xl border border-white/15 bg-black/15 p-4 backdrop-blur-md">
                  <FeatureIcon className="mb-3 h-5 w-5 text-blue-100" aria-hidden="true" />
                  <p className="text-sm font-semibold">{label as string}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-5 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-7 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-3 py-2 text-sm font-bold text-white">
                <MapPinned className="h-4 w-4" aria-hidden="true" />
                VIETNAM TRAVEL
              </div>
            </div>

            <div className="mb-7">
              <p className="text-sm font-semibold text-blue-600">
                {mode === 'login' ? 'Chào mừng bạn quay lại' : 'Bắt đầu hành trình của riêng bạn'}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
                {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {mode === 'login'
                  ? 'Tiếp tục khám phá các tỉnh thành và những gợi ý bạn đã lưu.'
                  : 'Tạo một tài khoản để đồng bộ dữ liệu du lịch trên nhiều thiết bị.'}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => changeMode('login')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => changeMode('register')}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  mode === 'register' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Đăng ký
              </button>
            </div>

            {!configured ? (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800">
                Hệ thống tài khoản đang chờ kết nối database. Bạn vẫn có thể vào chế độ khách trong lúc cấu hình.
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' ? (
                <div>
                  <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Tên hiển thị
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="auth-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      autoComplete="name"
                      placeholder="Tên của bạn"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder={mode === 'login' ? 'Nhập mật khẩu' : 'Ít nhất 8 ký tự'}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' ? (
                <div>
                  <label htmlFor="auth-confirm" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>
              ) : null}

              {error ? <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p> : null}
              {notice ? <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">{notice}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-bold text-white shadow-lg shadow-gray-950/10 transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                {!loading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              hoặc
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={onGuest}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Tiếp tục với tư cách khách
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-gray-400">
              Dữ liệu của chế độ khách chỉ tồn tại trên thiết bị hiện tại. Đăng nhập để đồng bộ dữ liệu tài khoản.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
