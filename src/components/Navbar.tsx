import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { CONTACT_CONFIG, type Language } from '../data/catalog';

interface NavbarProps {
  savedSetCount: number;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onSelectOrderCta: () => void;
}

export function Navbar({ savedSetCount, lang, onChangeLang, onSelectOrderCta }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks =
    lang === 'vi'
      ? [
          { href: '#cau-chuyen', label: 'Văn minh Đông Sơn' },
          { href: '#dat-hang', label: 'Đặt sản phẩm' },
          { href: '#khach-hang', label: 'Khoi Minh Gifts' },
        ]
      : [
          { href: '#cau-chuyen', label: 'Dong Son Civilization' },
          { href: '#dat-hang', label: 'Order & Engraving' },
          { href: '#khach-hang', label: 'Khoi Minh Gifts' },
        ];

  const ctaLabel =
    savedSetCount > 0
      ? lang === 'vi'
        ? `Đơn hàng (${savedSetCount})`
        : `Order (${savedSetCount})`
      : lang === 'vi'
        ? 'Đặt sản phẩm'
        : 'Order Now';

  return (
    <header className="sticky top-0 z-40 border-b border-[#C4942E]/30 bg-[#094558]/95 text-[#D1D3D4] backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 lg:px-8">
        <a
          href="#"
          className="flex min-w-0 shrink items-center transition-opacity hover:opacity-90"
          aria-label={`${CONTACT_CONFIG.brandName} — ${CONTACT_CONFIG.collectionNameVi}`}
        >
          <img
            src="images/brand/logo-horizontal.png"
            alt="Khoi Minh Gifts"
            className="h-7 w-auto object-contain sm:h-9"
          />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#D1D3D4] transition-colors hover:text-[#E8D59E]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div
            className="inline-flex shrink-0 items-center rounded-md border border-[#C4942E]/45 bg-[#083E50] p-0.5 text-[11px] font-semibold"
            role="group"
            aria-label={lang === 'vi' ? 'Chọn ngôn ngữ' : 'Language selector'}
          >
            <button
              type="button"
              onClick={() => onChangeLang('vi')}
              className={`rounded px-2 py-1 transition-colors cursor-pointer ${
                lang === 'vi'
                  ? 'bg-[#C4942E] text-[#083E50]'
                  : 'text-[#D1D3D4] hover:text-white'
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`rounded px-2 py-1 transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#C4942E] text-[#083E50]'
                  : 'text-[#D1D3D4] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={onSelectOrderCta}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-4 sm:py-2 sm:text-sm cursor-pointer ${
              savedSetCount > 0
                ? 'bg-[#C4942E] text-[#083E50] hover:bg-[#D5A640]'
                : 'bg-[#E8E5DB] text-[#094558] hover:bg-[#E8D59E]'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{ctaLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#D1D3D4]/25 bg-[#083E50] text-[#FAF8F4] md:hidden cursor-pointer sm:h-9 sm:w-9"
            aria-label={lang === 'vi' ? 'Mở menu' : 'Toggle menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#C4942E]/25 bg-[#083E50] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#D1D3D4] hover:bg-[#0B5268] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
