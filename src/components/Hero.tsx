import { ArrowDownRight } from 'lucide-react';
import { CONTACT_CONFIG, type Language } from '../data/catalog';

interface HeroProps {
  lang: Language;
  onStartSelecting: () => void;
}

export function Hero({ lang, onStartSelecting }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#C4942E]/35 bg-[#0B5268] text-[#D1D3D4]">
      {/* Hoa văn Trống Đồng tràn nền chuẩn chiều sâu xanh ngọc lam cân bằng của PDF */}
      <img
        src="images/brand/pattern-drum-teal.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.22]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(8,62,80,0.42)_100%)]"
        aria-hidden="true"
      />

      {/* Bìa cứng Mặt Trống Đồng Đông Sơn — trung thành với Trang 1 Phải của ấn phẩm PDF */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-12 text-center sm:px-6 sm:pb-16 lg:px-8">
        <div
          className="mx-auto w-fit overflow-hidden"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          }}
        >
          <img
            src="images/brand/hero-drum-art.png"
            alt={
              lang === 'vi'
                ? 'Ấn phẩm bìa Mặt Trống Đồng Đông Sơn — Một Lát Đông Sơn'
                : 'Dong Son Bronze Drum Cover Artwork — A Slice of Dong Son Civilization'
            }
            className="mx-auto block h-auto max-h-[290px] w-auto object-contain object-top sm:max-h-[410px] lg:max-h-[450px]"
          />
        </div>

        {/* Khóa tiêu đề PP Migra trích xuất trực tiếp từ PDF */}
        <div className="mt-4 flex flex-col items-center">
          <h1 className="sr-only">
            {CONTACT_CONFIG.collectionNameVi} — {CONTACT_CONFIG.collectionNameEn}
          </h1>
          <img
            src="images/brand/title-mot-lat-dong-son.png"
            alt="Một Lát Đông Sơn — A Slice of Dong Son Civilization"
            className="h-auto w-[290px] max-w-full object-contain sm:w-[400px] lg:w-[440px]"
          />

          <p className="mx-auto mt-5 max-w-lg text-[13.5px] leading-[1.6] tracking-[0.005em] text-[#D1D3D4] sm:text-[14.5px]">
            {lang === 'vi'
              ? 'Bộ sưu tập 11 mẫu bookmark nghệ thuật Đông Sơn chế tác trên Đồng và Đồng Mạ Vàng 24K, đi kèm đế gỗ thanh mảnh khắc nội dung theo yêu cầu.'
              : 'A curated collection of 11 Dong Son heritage bookmarks crafted in brushed brass and 24K gold-plated brass, paired with slim custom-engraved wood bases.'}
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onStartSelecting}
              className="inline-flex items-center gap-2 rounded-md bg-[#C4942E] px-7 py-3 text-sm font-semibold text-[#083E50] transition-colors hover:bg-[#D5A640] cursor-pointer"
            >
              <span>
                {lang === 'vi' ? 'Chọn mẫu & đặt sản phẩm' : 'Choose Design & Customize'}
              </span>
              <ArrowDownRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center opacity-95">
          <img
            src="images/brand/logo-stacked.png"
            alt="Khoi Minh Gifts"
            className="h-14 w-auto object-contain sm:h-16"
          />
        </div>
      </div>
    </section>
  );
}
