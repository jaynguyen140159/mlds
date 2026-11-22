import { Globe, Mail, MapPin, MessageCircle, Phone, RotateCcw, Send } from 'lucide-react';
import { ABOUT_BRAND_CONTENT, CONTACT_CONFIG, type Language } from '../data/catalog';

interface FooterProps {
  lang: Language;
  onBackToCover?: () => void;
}

export function Footer({ lang, onBackToCover }: FooterProps) {
  const isEn = lang === 'en';
  const paragraphs = isEn
    ? ABOUT_BRAND_CONTENT.enParagraphs
    : ABOUT_BRAND_CONTENT.viParagraphs;

  return (
    <footer
      id="khach-hang"
      className="relative flex flex-1 min-h-full flex-col justify-between overflow-hidden bg-[#0B5268] px-6 py-7 text-[#D1D3D4] sm:px-9 sm:py-8"
    >
      {/* Viền chỉ nhũ vàng mảnh kiểu bìa sau ấn phẩm cứng */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 rounded-[4px] border border-[#C4942E]/25 sm:inset-3.5"
      />

      {/* Bố cục chính thức Trang 1 Trái (Bìa sau) của PDF: nền xanh trơn đồng nhất bản in, Logo giữa -> 3 đoạn Be Vietnam Pro -> Đường kẻ mảnh -> Địa chỉ + QR */}
      <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-col items-center text-center">
            <img
              src="images/brand/logo-stacked.png"
              alt="Khoi Minh Gifts"
              className="h-16 w-auto object-contain sm:h-20"
            />
          </div>

          <div
            className={`mt-5 space-y-2.5 text-justify text-[12px] leading-[1.55] tracking-[0.004em] text-[#D1D3D4] sm:text-[12.5px] ${
              isEn ? 'italic' : ''
            }`}
          >
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <hr className="my-5 border-[#D1D3D4]/25" />

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="space-y-2 text-[11.5px] leading-relaxed text-[#D1D3D4] sm:text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E8D59E]" />
                <span>{isEn ? CONTACT_CONFIG.addressEn : CONTACT_CONFIG.addressVi}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 shrink-0 text-[#E8D59E]" />
                <a
                  href={CONTACT_CONFIG.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#E8D59E]"
                >
                  {CONTACT_CONFIG.websiteDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#E8D59E]" />
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="transition-colors hover:text-[#E8D59E]"
                >
                  {CONTACT_CONFIG.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#E8D59E]" />
                <a
                  href={`tel:${CONTACT_CONFIG.zaloPhone}`}
                  className="transition-colors hover:text-[#E8D59E]"
                >
                  {CONTACT_CONFIG.hotlineDisplay}
                </a>
              </div>

              <div className="flex flex-wrap gap-2 pt-1.5">
                <a
                  href={`https://zalo.me/${CONTACT_CONFIG.zaloPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#C4942E] px-3 py-1.5 text-xs font-semibold text-[#083E50] transition-colors hover:bg-[#D5A640]"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{isEn ? 'Zalo Chat' : 'Chat Zalo'}</span>
                </a>
                <a
                  href={`https://m.me/${CONTACT_CONFIG.messengerUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#D1D3D4]/45 bg-[#083E50]/85 px-3 py-1.5 text-xs font-medium text-[#FAF8F4] transition-colors hover:border-[#E8D59E]"
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
              className="inline-block self-start overflow-hidden rounded bg-white p-1.5 shadow-sm transition-transform hover:scale-[1.03] sm:self-end"
              title="Khoi Minh Gifts QR"
            >
              <img
                src="images/brand/qr-khoiminh.png"
                alt="QR Khoi Minh Gifts"
                className="h-20 w-20 object-contain sm:h-24 sm:w-24"
              />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-4 text-[10.5px] text-[#D1D3D4]/80">
          <p>
            © 2026 {CONTACT_CONFIG.brandName} ({CONTACT_CONFIG.parentBrand}).
          </p>
          {onBackToCover && (
            <button
              type="button"
              onClick={onBackToCover}
              className="inline-flex items-center gap-1 font-semibold text-[#E8D59E] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isEn ? 'Back to front cover' : 'Lật về bìa trước'}</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
