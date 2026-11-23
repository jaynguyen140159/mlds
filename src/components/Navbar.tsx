import { AnimatePresence, motion } from 'motion/react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { CONTACT_CONFIG, type Language } from '../data/catalog';
import type { BrochurePage } from './BrochureBook';
import { GlossyLogo, SlidingTabs } from './ui/aceternity';

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
    <header className="relative z-40 shrink-0 border-b border-slate-200/70 bg-white/65 text-slate-800 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => handleNavClick(0)}
          className="flex min-w-0 shrink items-center transition-opacity hover:opacity-80 cursor-pointer"
          aria-label={`${CONTACT_CONFIG.brandName} — ${CONTACT_CONFIG.collectionNameVi}`}
        >
          <GlossyLogo
            src="images/brand/logo-horizontal.png"
            alt="Khoi Minh Gifts"
            className="h-7 w-auto object-contain sm:h-8"
          />
        </button>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = currentPage === link.page;
            return (
              <button
                key={link.page}
                type="button"
                onClick={() => handleNavClick(link.page)}
                className={`relative z-10 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  active
                    ? 'font-semibold text-[#083E50]'
                    : 'font-medium text-slate-700 hover:bg-slate-900/5 hover:text-slate-950'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-lg bg-[#F3E79B] shadow-xs"
                  />
                )}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Nút chuyển đổi ngôn ngữ VI | EN duy nhất */}
          <div
            role="group"
            aria-label={lang === 'vi' ? 'Chọn ngôn ngữ' : 'Language selector'}
          >
            <SlidingTabs
              layoutId="navbar-lang-pill"
              value={lang}
              onChange={onChangeLang}
              items={[
                { value: 'vi', label: 'VI' },
                { value: 'en', label: 'EN' },
              ]}
              className="border border-slate-300/70 bg-white/50 backdrop-blur-xs"
              itemClassName="px-2 py-1 text-[11px] font-semibold"
              activeClassName="text-[#083E50]"
              inactiveClassName="text-slate-700 hover:text-slate-950"
              pillClassName="bg-[#F3E79B]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleNavClick(2)}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3.5 sm:py-1.5 sm:text-sm cursor-pointer ${
              savedSetCount > 0 || currentPage === 2
                ? 'bg-[#F3E79B] text-[#083E50] shadow-xs hover:bg-[#F8F0B8]'
                : 'border border-slate-300/80 bg-white text-[#083E50] hover:bg-[#F3E79B]'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{ctaLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/80 bg-white/60 text-slate-800 md:hidden cursor-pointer sm:h-9 sm:w-9"
            aria-label={lang === 'vi' ? 'Mở menu' : 'Toggle menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-slate-200/70 bg-white/85 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => {
                const active = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    type="button"
                    onClick={() => handleNavClick(link.page)}
                    className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#F3E79B] font-semibold text-[#083E50]'
                        : 'text-slate-700 hover:bg-slate-900/5 hover:text-slate-950'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
