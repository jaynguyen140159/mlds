import { BookOpen } from 'lucide-react';
import { CONTACT_CONFIG, type Language } from '../data/catalog';

interface HeroProps {
  lang: Language;
  onOpenBrochure: () => void;
}

export function Hero({ lang, onOpenBrochure }: HeroProps) {
  const isVi = lang === 'vi';

  return (
    <section className="relative flex flex-1 min-h-full flex-col justify-between overflow-hidden bg-[#0B5268] text-center text-[#D1D3D4]">
      {/* Hoa văn Trống Đồng tràn nền bìa chính PDF */}
      <img
        src="images/brand/pattern-drum-teal.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.22]"
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(8,62,80,0.42)_100%)]"
        aria-hidden="true"
      />

      {/* Viền chỉ nhũ vàng mảnh kiểu bìa ấn phẩm cứng (nằm dưới lớp artwork trống đồng) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 z-0 rounded-[4px] border border-[#C4942E]/25 sm:inset-3.5"
      />

      {/* Mặt Trống Đồng Đông Sơn — To tràn full 100% chiều ngang bìa trước */}
      <div
        className="relative z-10 w-full shrink-0 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 88%, transparent 100%)',
        }}
      >
        <img
          src="images/brand/hero-drum-art.png"
          alt={
            isVi
              ? 'Ấn phẩm bìa Mặt Trống Đồng Đông Sơn — Một Lát Đông Sơn'
              : 'Dong Son Bronze Drum Cover Artwork — A Slice of Dong Son Civilization'
          }
          className="block h-[clamp(220px,38vh,360px)] w-full object-cover object-bottom"
        />
      </div>

      {/* Khóa tiêu đề PP Migra, mô tả & logo chân bìa */}
      <div className="relative z-10 -mt-2 flex flex-1 flex-col items-center justify-between px-6 pb-5 pt-0 sm:px-9 sm:pb-6">
        <div className="flex flex-col items-center">
          <h1 className="sr-only">
            {CONTACT_CONFIG.collectionNameVi} — {CONTACT_CONFIG.collectionNameEn}
          </h1>
          <img
            src="images/brand/title-mot-lat-dong-son.png"
            alt="Một Lát Đông Sơn — A Slice of Dong Son Civilization"
            className="h-auto w-[240px] max-w-full object-contain sm:w-[310px]"
          />

          <p className="mx-auto mt-2.5 max-w-md text-[12.5px] leading-[1.58] tracking-[0.004em] text-[#D1D3D4] sm:text-[13.5px]">
            {isVi
              ? 'Bộ sưu tập 11 mẫu bookmark nghệ thuật Đông Sơn chế tác trên Đồng và Đồng Mạ Vàng 24K, đi kèm đế gỗ thanh mảnh khắc nội dung theo yêu cầu.'
              : 'A curated collection of 11 Dong Son heritage bookmarks crafted in brushed brass and 24K gold-plated brass, paired with slim custom-engraved wood bases.'}
          </p>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onOpenBrochure}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C4942E] px-6 py-2.5 text-sm font-semibold text-[#083E50] shadow-sm transition-colors hover:bg-[#D5A640] cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>{isVi ? 'Mở ấn phẩm' : 'Open Brochure'}</span>
            </button>
          </div>
        </div>

        {/* Logo & chỉ dẫn lật trang ở chân bìa */}
        <div className="relative mt-4 flex flex-col items-center gap-1.5">
          <img
            src="images/brand/logo-stacked.png"
            alt="Khoi Minh Gifts"
            className="h-10 w-auto object-contain sm:h-12"
          />
          <span className="text-[11px] tracking-wide text-[#E8D59E]/80">
            {isVi
              ? 'Bấm mũi tên hoặc phím → để lật mở ấn phẩm'
              : 'Use arrows or press → to open brochure'}
          </span>
        </div>
      </div>
    </section>
  );
}
