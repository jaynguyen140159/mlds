import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { CONTACT_CONFIG, type Language } from '../data/catalog';
import type { BrochurePage } from './BrochureBook';

interface NavbarProps {
  currentPage: BrochurePage;
  onNavigatePage: (page: BrochurePage) => void;
  savedSetCount: number;
  lang: Language;
  onChangeLang: (lang: Language) => void;
}

export function Navbar({
  currentPage,
  onNavigatePage,
  savedSetCount,
  lang,
  onChangeLang,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: { page: BrochurePage; label: string }[] =
    lang === 'vi'
      ? [
          { page: 1, label: 'Văn minh & 11 Mẫu' },
          { page: 2, label: 'Đặt sản phẩm' },
          { page: 3, label: 'Khoi Minh Gifts' },
        ]
      : [
          { page: 1, label: 'Heritage & Designs' },
          { page: 2, label: 'Order & Engraving' },
          { page: 3, label: 'Khoi Minh Gifts' },
        ];

  const ctaLabel =
    savedSetCount > 0
      ? lang === 'vi'
        ? `Đơn hàng (${savedSetCount})`
        : `Order (${savedSetCount})`
      : lang === 'vi'
        ? 'Đặt sản phẩm'
        : 'Order Now';

  const handleNavClick = (page: BrochurePage) => {
    onNavigatePage(page);
    setMobileOpen(false);
  };

  return (
    <header className="relative z-40 shrink-0 border-b border-[#C4942E]/30 bg-[#094558] text-[#D1D3D4]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNavClick(0)}
          className="flex min-w-0 shrink items-center transition-opacity hover:opacity-90 cursor-pointer"
          aria-label={`${CONTACT_CONFIG.brandName} — ${CONTACT_CONFIG.collectionNameVi}`}
        >
          <img
            src="images/brand/logo-horizontal.png"
            alt="Khoi Minh Gifts"
            className="h-7 w-auto object-contain sm:h-8"
          />
        </button>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = currentPage === link.page;
            return (
              <button
                key={link.page}
                type="button"
                onClick={() => handleNavClick(link.page)}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'text-[#E8D59E] underline decoration-[#C4942E] decoration-2 underline-offset-8'
                    : 'text-[#D1D3D4] hover:text-[#E8D59E]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Nút chuyển đổi ngôn ngữ VI | EN duy nhất */}
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
            onClick={() => handleNavClick(2)}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3.5 sm:py-1.5 sm:text-sm cursor-pointer ${
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
            {navLinks.map((link) => {
              const active = currentPage === link.page;
              return (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleNavClick(link.page)}
                  className={`rounded-md px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0B5268] text-[#E8D59E]'
                      : 'text-[#D1D3D4] hover:bg-[#0B5268] hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
