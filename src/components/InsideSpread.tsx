import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  CONTACT_CONFIG,
  formatVND,
  getBookmarkPickSku,
  getProductById,
  getProductImage,
  MATERIALS,
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
  SlidingTabs,
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
  const [previewMaterial, setPreviewMaterial] = useState<MaterialId>(initialMaterial);

  const previewProduct = getProductById(previewProductId);
  const previewImage = getProductImage(previewProduct, previewMaterial, lang);
  const activeFinish = MATERIALS[previewMaterial];

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
          <span>{isVi ? 'Xem nhanh 11 mẫu thiết kế ↓' : 'Jump to 11 Designs ↓'}</span>
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
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#E8D59E]">
                {isVi
                  ? `Bộ sưu tập ${CONTACT_CONFIG.collectionCode} • 11 Thiết kế`
                  : `${CONTACT_CONFIG.collectionCode} Collection • 11 Editions`}
              </span>
              <h3 className="font-display mt-0.5 text-2xl font-semibold text-[#FAF8F3] sm:text-[28px]">
                {isVi ? 'Khám Phá 11 Lát Cắt Hoa Văn' : 'Explore All 11 Bookmark Editions'}
              </h3>
            </div>
          </div>

          {/* Thẻ xem trước nổi bật: SpotlightCard + LensImage soi chi tiết */}
          <SpotlightCard
            spotlightColor="rgba(196, 148, 46, 0.18)"
            className="rounded-xl border border-[#C4942E]/45 bg-[#FAF8F3] p-3.5 text-[#2B2823] shadow-[0_14px_34px_-12px_rgba(8,30,42,0.5)]"
          >
            <div className="grid items-center gap-3.5 sm:grid-cols-12">
              <LensImage
                src={previewImage.src}
                alt={previewProduct.name}
                zoom={1.85}
                className="mx-auto aspect-[4/5] w-full max-w-[140px] rounded-lg border border-[#E6DFD0] bg-[#EDE8DC] sm:col-span-4 sm:max-w-none"
                imgClassName="object-cover"
                badge={
                  !previewImage.isExactMaterial ? (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-[#0B5268]/88 px-2 py-0.5 text-[9px] font-medium text-[#FAF8F3]">
                      {isVi
                        ? `Tham khảo (${previewImage.actualMaterialLabel})`
                        : `Ref. (${previewImage.actualMaterialLabel})`}
                    </span>
                  ) : null
                }
              />

              <div className="min-w-0 sm:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="rounded-md border border-[#0B5268]/15 bg-[#0B5268]/8 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0B5268]">
                    {getBookmarkPickSku({ productId: previewProduct.id, material: previewMaterial })}
                  </span>
                  <span className="text-[11px] font-medium text-[#7D7665]">
                    {isVi ? previewProduct.motif : previewProduct.motifEn}
                  </span>
                </div>

                <h4 className="font-display mt-1 text-2xl font-semibold text-[#2B2823]">
                  {previewProduct.name}{' '}
                  <span className="text-base font-normal text-[#7D7665]">
                    · {previewProduct.englishTag}
                  </span>
                </h4>

                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#645D4E]">
                  {isVi ? previewProduct.shortDesc : previewProduct.shortDescEn}
                </p>

                {/* Chuyển nhanh 2 chất liệu bằng SlidingTabs */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD0] pt-2.5">
                  <SlidingTabs<MaterialId>
                    layoutId="spread-material-tabs"
                    value={previewMaterial}
                    onChange={setPreviewMaterial}
                    className="border border-[#D8CEBC] bg-[#F3EFE6]"
                    pillClassName="bg-[#0B5268] shadow-xs"
                    activeClassName="text-[#FAF8F3]"
                    inactiveClassName="text-[#645D4E] hover:text-[#2B2823]"
                    items={(['dong', 'ma-vang'] as MaterialId[]).map((matId) => {
                      const mat = MATERIALS[matId];
                      return {
                        value: matId,
                        label: (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${mat.swatchClass}`}
                            />
                            <span>{isVi ? mat.shortLabel : mat.shortLabelEn}</span>
                          </span>
                        ),
                      };
                    })}
                  />

                  <div className="text-right">
                    <span className="text-base font-bold tabular-nums text-[#0B5268]">
                      {formatVND(activeFinish.unitPrice)}
                    </span>
                    <span className="ml-1 text-[10px] text-[#7D7665]">
                      {isVi ? '(dự kiến)' : '(est.)'}
                    </span>
                  </div>
                </div>
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
                const thumb = getProductImage(item, previewMaterial, lang);
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
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
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
              onClick={() => onSelectDesignForOrder(previewProduct.id, previewMaterial)}
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
    </div>
  );
}
