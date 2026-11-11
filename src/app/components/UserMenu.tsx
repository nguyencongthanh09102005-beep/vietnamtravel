import { useEffect, useRef, useState } from 'react';
import { Bookmark, ChevronDown, LogIn, LogOut, Pencil, UserRound } from 'lucide-react';
import type { AuthUser } from '../../types/auth';

interface UserMenuProps {
  user: AuthUser | null;
  guest: boolean;
  onLogout: () => Promise<void> | void;
  onOpenAuth: () => void;
  onOpenCollections: () => void;
  onProfileUpdated: (user: AuthUser) => void;
}

function initials(user: AuthUser) {
  const source = user.displayName || user.email;
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function UserMenu({ user, guest, onLogout, onOpenAuth, onOpenCollections, onProfileUpdated }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setAvatarUrl(user?.avatarUrl ?? '');
  }, [user?.id]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError('');
    setProfileSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, avatarUrl }),
      });
      const payload = (await response.json()) as { user?: AuthUser; error?: string };
      if (!response.ok || !payload.user) {
        setProfileError(payload.error ?? 'Không thể lưu hồ sơ.');
        return;
      }
      onProfileUpdated(payload.user);
      setEditing(false);
    } catch {
      setProfileError('Không kết nối được máy chủ.');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
      >
        <UserRound className="h-4 w-4" aria-hidden="true" />
        {guest ? 'Khách' : 'Đăng nhập'}
        <LogIn className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-2.5 text-left shadow-sm transition hover:border-gray-300"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-950 text-[11px] font-black text-white">
          {initials(user) || 'VT'}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-28 truncate text-xs font-bold text-gray-900">{user.displayName}</span>
          <span className="block max-w-28 truncate text-[10px] text-gray-400">{user.email}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
          <div className="rounded-xl bg-gray-50 px-3 py-3">
            <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Lịch sử và hành trình cá nhân</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => setEditing((value) => !value)}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-sky-50"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Chỉnh sửa hồ sơ
          </button>
          {editing ? (
            <form onSubmit={(event) => void saveProfile(event)} className="space-y-2 rounded-xl bg-gray-50 p-3">
              <label className="block text-xs font-semibold text-gray-700" htmlFor="profile-name">Tên hiển thị</label>
              <input id="profile-name" value={displayName} maxLength={80} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm" />
              <label className="block text-xs font-semibold text-gray-700" htmlFor="profile-avatar">URL ảnh đại diện (HTTPS, tùy chọn)</label>
              <input id="profile-avatar" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm" placeholder="https://..." />
              {profileError ? <p role="alert" className="text-xs text-rose-700">{profileError}</p> : null}
              <button type="submit" disabled={profileSaving} className="rounded-lg bg-gray-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{profileSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
            </form>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenCollections();
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-sky-50"
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            Hành trình của tôi
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void onLogout();
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
