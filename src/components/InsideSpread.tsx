import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Expand, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getProductById,
  getProductImage,
  PRODUCTS,
  type Language,
  type MaterialId,
  type ProductDesign,
} from '../data/catalog';
import { StorySection } from './StorySection';
import {
  HoverHighlightGrid,
  LensImage,
  ShimmerButton,
  SpotlightCard,
} from './ui/aceternity';

interface InsideSpreadProps {
  lang: Language;
  initialProductId: string;
  initialMaterial: MaterialId;
  onSelectDesignForOrder: (productId: string, material: MaterialId) => void;
}

export function InsideSpread({
  lang,
  initialProductId,
  initialMaterial,
  onSelectDesignForOrder,
}: InsideSpreadProps) {
  const isVi = lang === 'vi';
  const [previewProductId, setPreviewProductId] = useState<string>(initialProductId);
  const [zoomedOpen, setZoomedOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!zoomedOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedOpen]);

  const previewProduct = getProductById(previewProductId);
  const previewImage = getProductImage(previewProduct, initialMaterial, lang);

  const jumpToRightSpread = () => {
    document
      .getElementById('spread-showcase-right')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative grid flex-1 min-h-full lg:grid-cols-2">
      {/* Lối tắt nhanh trên Mobile từ mặt di sản xuống mặt 11 mẫu */}
      <div
        className="pdf-paper-surface border-b border-[#D6CEBC] px-5 pt-4 pb-2 lg:hidden"
        style={{ backgroundImage: "url('images/brand/paper-texture.jpg')" }}
      >
        <button
          type="button"
          onClick={jumpToRightSpread}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B5268]/30 bg-white/85 px-3 py-1 text-[11px] font-semibold text-[#0B5268] cursor-pointer"
        >
          <Sparkles className="h-3 w-3 text-[#C4942E]" />
          <span>{isVi ? 'Xem nhanh 12 mẫu thiết kế ↓' : 'Jump to 12 Designs ↓'}</span>
        </button>
      </div>

      {/* MẶT TRÁI MỞ GẬP ĐÔI: CHUYÊN KHẢO VĂN MINH ĐÔNG SƠN TRÊN GIẤY COTTON PDF */}
      <div className="min-w-0">
        <StorySection lang={lang} embedded />
      </div>

      {/* NẾP GẤP GÁY GIỮA 2 MẶT TRÊN DESKTOP */}
      <div
        aria-hidden="true"
        className="brochure-spine-center pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-10 -translate-x-1/2 lg:block"
      />

      {/* Nếp gấp ngang trên Mobile */}
      <div
        aria-hidden="true"
        className="h-3 w-full bg-gradient-to-b from-[#CFC7B5] via-[#B4AA95] to-[#083E50] lg:hidden"
      />

      {/* MẶT PHẢI MỞ GẬP ĐÔI: GIỚI THIỆU NHANH 11 MẪU TRÊN NỀN HOA VĂN TRỐNG ĐỒNG */}
      <div
        id="spread-showcase-right"
        className="relative flex min-w-0 flex-col justify-between overflow-hidden bg-[#0B5268] px-5 py-5 text-[#D1D3D4] sm:px-8 sm:py-6 lg:px-9"
      >
        <img
          src="images/brand/pattern-drum-teal.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.26]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#083E50]/45"
        />

        <div className="relative z-10 flex h-full flex-col justify-between gap-2.5">
          {/* Header mặt phải */}
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[#FAF8F3] sm:text-[28px]">
                {isVi ? 'Khám Phá 12 Lát Cắt Hoa Văn' : 'Explore All 12 Bookmark Editions'}
              </h3>
              <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#E8D59E]">
                {isVi
                  ? '2 PHIÊN BẢN: ĐỒNG CAO CẤP - ĐỒNG MẠ VÀNG 24K'
                  : '2 EDITIONS: PREMIUM BRASS - 24K GOLD PLATED'}
              </p>
            </div>
          </div>

          {/* Thẻ xem trước nổi bật: Ảnh sản phẩm lớn rõ nét + Tên sản phẩm */}
          <SpotlightCard
            spotlightColor="rgba(196, 148, 46, 0.18)"
            className="rounded-xl border border-[#C4942E]/45 bg-[#FAF8F3] p-3 text-[#2B2823] shadow-[0_14px_34px_-12px_rgba(8,30,42,0.5)]"
          >
            <div className="flex flex-col gap-2.5">
              <div className="relative h-[205px] w-full overflow-hidden rounded-lg border border-[#E6DFD0] bg-[#EDE8DC] sm:h-[220px]">
                <LensImage
                  src={previewImage.src}
                  alt={previewProduct.name}
                  zoom={1.85}
                  className="h-full w-full"
                  imgClassName="object-cover object-[50%_76%]"
                />
                <button
                  type="button"
                  onClick={() => setZoomedOpen(true)}
                  aria-label={isVi ? 'Phóng to xem chi tiết ảnh' : 'Enlarge product image'}
                  title={isVi ? 'Phóng to ảnh' : 'Enlarge image'}
                  className="absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-lg border border-[#C4942E]/45 bg-white/95 text-[#0B5268] shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 px-1">
                <h4 className="font-display text-xl font-semibold text-[#2B2823] sm:text-2xl">
                  {previewProduct.name}
                </h4>
                <span className="text-xs font-medium text-[#7D7665]">
                  {previewProduct.englishTag}
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Lưới chọn nhanh 11 mẫu với HoverHighlightGrid */}
          <div>
            <HoverHighlightGrid<ProductDesign>
              items={PRODUCTS}
              selectedKey={previewProduct.id}
              getKey={(item) => item.id}
              onSelect={(item) => setPreviewProductId(item.id)}
              layoutId="spread-hover-bg"
              highlightClassName="bg-[#E8D59E]/25 border border-[#E8D59E]/50"
              className="grid grid-cols-4 gap-1 sm:grid-cols-6"
              renderItem={(item, active) => {
                const thumb = getProductImage(item, initialMaterial, lang);
                return (
                  <div
                    className={`group relative flex min-w-0 flex-col overflow-hidden rounded-lg border transition-all ${
                      active
                        ? 'border-[#E8D59E] bg-[#FAF8F3] ring-1 ring-[#C4942E] shadow-sm'
                        : 'border-white/20 bg-[#083E50]/80'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#063140]">
                      <img
                        src={thumb.src}
                        alt={item.name}
                        className="h-full w-full object-cover object-[50%_76%] transition-transform duration-300 group-hover:scale-[1.06]"
                        loading="lazy"
                      />
                      {active && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C4942E] text-[#083E50] shadow-xs">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <span
                      className={`block truncate px-1 py-1 text-center text-[10px] ${
                        active ? 'font-semibold text-[#0B5268]' : 'font-medium text-[#E8E5DB]'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                );
              }}
            />
          </div>

          {/* Nút chuyển trực tiếp sang trang Đặt hàng & Khắc đế */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <span className="text-[11px] text-[#D1D3D4]/85">
              {isVi
                ? 'Đã chọn sẵn mẫu này để tùy chỉnh số lượng & khắc tên ở trang kế tiếp.'
                : 'Selected design carries straight into the customization page.'}
            </span>
            <ShimmerButton
              type="button"
              variant="gold"
              onClick={() => onSelectDesignForOrder(previewProduct.id, initialMaterial)}
              className="w-full px-5 py-2.5 text-sm sm:w-auto"
            >
              <span>
                {isVi ? 'Tùy biến & Đặt mua mẫu này' : 'Customize & Order This Design'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </ShimmerButton>
          </div>
        </div>
      </div>

      {/* Lightbox phóng to xem chi tiết ảnh sản phẩm */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {zoomedOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
                onClick={() => setZoomedOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-label={previewProduct.name}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setZoomedOpen(false)}
                    aria-label={isVi ? 'Đóng' : 'Close'}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B5268]/90 text-white hover:bg-[#083E50] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img
                    src={previewImage.src}
                    alt={previewProduct.name}
                    className="max-h-[70vh] w-full bg-[#EDE8DC] object-contain"
                  />
                  <div className="flex items-center justify-between gap-2 p-4 sm:p-5">
                    <h4 className="font-display text-2xl font-semibold text-[#2B2823]">
                      {previewProduct.name}
                    </h4>
                    <span className="text-sm font-medium text-[#7D7665]">
                      {previewProduct.englishTag}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
