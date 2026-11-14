import { BedDouble, BusFront, ExternalLink, MapPinned, Plane, Ticket } from 'lucide-react';
import {
  canOfferTravelServices, travelDestinationLabel, travelServiceLinks,
  type TravelServiceId, type TravelServiceLink,
} from '../../utils/travel-affiliate';

const SERVICE_ICONS = { booking: BedDouble, traveloka: Plane, klook: Ticket, vexere: BusFront };

function ServiceCard({ item, destination }: { item: TravelServiceLink; destination: string }) {
  const Icon = SERVICE_ICONS[item.id];
  return (
    <a href={item.url} target="_blank"
      rel={item.partnerConfigured ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
      className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600">
      <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
        <Icon className="h-5 w-5" aria-hidden="true"/>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-950">{item.name}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">{item.caption}</span>
        <span className="mt-2 block text-[11px] text-slate-500">
          {item.destinationPrefilled
            ? 'Mở trang dành cho ' + destination
            : 'Chọn điểm đến ' + destination + ' trên trang đối tác'}
        </span>
        {item.partnerConfigured ? (
          <span className="mt-1 block text-[11px] font-medium text-amber-700">Liên kết đối tác</span>
        ) : null}
      </span>
      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true"/>
    </a>
  );
}

/** Tab Dịch vụ for the selected province, not a footer under every tab. */
export function TravelServicesPanel({ provinceName, provinceId }: {
  provinceName: string; provinceId?: string;
}) {
  const destination = travelDestinationLabel(provinceName);
  if (!canOfferTravelServices(provinceId)) {
    return (
      <section aria-label="Dịch vụ du lịch" className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <MapPinned className="mb-3 h-7 w-7 text-slate-500" aria-hidden="true"/>
        <h3 className="text-base font-bold text-slate-950">Dịch vụ tại {destination}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Chưa có thông tin đủ tin cậy về dịch vụ đặt vé và lưu trú thương mại trực tiếp tại khu vực này.
          VietnamTravel không hiển thị liên kết đặt chỗ để tránh gây hiểu nhầm.
        </p>
      </section>
    );
  }

  const services = travelServiceLinks(provinceName, {
    booking: import.meta.env.VITE_AFFILIATE_BOOKING_URL,
    traveloka: import.meta.env.VITE_AFFILIATE_TRAVELOKA_URL,
    klook: import.meta.env.VITE_AFFILIATE_KLOOK_URL,
    vexere: import.meta.env.VITE_AFFILIATE_VEXERE_URL,
  });
  const links = Object.fromEntries(services.map(item => [item.id, item])) as Record<TravelServiceId, TravelServiceLink>;
  const partnerEnabled = services.some(item => item.partnerConfigured);

  return (
    <section aria-label={'Dịch vụ du lịch tại ' + destination} className="space-y-5">
      <header className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Chuẩn bị chuyến đi</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Dịch vụ du lịch {destination}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Tìm vé di chuyển đến {destination}, chỗ nghỉ và trải nghiệm phù hợp.
          Chọn ngày đi, điểm khởi hành và số khách trực tiếp tại nhà cung cấp.
        </p>
      </header>

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">Vé di chuyển đến {destination}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Chọn điểm xuất phát và ngày khởi hành trên trang đặt vé. Không phải tỉnh nào cũng có sân bay hoặc tuyến xe trực tiếp.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ServiceCard item={links.traveloka} destination={destination}/>
          <ServiceCard item={links.vexere} destination={destination}/>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">Khách sạn tại {destination}</h3>
          <p className="mt-1 text-xs text-slate-500">So sánh nơi lưu trú theo ngày nhận phòng, số khách và ngân sách.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ServiceCard item={links.booking} destination={destination}/>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">Vé tham quan và trải nghiệm {destination}</h3>
          <p className="mt-1 text-xs text-slate-500">Tìm tour và hoạt động tại điểm đến; kiểm tra khu vực trước khi đặt.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ServiceCard item={links.klook} destination={destination}/>
        </div>
      </div>

      <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        {partnerEnabled
          ? 'Một số liên kết là liên kết tiếp thị; VietnamTravel có thể nhận hoa hồng khi bạn đặt dịch vụ qua đối tác được chấp thuận.'
          : 'Các liên kết hiện tại là liên kết thông thường; chưa có cấu hình affiliate nên chưa tạo hoa hồng.'}
        {' '}Đây không phải kết quả tìm vé/phòng trực tiếp; giá và chỗ trống do nhà cung cấp xác nhận.
      </p>
    </section>
  );
}
