import { Globe, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { ABOUT_BRAND_CONTENT, CONTACT_CONFIG, type Language } from '../data/catalog';

interface FooterProps {
  lang: Language;
}

export function Footer({ lang }: FooterProps) {
  const isEn = lang === 'en';
  const paragraphs = isEn
    ? ABOUT_BRAND_CONTENT.enParagraphs
    : ABOUT_BRAND_CONTENT.viParagraphs;

  return (
    <footer
      id="khach-hang"
      className="relative scroll-mt-14 overflow-hidden border-t border-[#C4942E]/35 bg-[#0B5268] pb-16 text-[#D1D3D4] lg:pb-0"
    >
      {/* Bố cục chính thức Trang 1 Trái (Bìa sau) của PDF: nền xanh trơn đồng nhất bản in, Logo giữa -> 3 đoạn Be Vietnam Pro -> Đường kẻ mảnh -> Địa chỉ + QR */}
      <div className="relative mx-auto max-w-[680px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col items-center text-center">
          <img
            src="images/brand/logo-stacked.png"
            alt="Khoi Minh Gifts"
            className="h-24 w-auto object-contain sm:h-28"
            loading="lazy"
          />
        </div>

        <div
          className={`mt-9 space-y-4 text-justify text-[13.5px] leading-[1.6] tracking-[0.004em] text-[#D1D3D4] sm:text-[14px] ${
            isEn ? 'italic' : ''
          }`}
        >
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <hr className="my-9 border-[#D1D3D4]/30" />

        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="space-y-2.5 text-xs leading-relaxed text-[#D1D3D4] sm:text-[13px]">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E8D59E]" />
              <span>{isEn ? CONTACT_CONFIG.addressEn : CONTACT_CONFIG.addressVi}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 shrink-0 text-[#E8D59E]" />
              <a
                href={CONTACT_CONFIG.website}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#E8D59E]"
              >
                {CONTACT_CONFIG.websiteDisplay}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[#E8D59E]" />
              <a
                href={`mailto:${CONTACT_CONFIG.email}`}
                className="transition-colors hover:text-[#E8D59E]"
              >
                {CONTACT_CONFIG.email}
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-[#E8D59E]" />
              <a
                href={`tel:${CONTACT_CONFIG.zaloPhone}`}
                className="transition-colors hover:text-[#E8D59E]"
              >
                {CONTACT_CONFIG.hotlineDisplay}
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href={`https://zalo.me/${CONTACT_CONFIG.zaloPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#C4942E] px-3.5 py-2 text-xs font-semibold text-[#083E50] transition-colors hover:bg-[#D5A640]"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{isEn ? 'Zalo Chat' : 'Chat Zalo'}</span>
              </a>
              <a
                href={`https://m.me/${CONTACT_CONFIG.messengerUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#D1D3D4]/45 bg-[#083E50]/85 px-3.5 py-2 text-xs font-medium text-[#FAF8F4] transition-colors hover:border-[#E8D59E]"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Messenger</span>
              </a>
            </div>
          </div>

          <a
            href={CONTACT_CONFIG.qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block self-start overflow-hidden rounded bg-white p-2 shadow-sm transition-transform hover:scale-[1.03] sm:self-end"
            title="Khoi Minh Gifts QR"
          >
            <img
              src="images/brand/qr-khoiminh.png"
              alt="QR Khoi Minh Gifts"
              className="h-24 w-24 object-contain sm:h-28 sm:w-28"
              loading="lazy"
            />
          </a>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-5 text-[11px] text-[#D1D3D4]/80 sm:flex-row">
          <p>
            © 2026 {CONTACT_CONFIG.brandName} ({CONTACT_CONFIG.parentBrand}).{' '}
            {isEn ? CONTACT_CONFIG.collectionNameEn : CONTACT_CONFIG.collectionNameVi}.
          </p>
          <p>
            {isEn
              ? 'Displayed prices are estimates — update anytime in src/data/catalog.ts'
              : 'Bảng giá hiện tại là giá dự kiến — cập nhật tại src/data/catalog.ts'}
          </p>
        </div>
      </div>
    </footer>
  );
}
