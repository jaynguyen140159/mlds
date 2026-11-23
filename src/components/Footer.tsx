import { motion } from 'motion/react';
import { Globe, Mail, MapPin, MessageCircle, Phone, RotateCcw, Send } from 'lucide-react';
import { ABOUT_BRAND_CONTENT, CONTACT_CONFIG, type Language } from '../data/catalog';
import { GlossyLogo, SpotlightCard } from './ui/aceternity';

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
      className="relative flex flex-1 min-h-full flex-col justify-between overflow-hidden bg-[#0B5268] px-6 py-5 text-[#D1D3D4] sm:px-9 sm:py-6"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-[490px] flex-1 flex-col justify-between">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex flex-col items-center text-center">
            <GlossyLogo
              src="images/brand/logo-stacked.png"
              alt="Khoi Minh Gifts"
              className="h-16 w-auto object-contain sm:h-20"
            />
            <div className="mt-3 h-px w-16 bg-[#C4942E]/65" />
          </div>

          <div
            className={`mt-3.5 space-y-2 text-justify text-[12px] leading-[1.56] tracking-[0.004em] text-[#D1D3D4]/95 sm:text-[12.5px] ${
              isEn ? 'italic' : ''
            }`}
          >
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          <div className="my-3.5 h-px w-full bg-[#C4942E]/35" />

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

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={`https://zalo.me/${CONTACT_CONFIG.zaloPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8D59E]/35 bg-[#083E50]/90 px-3.5 py-1.5 text-xs font-medium text-[#FAF8F4] transition-colors hover:border-[#E8D59E] hover:bg-[#083E50]"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#E8D59E]" />
                  <span>{isEn ? 'Zalo Chat' : 'Chat Zalo'}</span>
                </a>
                <a
                  href={`https://m.me/${CONTACT_CONFIG.messengerUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8D59E]/35 bg-[#083E50]/90 px-3.5 py-1.5 text-xs font-medium text-[#FAF8F4] transition-colors hover:border-[#E8D59E] hover:bg-[#083E50]"
                >
                  <Send className="h-3.5 w-3.5 text-[#E8D59E]" />
                  <span>Messenger</span>
                </a>
              </div>
            </div>

            <SpotlightCard
              spotlightColor="rgba(196, 148, 46, 0.28)"
              className="self-start rounded-xl border border-[#C4942E]/40 bg-white/95 p-1.5 shadow-[0_10px_25px_-10px_rgba(8,30,42,0.55)] sm:self-end"
            >
              <a
                href={CONTACT_CONFIG.qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg transition-transform hover:scale-[1.03]"
                title="Khoi Minh Gifts QR"
              >
                <img
                  src="images/brand/qr-khoiminh.png"
                  alt="QR Khoi Minh Gifts"
                  className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                />
              </a>
            </SpotlightCard>
          </div>
        </motion.div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3 text-[10.5px] text-[#D1D3D4]/80">
          <p>
            © 2026 {CONTACT_CONFIG.brandName} ({CONTACT_CONFIG.parentBrand}).
          </p>
          {onBackToCover && (
            <button
              type="button"
              onClick={onBackToCover}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8D59E]/30 bg-[#083E50]/70 px-3 py-1.5 font-semibold text-[#E8D59E] transition-colors hover:border-[#E8D59E] hover:bg-[#083E50] cursor-pointer"
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
