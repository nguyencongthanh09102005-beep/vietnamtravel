import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogIn, LogOut, UserRound } from 'lucide-react';
import type { AuthUser } from '../../types/auth';

interface UserMenuProps {
  user: AuthUser | null;
  guest: boolean;
  onLogout: () => Promise<void> | void;
  onOpenAuth: () => void;
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

export function UserMenu({ user, guest, onLogout, onOpenAuth }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Dữ liệu đang đồng bộ</p>
          </div>
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
