import { BedDouble, BusFront, ExternalLink, Ticket } from 'lucide-react';
import { travelServiceLinks, type TravelServiceCategory } from '../../utils/travel-affiliate';

const categoryIcon: Record<TravelServiceCategory, typeof BedDouble> = {
  stay: BedDouble, experience: Ticket, transport: BusFront,
};

/** Travel discovery links. Commission only applies to approved configured partner URLs. */
export function TravelServicesPanel({ provinceName }: { provinceName: string }) {
  const services = travelServiceLinks(provinceName, {
    booking: import.meta.env.VITE_AFFILIATE_BOOKING_URL,
    traveloka: import.meta.env.VITE_AFFILIATE_TRAVELOKA_URL,
    klook: import.meta.env.VITE_AFFILIATE_KLOOK_URL,
    vexere: import.meta.env.VITE_AFFILIATE_VEXERE_URL,
  });
  const partnerEnabled = services.some(item => item.partnerConfigured);
  return (
    <section aria-label="Dịch vụ cho chuyến đi" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="text-sm font-bold text-slate-950">Chuẩn bị dịch vụ cho chuyến đi</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Khám phá nơi lưu trú, vé tham quan và phương tiện tại {provinceName}. Giá và chỗ còn trống do bên cung cấp xác nhận.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {services.map(item => {
          const Icon = categoryIcon[item.category];
          return (
            <a key={item.id} href={item.url} target="_blank"
              rel={item.partnerConfigured ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
              className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
              <Icon className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true"/>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-900">{item.name}</span>
                <span className="block text-[11px] text-slate-500">{item.caption}</span>
                {item.partnerConfigured ? <span className="block text-[10px] font-semibold text-amber-700">Liên kết đối tác</span> : null}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true"/>
            </a>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-4 text-slate-500">
        {partnerEnabled
          ? 'Một số liên kết là tiếp thị: VietnamTravel có thể nhận hoa hồng nếu có đặt dịch vụ qua liên kết đối tác được chấp thuận.'
          : 'Đây là liên kết dịch vụ thông thường, chưa được cấu hình affiliate và chưa có hoa hồng từ những nút này.'}
        {' '}Bạn sẽ rời VietnamTravel khi mở dịch vụ.
      </p>
    </section>
  );
}
