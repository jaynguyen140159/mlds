import gsap from 'gsap';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Expand,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  Send,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  buildMailtoHref,
  buildSellerReadyOrderMessage,
  CONTACT_CONFIG,
  copyTextReliably,
  ENGRAVED_BASE_SAMPLES,
  ENGRAVING_FONTS,
  ENGRAVING_SUGGESTIONS,
  FONT_CATEGORIES,
  formatEngravingForWorkshop,
  formatVND,
  getFontById,
  getFullSetSku,
  getProductById,
  getProductImage,
  getSetPrice,
  isSetEngravingValid,
  MATERIALS,
  PRODUCTS,
  submitOrderToEmail,
  WOOD_BASES,
  type BuiltOrderPayload,
  type CustomerInfo,
  type FontCategory,
  type Language,
  type MaterialId,
  type OrderSet,
  type ProductDesign,
  type WoodBaseId,
} from '../data/catalog';

interface ProductConfiguratorProps {
  lang: Language;
  step: 1 | 2;
  onChangeStep: (step: 1 | 2) => void;
  orderSets: OrderSet[];
  activeSetIndex: number;
  onSelectSetIndex: (index: number) => void;
  onSetTotalQuantity: (qty: number) => void;
  onAddOneAndSelect: () => void;
  onUpdateActiveSet: (patch: Partial<Omit<OrderSet, 'id'>>) => void;
  onApplyActiveToAll: () => void;
  onRemoveSet: (index: number) => void;
  onEditSetFromStep2: (index: number) => void;
  customerInfo: CustomerInfo;
  onUpdateCustomer: (patch: Partial<CustomerInfo>) => void;
  onResetOrder: () => void;
  onContactCorporate: () => void;
}

interface SubmittedOrderState {
  payload: BuiltOrderPayload;
  customerSnapshot: CustomerInfo;
  emailMode: 'sent' | 'fallback';
}

export function ProductConfigurator({
  lang,
  step,
  onChangeStep,
  orderSets,
  activeSetIndex,
  onSelectSetIndex,
  onSetTotalQuantity,
  onAddOneAndSelect,
  onUpdateActiveSet,
  onApplyActiveToAll,
  onRemoveSet,
  onEditSetFromStep2,
  customerInfo,
  onUpdateCustomer,
  onResetOrder,
  onContactCorporate,
}: ProductConfiguratorProps) {
  const isVi = lang === 'vi';
  const [fontCategory, setFontCategory] = useState<FontCategory>('classic');
  const [showMessagePreview, setShowMessagePreview] = useState<boolean>(false);
  const [showSampleModal, setShowSampleModal] = useState<boolean>(false);
  const [sampleModalIndex, setSampleModalIndex] = useState<number>(0);
  const [zoomedProduct, setZoomedProduct] = useState<ProductDesign | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedState, setSubmittedState] = useState<SubmittedOrderState | null>(null);
  const [justCopied, setJustCopied] = useState<boolean>(false);
  const [syncedAllNotice, setSyncedAllNotice] = useState<boolean>(false);
  const [handoffChannel, setHandoffChannel] = useState<'messenger' | 'zalo' | null>(null);

  const engravingInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const viewStage = step === 1 ? 'step1' : submittedState === null ? 'step2-form' : 'step2-done';
  const prevStageRef = useRef<string>(viewStage);

  // Chuyển cảnh GSAP mượt mà giữa Bước 1 <-> Bước 2A <-> Bước 2B
  useLayoutEffect(() => {
    if (prevStageRef.current === viewStage) return;
    prevStageRef.current = viewStage;

    const el = stepContentRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: prefersReduced ? 0.16 : 0.3,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }, stepContentRef);

    return () => ctx.revert();
  }, [viewStage]);

  const safeActiveIndex = Math.min(activeSetIndex, Math.max(0, orderSets.length - 1));
  const activeSet = orderSets[safeActiveIndex] ?? orderSets[0];

  // Tự đồng bộ tab nhóm font khi chuyển giữa các bộ
  useEffect(() => {
    const f = getFontById(activeSet.fontId);
    setFontCategory(f.category);
  }, [activeSet.fontId]);

  const activeProduct = getProductById(activeSet.productId);
  const activeFont = getFontById(activeSet.fontId);
  const activeImage = getProductImage(activeProduct, activeSet.material, lang);

  const visibleFonts = useMemo(
    () => ENGRAVING_FONTS.filter((f) => f.category === fontCategory),
    [fontCategory]
  );

  // Nội dung hiển thị trực tiếp trên thanh gỗ mô phỏng
  const rawPreviewText = useMemo(() => {
    if (activeSet.woodBase === 'tron') return '';
    if (activeSet.engravingLater) {
      return isVi ? 'Gửi nội dung sau qua chat' : 'Engraving text via chat';
    }
    return activeSet.engravingText;
  }, [activeSet, isVi]);

  const formattedWorkshopPreview = useMemo(() => {
    if (activeSet.engravingLater) return rawPreviewText;
    return formatEngravingForWorkshop(rawPreviewText, activeFont);
  }, [rawPreviewText, activeFont, activeSet.engravingLater]);

  const builtOrder = useMemo(
    () => buildSellerReadyOrderMessage(orderSets, customerInfo, lang),
    [orderSets, customerInfo, lang]
  );

  const scrollToSectionTop = () => {
    const section = document.getElementById('dat-hang');
    const scrollParent = section?.closest('.brochure-page-scroll') as HTMLElement | null;
    if (scrollParent) {
      scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGoToStep2 = () => {
    const firstInvalidIdx = orderSets.findIndex((s) => !isSetEngravingValid(s));
    if (firstInvalidIdx !== -1) {
      const invalidProd = getProductById(orderSets[firstInvalidIdx].productId);
      onSelectSetIndex(firstInvalidIdx);
      setStep1Error(
        orderSets.length > 1
          ? isVi
            ? `Bộ #${firstInvalidIdx + 1} (${invalidProd.name}) chưa có nội dung khắc đế gỗ. Vui lòng nhập chữ hoặc chọn "Gửi chữ sau qua chat".`
            : `Set #${firstInvalidIdx + 1} (${invalidProd.name}) is missing engraving text. Please enter text or choose "Send text later".`
          : isVi
            ? 'Vui lòng nhập nội dung khắc đế gỗ (hoặc chọn "Gửi chữ sau qua chat").'
            : 'Please enter engraving text (or choose "Send text later via chat").'
      );
      window.setTimeout(() => {
        engravingInputRef.current?.focus();
        engravingInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
      return;
    }

    setStep1Error(null);
    setCustomerError(null);
    setSubmittedState(null);
    onChangeStep(2);
    window.setTimeout(scrollToSectionTop, 40);
  };

  const handleBackToStep1 = () => {
    setSubmittedState(null);
    setCustomerError(null);
    setHandoffChannel(null);
    onChangeStep(1);
    window.setTimeout(scrollToSectionTop, 40);
  };

  const handleSyncAll = () => {
    onApplyActiveToAll();
    setSyncedAllNotice(true);
    setStep1Error(null);
    window.setTimeout(() => setSyncedAllNotice(false), 2200);
  };

  const handleConfirmOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanName = customerInfo.fullName.trim();
    const digitsCount = customerInfo.phone.replace(/\D/g, '').length;

    if (cleanName.length < 2) {
      setCustomerError(
        isVi
          ? 'Vui lòng nhập họ và tên để Khoi Minh Gifts liên hệ xác nhận đơn.'
          : 'Please enter your full name so Khoi Minh Gifts can confirm your order.'
      );
      nameInputRef.current?.focus();
      return;
    }

    if (digitsCount < 9) {
      setCustomerError(
        isVi
          ? 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 chữ số).'
          : 'Please enter a valid phone number (at least 9 digits).'
      );
      phoneInputRef.current?.focus();
      return;
    }

    const firstInvalidIdx = orderSets.findIndex((s) => !isSetEngravingValid(s));
    if (firstInvalidIdx !== -1) {
      onEditSetFromStep2(firstInvalidIdx);
      setStep1Error(
        isVi
          ? `Bộ #${firstInvalidIdx + 1} chưa có nội dung khắc đế gỗ.`
          : `Set #${firstInvalidIdx + 1} is missing engraving text.`
      );
      return;
    }

    setCustomerError(null);
    setIsSubmitting(true);

    const payloadSnapshot = buildSellerReadyOrderMessage(orderSets, customerInfo, lang);
    const result = await submitOrderToEmail(payloadSnapshot, customerInfo, lang);

    setSubmittedState({
      payload: payloadSnapshot,
      customerSnapshot: { ...customerInfo },
      emailMode: result.mode,
    });
    setIsSubmitting(false);
    setHandoffChannel(null);
    window.setTimeout(scrollToSectionTop, 50);
  };

  const handleChannelHandoff = async (channel: 'messenger' | 'zalo', payload: BuiltOrderPayload) => {
    await copyTextReliably(payload.message);
    setJustCopied(true);
    setHandoffChannel(channel);
    window.setTimeout(() => setJustCopied(false), 3000);

    const encoded = encodeURIComponent(payload.deepLinkMessage);
    const url =
      channel === 'zalo'
        ? `https://zalo.me/${CONTACT_CONFIG.zaloPhone}?text=${encoded}`
        : `https://m.me/${CONTACT_CONFIG.messengerUsername}?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPayload = async (payload: BuiltOrderPayload) => {
    const ok = await copyTextReliably(payload.message);
    if (ok) {
      setJustCopied(true);
      window.setTimeout(() => setJustCopied(false), 2500);
    }
  };

  const handleStartNewOrder = () => {
    setSubmittedState(null);
    setHandoffChannel(null);
    setStep1Error(null);
    setCustomerError(null);
    setShowMessagePreview(false);
    onResetOrder();
    window.setTimeout(scrollToSectionTop, 40);
  };

  const summarizeSetEngraving = (set: OrderSet): string => {
    if (set.woodBase === 'tron') return isVi ? 'Đế trơn' : 'Plain';
    if (set.engravingLater) return isVi ? 'Gửi chữ sau' : 'Text via chat';
    const font = getFontById(set.fontId);
    const formatted = formatEngravingForWorkshop(set.engravingText, font);
    if (!formatted) return isVi ? 'Chưa nhập chữ' : 'Missing text';
    return `[${font.code}] “${formatted}”`;
  };

  const renderInlineWoodPreview = () => (
    <div className="rounded-xl border border-[#DFD6C3] bg-white p-3.5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold uppercase tracking-wider text-[#0B5268]">
          {isVi ? 'Mô phỏng mặt trước đế gỗ khắc' : 'Front-Face Wood Engraving Preview'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[#645D4E]">
            [{activeFont.code}] <strong className="text-[#2B2823]">{activeFont.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setSampleModalIndex(0);
              setShowSampleModal(true);
            }}
            className="font-semibold text-[#0B5268] underline underline-offset-2 hover:text-[#083E50] cursor-pointer"
          >
            {isVi ? 'Xem ảnh thật' : 'Real photo'}
          </button>
        </div>
      </div>

      <div className="mt-2.5 rounded-lg border border-[#E5DEC9] bg-[#ECE6D8] px-3 py-4">
        <div className="mx-auto max-w-[330px]">
          <div className="relative h-2.5 rounded-t-[2px] bg-gradient-to-b from-[#E5CAA3] to-[#CFA97A]">
            <div className="absolute inset-x-4 top-[3px] h-[3px] rounded-full bg-[#684726]/75" />
          </div>
          <div className="wood-grain-surface flex min-h-[54px] items-center justify-center rounded-b-[3px] border-t border-[#9B7246]/35 px-3 py-2.5 shadow-[0_6px_14px_-6px_rgba(42,22,8,0.35)]">
            <p
              className={`laser-etched-text text-center text-lg leading-snug break-words sm:text-xl ${
                activeSet.engravingLater ? '' : activeFont.cssClass
              } ${formattedWorkshopPreview ? 'opacity-95' : 'opacity-45'}`}
              style={{
                fontFamily: activeSet.engravingLater ? undefined : activeFont.fontFamily,
              }}
            >
              {formattedWorkshopPreview || activeFont.sampleText}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-[#645D4E]">
        {isVi
          ? 'Khắc laser trực tiếp trên mặt trước thanh đế gỗ · tối đa 40 ký tự'
          : 'Laser etched directly onto the front face of the slim beechwood base · max 40 chars'}
      </p>
    </div>
  );

  // Hành động phụ ở cuối Bước 1: luồng tự nhiên dẫn khách hoàn thiện từng bộ
  const secondaryActionLabel = (() => {
    if (orderSets.length === 1) {
      return isVi ? 'Thêm bộ thứ 2' : 'Add set #2';
    }
    if (safeActiveIndex < orderSets.length - 1) {
      return isVi
        ? `Chỉnh Bộ #${safeActiveIndex + 2} →`
        : `Edit Set #${safeActiveIndex + 2} →`;
    }
    if (orderSets.length < 20) {
      return isVi ? 'Thêm 1 bộ nữa' : 'Add another set';
    }
    return isVi ? 'Xem lại Bộ #1' : 'Review Set #1';
  })();

  const handleSecondaryStep1Action = () => {
    if (orderSets.length === 1) {
      onAddOneAndSelect();
      return;
    }
    if (safeActiveIndex < orderSets.length - 1) {
      onSelectSetIndex(safeActiveIndex + 1);
      setStep1Error(null);
      return;
    }
    if (orderSets.length < 20) {
      onAddOneAndSelect();
      return;
    }
    onSelectSetIndex(0);
    setStep1Error(null);
  };

  return (
    <section
      id="dat-hang"
      className="relative flex-1 min-h-full overflow-hidden bg-[#0B5268] py-4 sm:py-5"
    >
      {/* Nền hoa văn Trống Đồng trích từ PDF làm khung cho khu vực Đặt sản phẩm */}
      <img
        src="images/brand/pattern-drum-teal.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.30]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,82,104,0.28)_0%,rgba(8,62,80,0.68)_100%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        {/* Header khu vực đặt sản phẩm + Thanh bước chỉnh chu */}
        <div className="flex flex-col justify-between gap-3.5 pb-3.5 lg:flex-row lg:items-end">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8D59E]">
              {isVi
                ? `Đặt sản phẩm • Khách lẻ • ${CONTACT_CONFIG.collectionCode}`
                : `Retail Atelier • ${CONTACT_CONFIG.collectionCode}`}
            </span>
            <h2 className="font-display mt-1 text-2xl font-semibold text-[#FAF8F3] sm:text-3xl">
              {isVi
                ? 'Chọn Số Lượng, Mẫu & Khắc Đế'
                : 'Select Quantity, Design & Engrave'}
            </h2>
            <p className="mt-1 text-xs text-[#D1D3D4]/85">
              {isVi ? (
                <>
                  Khách doanh nghiệp đặt số lượng lớn?{' '}
                  <button
                    type="button"
                    onClick={onContactCorporate}
                    className="font-semibold text-[#E8D59E] underline underline-offset-2 transition-colors hover:text-white cursor-pointer"
                  >
                    Liên hệ báo giá riêng →
                  </button>
                </>
              ) : (
                <>
                  Corporate bulk orders?{' '}
                  <button
                    type="button"
                    onClick={onContactCorporate}
                    className="font-semibold text-[#E8D59E] underline underline-offset-2 transition-colors hover:text-white cursor-pointer"
                  >
                    Request a custom quote →
                  </button>
                </>
              )}
            </p>
          </div>

          <div
            className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-[#E8D59E]/30 bg-[#083E50]/85 p-1 shadow-xs backdrop-blur-xs sm:flex-nowrap sm:gap-1.5 sm:rounded-full"
            role="tablist"
            aria-label={isVi ? 'Tiến trình đặt hàng 2 bước' : '2-step checkout'}
          >
            <button
              type="button"
              role="tab"
              aria-selected={step === 1}
              onClick={handleBackToStep1}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer sm:px-4 sm:py-2 sm:text-[13px] ${
                step === 1
                  ? 'bg-[#FAF8F3] text-[#0B5268] shadow-xs'
                  : 'text-[#E8E5DB]/85 hover:text-white'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  step === 1
                    ? 'bg-[#0B5268] text-[#FAF8F3]'
                    : 'bg-white/15 text-[#E8D59E]'
                }`}
              >
                1
              </span>
              <span>{isVi ? 'Chọn & Tùy biến' : 'Customize Sets'}</span>
            </button>

            <span aria-hidden="true" className="hidden h-px w-4 shrink-0 bg-[#E8D59E]/35 sm:inline-block" />

            <button
              type="button"
              role="tab"
              aria-selected={step === 2}
              onClick={() => {
                if (step === 2) return;
                handleGoToStep2();
              }}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer sm:px-4 sm:py-2 sm:text-[13px] ${
                step === 2
                  ? 'bg-[#FAF8F3] text-[#0B5268] shadow-xs'
                  : 'text-[#E8E5DB]/85 hover:text-white'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  step === 2
                    ? 'bg-[#0B5268] text-[#FAF8F3]'
                    : 'bg-white/15 text-[#E8D59E]'
                }`}
              >
                2
              </span>
              <span>
                {isVi ? 'Thông tin & Xác nhận' : 'Confirm Order'} ({orderSets.length})
              </span>
            </button>
          </div>
        </div>

        {/* KHUNG ATELIER NỀN NGÀ ẤM */}
        <div className="rounded-2xl border border-[#C4942E]/30 bg-[#FAF8F3] p-4 shadow-[0_24px_60px_-20px_rgba(4,28,38,0.45)] sm:p-6 lg:p-7">
          <div ref={stepContentRef}>
          {step === 1 ? (
            /* ============================================================
               BƯỚC 1: THANH CHỌN SỐ LƯỢNG TINH GỌN -> TÙY BIẾN TỪNG BỘ 6/6
               ============================================================ */
            <div>
              {/* 01 · THANH CHỌN SỐ LƯỢNG LIỀN MẠCH KHÔNG KHUNG LỒNG KHUNG */}
              <div className="mb-5 border-b border-[#E5DEC9] pb-4">
                <div className="flex flex-col justify-between gap-3.5 lg:flex-row lg:items-center">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[10px] font-bold text-[#FAF8F3]">
                      01
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.13em] text-[#0B5268]">
                      {isVi ? 'Số lượng bộ' : 'Number of Sets'}
                    </span>
                    <span className="rounded-full bg-[#EFECE3] px-2.5 py-0.5 text-[11px] font-medium text-[#645D4E]">
                      {isVi
                        ? '1–20 bộ · Tùy chọn mẫu & khắc riêng từng bộ'
                        : '1–20 sets · Customize design & engraving per set'}
                    </span>
                  </div>

                  {/* Bộ chọn số lượng hợp nhất: Nhóm mức nhanh + Stepper */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div
                      className="inline-flex items-center gap-0.5 rounded-xl border border-[#DFD6C3] bg-[#EFECE3] p-1"
                      role="group"
                      aria-label={isVi ? 'Chọn nhanh số lượng bộ' : 'Quick set quantity presets'}
                    >
                      {[1, 2, 3, 5].map((preset) => {
                        const active = orderSets.length === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => onSetTotalQuantity(preset)}
                            className={`h-8 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold transition-all cursor-pointer sm:px-3 ${
                              active
                                ? 'bg-[#0B5268] text-[#FAF8F3] shadow-xs'
                                : 'bg-transparent text-[#4A453B] hover:bg-white/80 hover:text-[#0B5268]'
                            }`}
                          >
                            {preset} {isVi ? 'bộ' : preset === 1 ? 'set' : 'sets'}
                          </button>
                        );
                      })}
                    </div>

                    <div className="inline-flex h-10 items-center rounded-xl border border-[#D8CEBC] bg-white px-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => onSetTotalQuantity(orderSets.length - 1)}
                        disabled={orderSets.length <= 1}
                        aria-label={isVi ? 'Giảm số lượng bộ' : 'Decrease set count'}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#0B5268] transition-colors hover:bg-[#FAF8F3] disabled:opacity-35 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={orderSets.length}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!Number.isNaN(v)) onSetTotalQuantity(v);
                        }}
                        aria-label={isVi ? 'Tổng số lượng bộ' : 'Total set count'}
                        className="w-9 bg-transparent text-center text-sm font-bold tabular-nums text-[#0B5268] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => onSetTotalQuantity(orderSets.length + 1)}
                        disabled={orderSets.length >= 20}
                        aria-label={isVi ? 'Tăng số lượng bộ' : 'Increase set count'}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#0B5268] transition-colors hover:bg-[#FAF8F3] disabled:opacity-35 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* THANH CHUYỂN TỪNG BỘ ĐỘC LẬP (HIỆN KHI SỐ LƯỢNG >= 2, PHẲNG MẠCH) */}
                {orderSets.length >= 2 && (
                  <div className="mt-3.5 border-t border-[#EFEAE0] pt-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B2823]">
                        <Layers className="h-3.5 w-3.5 text-[#0B5268]" />
                        <span>
                          {isVi
                            ? `Chạm từng bộ để tùy biến mẫu & khắc riêng (${orderSets.length} bộ):`
                            : `Select each set to customize (${orderSets.length} sets):`}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={handleSyncAll}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          syncedAllNotice
                            ? 'border-[#15803D]/40 bg-[#ECFDF5] text-[#15803D]'
                            : 'border-[#0B5268]/30 bg-white text-[#0B5268] hover:border-[#0B5268]'
                        }`}
                      >
                        {syncedAllNotice && <Check className="h-3 w-3" />}
                        <span>
                          {syncedAllNotice
                            ? isVi
                              ? `Đã đồng bộ cả ${orderSets.length} bộ`
                              : `Synced to all ${orderSets.length} sets`
                            : isVi
                              ? `Áp dụng Bộ #${safeActiveIndex + 1} cho cả ${orderSets.length} bộ`
                              : `Apply Set #${safeActiveIndex + 1} to all ${orderSets.length}`}
                        </span>
                      </button>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-stretch gap-2">
                      {orderSets.map((set, idx) => {
                        const prod = getProductById(set.productId);
                        const matShort = isVi
                          ? MATERIALS[set.material].shortLabel
                          : MATERIALS[set.material].shortLabelEn;
                        const thumb = getProductImage(prod, set.material, lang);
                        const isActive = idx === safeActiveIndex;
                        const invalid = !isSetEngravingValid(set);
                        const statusText =
                          set.woodBase === 'tron'
                            ? `${matShort} · ${isVi ? 'Đế trơn' : 'Plain'}`
                            : `${matShort} · ${summarizeSetEngraving(set)}`;

                        return (
                          <div
                            key={set.id}
                            className={`relative flex max-w-full items-center overflow-hidden rounded-xl border bg-white pr-7 transition-all ${
                              isActive
                                ? 'border-[#0B5268] ring-2 ring-[#0B5268]/85 shadow-xs'
                                : invalid
                                  ? 'border-[#D97706]/55 hover:border-[#B45309]'
                                  : 'border-[#E2DAC9] hover:border-[#C4942E]'
                            }`}
                          >
                            {isActive && (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[#C4942E]"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onSelectSetIndex(idx);
                                setStep1Error(null);
                              }}
                              className="flex min-w-0 items-center gap-2.5 px-2.5 py-2 text-left cursor-pointer"
                            >
                              <img
                                src={thumb.src}
                                alt={prod.name}
                                className="h-8 w-8 shrink-0 rounded-md object-cover"
                              />
                              <div className="min-w-0 max-w-[180px]">
                                <span className="block truncate text-xs font-semibold text-[#2B2823]">
                                  <span className="text-[#0B5268]">#{idx + 1}</span> · {prod.name}
                                </span>
                                <span
                                  className={`block truncate text-[10px] ${
                                    invalid
                                      ? 'font-semibold text-[#B45309]'
                                      : 'text-[#645D4E]'
                                  }`}
                                >
                                  {statusText}
                                </span>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => onRemoveSet(idx)}
                              title={isVi ? `Bỏ Bộ #${idx + 1}` : `Remove Set #${idx + 1}`}
                              aria-label={isVi ? `Bỏ Bộ #${idx + 1}` : `Remove Set #${idx + 1}`}
                              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-[#7D7665] transition-colors hover:bg-[#FEE2E2] hover:text-[#B91C1C] cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}

                      {orderSets.length < 20 && (
                        <button
                          type="button"
                          onClick={onAddOneAndSelect}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#0B5268]/40 bg-transparent px-3 py-2 text-xs font-semibold text-[#0B5268] transition-colors hover:border-[#0B5268] hover:bg-white cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{isVi ? 'Thêm bộ' : 'Add set'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* STUDIO 6/6 TÙY BIẾN CHI TIẾT CHO BỘ ĐANG CHỌN (activeSet) */}
              <div className="mt-5 grid items-start gap-5 lg:grid-cols-12 lg:gap-7">
                {/* CỘT TRÁI: 02 · CHỌN MẪU THIẾT KẾ */}
                <div className="min-w-0 space-y-4 lg:col-span-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[10px] font-bold text-[#FAF8F3]">
                        02
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.13em] text-[#0B5268]">
                        {isVi ? 'Chọn mẫu thiết kế' : 'Select Design'}
                      </span>
                      {orderSets.length >= 2 && (
                        <span className="rounded-full bg-[#0B5268] px-2.5 py-0.5 text-[11px] font-semibold text-[#FAF8F3]">
                          {isVi
                            ? `Bộ #${safeActiveIndex + 1}/${orderSets.length}`
                            : `Set #${safeActiveIndex + 1}/${orderSets.length}`}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#645D4E]">
                      <strong className="text-[#2B2823]">{activeProduct.name}</strong> —{' '}
                      {isVi ? activeProduct.motif : activeProduct.motifEn}
                    </span>
                  </div>

                  {/* Khung trưng bày mẫu chính */}
                  <div className="overflow-hidden rounded-xl border border-[#E2DAC9] bg-white shadow-xs">
                    <div className="relative aspect-[16/10] max-h-[340px] w-full overflow-hidden bg-[#EDE8DC]">
                      <img
                        src={activeImage.src}
                        alt={activeProduct.name}
                        className="h-full w-full object-cover"
                      />
                      {!activeImage.isExactMaterial && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#0B5268]/85 px-3 py-1 text-[10px] font-medium text-[#FAF8F3] backdrop-blur-xs">
                          {isVi
                            ? `Ảnh tham khảo (${activeImage.actualMaterialLabel})`
                            : `Reference photo (${activeImage.actualMaterialLabel})`}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setZoomedProduct(activeProduct)}
                        title={isVi ? 'Phóng to ảnh' : 'Zoom photo'}
                        aria-label={isVi ? `Phóng to ${activeProduct.name}` : `Zoom ${activeProduct.name}`}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B5268]/85 text-white transition-colors hover:bg-[#083E50] cursor-pointer"
                      >
                        <Expand className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Thanh tên mẫu & đơn giá của Bộ đang chọn */}
                    <div className="flex items-center justify-between gap-2.5 border-t border-[#E6DFD0] px-3.5 py-3 sm:px-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="shrink-0 whitespace-nowrap rounded-md bg-[#0B5268]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0B5268]">
                            {getFullSetSku(activeSet)}
                          </span>
                          <span className="truncate text-[11px] text-[#7D7665]">
                            {isVi ? activeProduct.motif : activeProduct.motifEn}
                          </span>
                        </div>
                        <h3 className="font-display mt-0.5 truncate text-xl font-semibold text-[#2B2823] sm:text-2xl">
                          {activeProduct.name}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-lg font-bold tracking-tight tabular-nums text-[#0B5268] sm:text-xl">
                          {formatVND(getSetPrice(activeSet))}
                        </span>
                        <span className="block text-[10px] text-[#7D7665]">
                          / {isVi ? 'bộ (dự kiến)' : 'set (est.)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lưới 11 mẫu thu gọn ngay dưới ảnh chính */}
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {PRODUCTS.map((item) => {
                      const active = item.id === activeSet.productId;
                      const thumb = getProductImage(item, activeSet.material, lang);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onUpdateActiveSet({ productId: item.id })}
                          className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                            active
                              ? 'border-[#0B5268] bg-white ring-2 ring-[#0B5268]/85 shadow-xs'
                              : 'border-[#E2DAC9] bg-white hover:border-[#C4942E]/75'
                          }`}
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-[#EDE8DC]">
                            <img
                              src={thumb.src}
                              alt={item.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                            {active && (
                              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0B5268] text-[#FAF8F3] shadow-xs">
                                <Check className="h-2.5 w-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 px-1.5 py-1.5 text-center">
                            <span
                              className={`block truncate text-[11px] ${
                                active ? 'font-semibold text-[#0B5268]' : 'font-medium text-[#2B2823]'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CỘT PHẢI: 03 · CHẤT LIỆU -> 04 · ĐẾ GỖ & KHẮC RIÊNG CHO BỘ NÀY -> TỔNG KẾT */}
                <div className="min-w-0 space-y-5 lg:col-span-6">
                  {/* 03 · CHẤT LIỆU */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[10px] font-bold text-[#FAF8F3]">
                          03
                        </span>
                        <span className="text-xs font-bold uppercase tracking-[0.13em] text-[#0B5268]">
                          {isVi ? 'Chọn chất liệu' : 'Select Finish'}
                        </span>
                      </div>
                      {orderSets.length >= 2 && (
                        <span className="text-xs font-medium text-[#645D4E]">
                          {isVi
                            ? `Cho Bộ #${safeActiveIndex + 1} · ${activeProduct.name}`
                            : `For Set #${safeActiveIndex + 1} · ${activeProduct.name}`}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {(['dong', 'ma-vang'] as MaterialId[]).map((matId) => {
                        const mat = MATERIALS[matId];
                        const active = activeSet.material === matId;
                        return (
                          <button
                            key={matId}
                            type="button"
                            onClick={() => onUpdateActiveSet({ material: matId })}
                            className={`flex h-full flex-col justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                              active
                                ? 'border-[#0B5268] bg-[#0B5268]/[0.03] ring-2 ring-[#0B5268]/85 shadow-2xs'
                                : 'border-[#E2DAC9] bg-white hover:border-[#C4942E]/75'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span
                                    className={`h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br ${mat.swatchClass} ring-1 ring-black/15`}
                                  />
                                  <span className="whitespace-nowrap text-[13.5px] font-semibold text-[#2B2823]">
                                    {isVi ? mat.label : mat.labelEn}
                                  </span>
                                </div>
                                {active && (
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[#FAF8F3]">
                                    <Check className="h-2.5 w-2.5" />
                                  </span>
                                )}
                              </div>
                              <p className="mt-1.5 text-[11px] leading-snug text-[#645D4E]">
                                {isVi ? mat.subtitle : mat.subtitleEn}
                              </p>
                            </div>

                            <div className="mt-2.5 flex items-baseline justify-between gap-2 border-t border-[#EFEAE0] pt-2">
                              <span className="text-[15px] font-bold tabular-nums text-[#0B5268]">
                                {formatVND(mat.unitPrice)}
                              </span>
                              <span className="whitespace-nowrap text-[10px] text-[#7D7665]">
                                / {isVi ? 'bộ (dự kiến)' : 'set (est.)'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 04 · CHỌN ĐẾ GỖ TRƯNG BÀY & KHẮC TÙY CHỈNH */}
                  <div className="border-t border-[#E6DFD0] pt-5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[10px] font-bold text-[#FAF8F3]">
                        04
                      </span>
                      <span className="text-xs font-bold uppercase tracking-[0.13em] text-[#0B5268]">
                        {isVi ? 'Chọn đế gỗ trưng bày' : 'Wood Display Base'}
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {(['tron', 'khac'] as WoodBaseId[]).map((baseId) => {
                        const base = WOOD_BASES[baseId];
                        const active = activeSet.woodBase === baseId;
                        return (
                          <button
                            key={baseId}
                            type="button"
                            onClick={() => {
                              onUpdateActiveSet({ woodBase: baseId });
                              setStep1Error(null);
                            }}
                            className={`flex h-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                              active
                                ? 'border-[#0B5268] bg-[#0B5268]/[0.03] ring-2 ring-[#0B5268]/85 shadow-2xs'
                                : 'border-[#E2DAC9] bg-white hover:border-[#C4942E]/75'
                            }`}
                          >
                            {baseId === 'tron' ? (
                              <div
                                aria-hidden="true"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E2DAC9] bg-[#ECE6D8] p-1"
                              >
                                <div className="w-full">
                                  <div className="h-1 bg-gradient-to-b from-[#E5CAA3] to-[#CFA97A]" />
                                  <div className="wood-grain-surface h-3 w-full rounded-b-[2px] border-t border-[#9B7246]/35 shadow-2xs" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src="images/bases/base-sample-1.jpg"
                                alt={isVi ? 'Đế gỗ khắc laser thực tế' : 'Engraved wood base'}
                                className="h-11 w-11 shrink-0 rounded-lg border border-[#C4942E]/40 object-cover"
                              />
                            )}

                            <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="whitespace-nowrap text-[13px] font-semibold leading-tight text-[#2B2823]">
                                    {isVi ? base.label : base.labelEn}
                                  </span>
                                  {active && (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[#FAF8F3]">
                                      <Check className="h-2.5 w-2.5" />
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[11px] leading-snug text-[#645D4E]">
                                  {baseId === 'tron'
                                    ? isVi
                                      ? 'Đế gỗ tự nhiên thanh mảnh nguyên bản'
                                      : 'Slim natural beechwood base, standard'
                                    : isVi
                                      ? 'Khắc tên riêng, lời chúc mặt trước đế gỗ'
                                      : 'Laser engraving on front face of base'}
                                </p>
                              </div>

                              <div className="mt-2 flex items-center justify-between pt-0.5">
                                <span
                                  className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                                    base.extraPrice === 0
                                      ? 'bg-[#EFECE3] text-[#4A453B]'
                                      : 'bg-[#0B5268]/10 text-[#0B5268]'
                                  }`}
                                >
                                  {base.extraPrice === 0
                                    ? isVi
                                      ? 'Miễn phí'
                                      : 'Free'
                                    : `+${formatVND(base.extraPrice)}`}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* STUDIO KHẮC LASER CHO BỘ ĐANG CHỌN */}
                    {activeSet.woodBase === 'khac' && (
                      <div className="mt-4 space-y-4 rounded-xl border border-[#E2DAC9] bg-[#F3EFE6]/80 p-4">
                        {renderInlineWoodPreview()}

                        {!activeSet.engravingLater ? (
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <label
                                htmlFor="engraving-text-input"
                                className="text-xs font-semibold text-[#2B2823]"
                              >
                                {orderSets.length >= 2
                                  ? isVi
                                    ? `Nội dung khắc cho Bộ #${safeActiveIndex + 1}`
                                    : `Engraving text for Set #${safeActiveIndex + 1}`
                                  : isVi
                                    ? 'Nội dung khắc lên đế gỗ'
                                    : 'Custom engraving text'}
                              </label>
                              <span className="text-[11px] text-[#7D7665]">
                                {activeSet.engravingText.length}/40
                              </span>
                            </div>

                            <div className="mt-1.5 flex gap-2">
                              <input
                                ref={engravingInputRef}
                                id="engraving-text-input"
                                type="text"
                                maxLength={40}
                                value={activeSet.engravingText}
                                onChange={(e) => {
                                  onUpdateActiveSet({ engravingText: e.target.value });
                                  if (e.target.value.trim()) setStep1Error(null);
                                }}
                                placeholder={`${isVi ? 'Ví dụ:' : 'e.g.'} ${activeFont.sampleText}`}
                                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#2B2823] placeholder:text-[#9A9387] focus:outline-none focus:ring-1 ${
                                  step1Error
                                    ? 'border-[#B91C1C] ring-[#B91C1C]'
                                    : 'border-[#D8CEBC] focus:border-[#0B5268] focus:ring-[#0B5268]'
                                }`}
                              />
                              {activeSet.engravingText && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateActiveSet({ engravingText: '' })}
                                  className="rounded-xl border border-[#D8CEBC] bg-white px-3.5 text-xs font-medium text-[#645D4E] hover:bg-[#FAF8F3] cursor-pointer"
                                >
                                  {isVi ? 'Xóa' : 'Clear'}
                                </button>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-[#7D7665]">
                                  {isVi ? 'Gợi ý:' : 'Samples:'}
                                </span>
                                {ENGRAVING_SUGGESTIONS.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      onUpdateActiveSet({ engravingText: s });
                                      setStep1Error(null);
                                    }}
                                    className="rounded-full border border-[#DFD8CA] bg-white px-2.5 py-0.5 text-[11px] text-[#645D4E] transition-colors hover:border-[#0B5268] hover:text-[#0B5268] cursor-pointer"
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateActiveSet({ engravingLater: true });
                                  setStep1Error(null);
                                }}
                                className="text-[11px] font-medium text-[#0B5268] hover:underline cursor-pointer"
                              >
                                {isVi ? 'Gửi chữ sau qua chat →' : 'Send text later →'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#C4942E]/40 bg-[#FBF7EC] p-3.5 text-xs text-[#6E4E12]">
                            <span>
                              {isVi
                                ? `Bộ #${safeActiveIndex + 1} sẽ bổ sung nội dung khắc qua Messenger / Zalo sau khi đặt.`
                                : `Set #${safeActiveIndex + 1} engraving text will be sent via Messenger / Zalo.`}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateActiveSet({ engravingLater: false })}
                              className="font-semibold text-[#0B5268] hover:underline cursor-pointer"
                            >
                              {isVi ? 'Nhập chữ ngay' : 'Type text now'}
                            </button>
                          </div>
                        )}

                        {step1Error && (
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#B91C1C]/30 bg-[#FEF2F2] px-3.5 py-2.5 text-xs text-[#991B1B]">
                            <span className="flex items-center gap-1.5">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>{step1Error}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateActiveSet({ engravingLater: true });
                                setStep1Error(null);
                              }}
                              className="font-semibold text-[#0B5268] hover:underline cursor-pointer"
                            >
                              {isVi ? 'Gửi sau qua chat' : 'Send later'}
                            </button>
                          </div>
                        )}

                        {/* Bộ chọn Font gọn 3 nhóm không cuộn */}
                        {!activeSet.engravingLater && (
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2B2823]">
                                <Type className="h-3.5 w-3.5 text-[#0B5268]" />
                                <span>{isVi ? 'Chọn Font chữ' : 'Select Font'}</span>
                              </span>

                              <div className="flex flex-wrap gap-1">
                                {FONT_CATEGORIES.map((cat) => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFontCategory(cat.id)}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                                      fontCategory === cat.id
                                        ? 'bg-[#0B5268] text-[#FAF8F3]'
                                        : 'border border-[#D8CEBC] bg-white text-[#645D4E] hover:text-[#2B2823]'
                                    }`}
                                  >
                                    {isVi ? cat.label : cat.labelEn}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {visibleFonts.map((font) => {
                                const active = font.id === activeSet.fontId;
                                const preview =
                                  formatEngravingForWorkshop(rawPreviewText, font) ||
                                  font.sampleText;
                                return (
                                  <button
                                    key={font.id}
                                    type="button"
                                    onClick={() => onUpdateActiveSet({ fontId: font.id })}
                                    className={`flex min-w-0 flex-col justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                                      active
                                        ? 'border-[#0B5268] bg-white ring-2 ring-[#0B5268]/85 shadow-xs'
                                        : 'border-[#E2DAC9] bg-white hover:border-[#C4942E]/75'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="truncate text-[10px] text-[#645D4E]">
                                        <strong className="font-mono font-semibold text-[#0B5268]">
                                          [{font.code}]
                                        </strong>{' '}
                                        <strong className="text-[#2B2823]">{font.name}</strong>
                                      </span>
                                      {active && (
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0B5268] text-[#FAF8F3]">
                                          <Check className="h-2.5 w-2.5" />
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`mt-1 truncate text-base text-[#2B2823] ${font.cssClass}`}
                                      style={{ fontFamily: font.fontFamily }}
                                    >
                                      {preview}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* THANH TỔNG KẾT BƯỚC 1: KHUNG WARM CARD THẲNG MÉP */}
                  <div className="rounded-xl border border-[#E2DAC9] bg-[#F3EFE6]/90 p-3.5 sm:p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-[#645D4E] sm:text-sm">
                        {isVi
                          ? `Tổng tạm tính (${orderSets.length} bộ · giá dự kiến)`
                          : `Estimated total (${orderSets.length} ${
                              orderSets.length === 1 ? 'set' : 'sets'
                            })`}
                      </span>
                      <span className="text-2xl font-bold tracking-tight tabular-nums text-[#0B5268]">
                        {formatVND(builtOrder.totalPrice)}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                      <button
                        type="button"
                        onClick={handleSecondaryStep1Action}
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#0B5268]/35 bg-white px-4 text-sm font-medium text-[#0B5268] transition-colors hover:border-[#0B5268] hover:bg-[#0B5268]/[0.04] sm:col-span-5 cursor-pointer"
                      >
                        {(orderSets.length === 1 || safeActiveIndex >= orderSets.length - 1) &&
                          orderSets.length < 20 && <Plus className="h-4 w-4 shrink-0" />}
                        <span>{secondaryActionLabel}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGoToStep2}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0B5268] px-5 text-sm font-semibold text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#083E50] sm:col-span-7 cursor-pointer"
                      >
                        <span>
                          {isVi
                            ? orderSets.length > 1
                              ? `Tiếp tục xác nhận (${orderSets.length} bộ)`
                              : 'Tiếp tục xác nhận đơn'
                            : orderSets.length > 1
                              ? `Continue Checkout (${orderSets.length} sets)`
                              : 'Continue to Confirm'}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#E8D59E]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : submittedState === null ? (
            /* ============================================================
               BƯỚC 2A: FORM NHẬP THÔNG TIN KHÁCH HÀNG & PHIẾU TÓM TẮT TỪNG BỘ
               ============================================================ */
            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
              <form onSubmit={handleConfirmOrder} className="min-w-0 space-y-5 lg:col-span-6">
                <div>
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5268] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>
                      {isVi ? 'Quay lại chỉnh số lượng / mẫu' : 'Back to set customization'}
                    </span>
                  </button>

                  <h3 className="font-display mt-3 text-2xl font-semibold text-[#2B2823] sm:text-3xl">
                    {isVi ? 'Thông tin nhận hàng' : 'Customer Information'}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#645D4E] sm:text-sm">
                    {isVi
                      ? `Khi bấm xác nhận, đơn hàng sẽ được gửi tự động về ${CONTACT_CONFIG.email} và mở tùy chọn gửi nhanh qua Messenger / Zalo.`
                      : `Upon confirmation, order details are sent automatically to ${CONTACT_CONFIG.email} with direct Messenger / Zalo handoff.`}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="customer-name"
                      className="block text-xs font-semibold text-[#2B2823]"
                    >
                      {isVi ? 'Họ và tên *' : 'Full name *'}
                    </label>
                    <input
                      ref={nameInputRef}
                      id="customer-name"
                      type="text"
                      value={customerInfo.fullName}
                      onChange={(e) => {
                        onUpdateCustomer({ fullName: e.target.value });
                        setCustomerError(null);
                      }}
                      placeholder={isVi ? 'Ví dụ: Nguyễn Minh Anh' : 'e.g. Nguyen Minh Anh'}
                      className="mt-1.5 w-full rounded-xl border border-[#D8CEBC] bg-white px-4 py-3 text-sm text-[#2B2823] placeholder:text-[#9A9387] focus:border-[#0B5268] focus:outline-none focus:ring-1 focus:ring-[#0B5268]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customer-phone"
                      className="block text-xs font-semibold text-[#2B2823]"
                    >
                      {isVi ? 'Số điện thoại *' : 'Phone number *'}
                    </label>
                    <input
                      ref={phoneInputRef}
                      id="customer-phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => {
                        onUpdateCustomer({ phone: e.target.value });
                        setCustomerError(null);
                      }}
                      placeholder={isVi ? 'Ví dụ: 0912 345 678' : 'e.g. 0912 345 678'}
                      className="mt-1.5 w-full rounded-xl border border-[#D8CEBC] bg-white px-4 py-3 text-sm text-[#2B2823] placeholder:text-[#9A9387] focus:border-[#0B5268] focus:outline-none focus:ring-1 focus:ring-[#0B5268]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="customer-email"
                    className="block text-xs font-semibold text-[#2B2823]"
                  >
                    {isVi ? 'Email (tùy chọn)' : 'Email (optional)'}
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => onUpdateCustomer({ email: e.target.value })}
                    placeholder="name@example.com"
                    className="mt-1.5 w-full rounded-xl border border-[#D8CEBC] bg-white px-4 py-3 text-sm text-[#2B2823] placeholder:text-[#9A9387] focus:border-[#0B5268] focus:outline-none focus:ring-1 focus:ring-[#0B5268]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-address"
                    className="block text-xs font-semibold text-[#2B2823]"
                  >
                    {isVi ? 'Địa chỉ nhận hàng' : 'Delivery address'}
                  </label>
                  <input
                    id="customer-address"
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => onUpdateCustomer({ address: e.target.value })}
                    placeholder={
                      isVi
                        ? 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP'
                        : 'Street, ward, district, city'
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#D8CEBC] bg-white px-4 py-3 text-sm text-[#2B2823] placeholder:text-[#9A9387] focus:border-[#0B5268] focus:outline-none focus:ring-1 focus:ring-[#0B5268]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-note"
                    className="block text-xs font-semibold text-[#2B2823]"
                  >
                    {isVi ? 'Ghi chú cho xưởng (tùy chọn)' : 'Order note (optional)'}
                  </label>
                  <textarea
                    id="customer-note"
                    rows={2}
                    value={customerInfo.note}
                    onChange={(e) => onUpdateCustomer({ note: e.target.value })}
                    placeholder={
                      isVi
                        ? 'Ví dụ: Thời gian nhận mong muốn hoặc lời nhắn gói quà'
                        : 'e.g. Desired delivery date or gift-wrapping request'
                    }
                    className="mt-1.5 w-full rounded-xl border border-[#D8CEBC] bg-white px-4 py-2.5 text-sm text-[#2B2823] placeholder:text-[#9A9387] focus:border-[#0B5268] focus:outline-none focus:ring-1 focus:ring-[#0B5268]"
                  />
                </div>

                {customerError && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#B91C1C]/30 bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{customerError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B5268] px-6 py-3.5 text-sm font-semibold text-[#FAF8F3] transition-colors hover:bg-[#083E50] disabled:opacity-65 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#E8D59E]" />
                      <span>
                        {isVi ? 'Đang gửi thông tin đơn...' : 'Submitting order...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-[#E8D59E]" />
                      <span>
                        {isVi
                          ? 'Xác nhận đặt hàng & Gửi thông tin'
                          : 'Confirm Order & Send Details'}
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* CỘT PHẢI: TÓM TẮT CHI TIẾT TỪNG BỘ */}
              <div className="min-w-0 rounded-xl border border-[#E2DAC9] bg-[#F3EFE6]/75 p-4 sm:p-6 lg:col-span-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DAC9] pb-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#645D4E]">
                      {isVi ? 'Tóm tắt đơn hàng' : 'Order Summary'}
                    </span>
                    <h4 className="font-display text-2xl font-semibold text-[#2B2823]">
                      {builtOrder.totalQty} {isVi ? 'bộ sản phẩm' : 'sets'}
                    </h4>
                  </div>
                  <span className="rounded-full border border-[#C4942E]/45 bg-white px-3 py-1 font-mono text-xs font-semibold text-[#0B5268]">
                    {builtOrder.orderRef}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {orderSets.map((set, idx) => {
                    const prod = getProductById(set.productId);
                    const mat = MATERIALS[set.material];
                    const base = WOOD_BASES[set.woodBase];
                    const img = getProductImage(prod, set.material, lang);
                    const engravingDesc = summarizeSetEngraving(set);

                    return (
                      <div
                        key={set.id}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-[#E2DAC9] bg-white p-3.5 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <img
                            src={img.src}
                            alt={prod.name}
                            className="h-14 w-14 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {orderSets.length >= 2 && (
                                <span className="rounded bg-[#0B5268] px-1.5 py-0.5 text-[10px] font-semibold text-[#FAF8F3]">
                                  {isVi ? `Bộ #${idx + 1}` : `Set #${idx + 1}`}
                                </span>
                              )}
                              <span className="rounded bg-[#0B5268]/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0B5268]">
                                {getFullSetSku(set)}
                              </span>
                              <span className="text-sm font-semibold text-[#2B2823]">
                                {prod.name}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#645D4E]">
                              {isVi ? mat.label : mat.labelEn} · {isVi ? base.label : base.labelEn}
                            </p>
                            {set.woodBase === 'khac' && (
                              <p className="mt-0.5 truncate text-xs font-medium text-[#0B5268]">
                                {engravingDesc}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-2.5 sm:justify-end">
                          <span className="min-w-[82px] text-right text-sm font-bold tabular-nums text-[#0B5268]">
                            {formatVND(getSetPrice(set))}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditSetFromStep2(idx)}
                              title={isVi ? 'Sửa bộ này' : 'Edit set'}
                              aria-label={isVi ? `Sửa Bộ #${idx + 1}` : `Edit Set #${idx + 1}`}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2DAC9] text-[#645D4E] hover:border-[#0B5268] hover:text-[#0B5268] cursor-pointer"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            {orderSets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onRemoveSet(idx)}
                                title={isVi ? 'Xóa bộ này' : 'Remove set'}
                                aria-label={isVi ? `Xóa Bộ #${idx + 1}` : `Remove Set #${idx + 1}`}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E2DAC9] text-[#645D4E] hover:border-[#B91C1C] hover:text-[#B91C1C] cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bóc tách chi phí */}
                <div className="mt-5 space-y-2 border-t border-[#E2DAC9] pt-4 text-xs text-[#645D4E]">
                  <div className="flex justify-between">
                    <span>{isVi ? 'Tiền sản phẩm bookmark' : 'Bookmarks subtotal'}</span>
                    <span className="font-medium tabular-nums text-[#2B2823]">
                      {formatVND(builtOrder.totalProductPrice)}
                    </span>
                  </div>
                  {builtOrder.totalEngravingPrice > 0 && (
                    <div className="flex justify-between">
                      <span>{isVi ? 'Phí khắc laser đế gỗ' : 'Laser wood engraving'}</span>
                      <span className="font-medium tabular-nums text-[#2B2823]">
                        +{formatVND(builtOrder.totalEngravingPrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between border-t border-[#E2DAC9] pt-3">
                    <span className="text-sm font-semibold text-[#2B2823]">
                      {isVi ? 'Tổng tạm tính (giá dự kiến)' : 'Estimated Total'}
                    </span>
                    <span className="text-2xl font-bold tracking-tight tabular-nums text-[#0B5268]">
                      {formatVND(builtOrder.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowMessagePreview((p) => !p)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B5268] hover:underline cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      {isVi ? 'Xem trước nội dung phiếu đơn' : 'Preview order sheet'}
                    </span>
                    {showMessagePreview ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {showMessagePreview && (
                  <pre className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-[#DFD8CA] bg-white p-3.5 font-sans text-xs leading-relaxed text-[#2B2823]">
                    {builtOrder.message}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================
               BƯỚC 2B: ĐÃ XÁC NHẬN ĐƠN HÀNG & GỬI MESSENGER / ZALO
               ============================================================ */
            <div className="mx-auto max-w-2xl py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0B5268]/10 text-[#0B5268]">
                <CheckCircle2 className="h-8 w-8 text-[#C4942E]" />
              </div>

              <span className="mt-4 inline-block rounded-full border border-[#C4942E]/45 bg-[#FBF7EC] px-3.5 py-1 font-mono text-xs font-semibold text-[#0B5268]">
                {submittedState.payload.orderRef}
              </span>

              <h3 className="font-display mt-3 text-3xl font-semibold text-[#2B2823]">
                {isVi ? 'Đã Xác Nhận Đơn Hàng' : 'Order Confirmed'}
              </h3>

              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-xs leading-relaxed sm:text-sm ${
                  submittedState.emailMode === 'sent'
                    ? 'border-[#0B5268]/25 bg-[#0B5268]/[0.06] text-[#0B5268]'
                    : 'border-[#C4942E]/45 bg-[#FBF7EC] text-[#6E4E12]'
                }`}
              >
                {submittedState.emailMode === 'sent' ? (
                  <span>
                    {isVi ? (
                      <>
                        Thông tin khách hàng và chi tiết đơn đã được tự động gửi về email{' '}
                        <strong>{CONTACT_CONFIG.email}</strong>.
                      </>
                    ) : (
                      <>
                        Customer &amp; order details have been sent automatically to{' '}
                        <strong>{CONTACT_CONFIG.email}</strong>.
                      </>
                    )}
                  </span>
                ) : (
                  <span>
                    {isVi ? (
                      <>
                        Phiếu đơn <strong>{submittedState.payload.orderRef}</strong> đã được tạo sẵn!
                        Vui lòng bấm gửi qua Messenger/Zalo bên dưới hoặc{' '}
                        <a
                          href={buildMailtoHref(
                            submittedState.payload,
                            submittedState.customerSnapshot
                          )}
                          className="font-semibold text-[#0B5268] underline"
                        >
                          mở ứng dụng Email gửi tới {CONTACT_CONFIG.email}
                        </a>
                        .
                      </>
                    ) : (
                      <>
                        Order <strong>{submittedState.payload.orderRef}</strong> is ready! Please
                        send it via Messenger/Zalo below or{' '}
                        <a
                          href={buildMailtoHref(
                            submittedState.payload,
                            submittedState.customerSnapshot
                          )}
                          className="font-semibold text-[#0B5268] underline"
                        >
                          open your Email app
                        </a>
                        .
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-[#E2DAC9] bg-[#F3EFE6]/75 p-5 text-left">
                <div className="grid gap-3 text-xs sm:grid-cols-2 sm:text-sm">
                  <div>
                    <span className="text-[#7D7665]">{isVi ? 'Khách hàng:' : 'Customer:'}</span>{' '}
                    <strong className="text-[#2B2823]">
                      {submittedState.customerSnapshot.fullName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#7D7665]">{isVi ? 'Điện thoại:' : 'Phone:'}</span>{' '}
                    <strong className="text-[#2B2823]">
                      {submittedState.customerSnapshot.phone}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#7D7665]">{isVi ? 'Số lượng:' : 'Total sets:'}</span>{' '}
                    <strong className="text-[#2B2823]">
                      {submittedState.payload.totalQty} {isVi ? 'bộ' : 'sets'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#7D7665]">{isVi ? 'Tạm tính:' : 'Estimated:'}</span>{' '}
                    <strong className="text-base font-bold tracking-tight tabular-nums text-[#0B5268]">
                      {formatVND(submittedState.payload.totalPrice)}
                    </strong>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-[#E2DAC9] pt-3">
                  <button
                    type="button"
                    onClick={() => setShowMessagePreview((p) => !p)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B5268] hover:underline cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      {showMessagePreview
                        ? isVi
                          ? 'Ẩn chi tiết phiếu đơn'
                          : 'Hide order sheet'
                        : isVi
                          ? 'Xem toàn bộ phiếu đơn'
                          : 'View full order sheet'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPayload(submittedState.payload)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5268] hover:underline cursor-pointer"
                  >
                    {justCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#15803D]" />
                        <span>{isVi ? 'Đã sao chép' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>{isVi ? 'Sao chép phiếu' : 'Copy order'}</span>
                      </>
                    )}
                  </button>
                </div>

                {showMessagePreview && (
                  <pre className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-[#DFD8CA] bg-white p-3.5 font-sans text-xs leading-relaxed text-[#2B2823]">
                    {submittedState.payload.message}
                  </pre>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleChannelHandoff('messenger', submittedState.payload)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B5268] px-6 py-3.5 text-sm font-semibold text-[#FAF8F3] transition-colors hover:bg-[#083E50] cursor-pointer"
                >
                  <Send className="h-4 w-4 text-[#E8D59E]" />
                  <span>{isVi ? 'Gửi đơn qua Messenger' : 'Send via Messenger'}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-75" />
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelHandoff('zalo', submittedState.payload)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C4942E] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B5268] transition-colors hover:bg-[#FBF7EC] cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-[#C4942E]" />
                  <span>{isVi ? 'Liên hệ qua Zalo' : 'Contact via Zalo'}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-[#645D4E]">
                {handoffChannel
                  ? isVi
                    ? `Đã tự động sao chép toàn bộ phiếu đơn ${submittedState.payload.orderRef}. Khi cửa sổ ${handoffChannel === 'messenger' ? 'Messenger' : 'Zalo'} mở ra (hoặc trong đoạn chat bạn đang nhắn sẵn), bạn chỉ cần Dán và Gửi!`
                    : `Full order ${submittedState.payload.orderRef} copied! Simply Paste & Send inside your open chat.`
                  : isVi
                    ? 'Khi bấm Messenger hoặc Zalo, toàn bộ chi tiết đơn hàng cũng được tự sao chép để bạn dán ngay vào đoạn chat đang trao đổi.'
                    : 'Clicking Messenger or Zalo automatically copies the full order so you can paste it right into your active chat.'}
              </p>

              <div className="mt-6 border-t border-[#E6DFD0] pt-5">
                <button
                  type="button"
                  onClick={handleStartNewOrder}
                  className="text-xs font-semibold text-[#0B5268] hover:underline cursor-pointer"
                >
                  {isVi ? '← Tạo đơn hàng mới' : '← Start a new order'}
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal xem 3 ảnh mẫu đế gỗ thực tế */}
      {showSampleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setShowSampleModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label={isVi ? 'Ảnh mẫu đế gỗ khắc thực tế' : 'Real wood engraving samples'}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSampleModal(false)}
              aria-label={isVi ? 'Đóng' : 'Close'}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B5268]/90 text-white hover:bg-[#083E50] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <img
              src={ENGRAVED_BASE_SAMPLES[sampleModalIndex].image}
              alt={
                isVi
                  ? ENGRAVED_BASE_SAMPLES[sampleModalIndex].title
                  : ENGRAVED_BASE_SAMPLES[sampleModalIndex].titleEn
              }
              className="max-h-[60vh] w-full object-cover"
            />

            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-2xl font-semibold text-[#2B2823]">
                  {isVi
                    ? ENGRAVED_BASE_SAMPLES[sampleModalIndex].title
                    : ENGRAVED_BASE_SAMPLES[sampleModalIndex].titleEn}
                </h4>
                <span className="rounded-md bg-[#0B5268]/10 px-2.5 py-1 text-xs font-medium text-[#0B5268]">
                  {ENGRAVED_BASE_SAMPLES[sampleModalIndex].fontTag}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#645D4E]">
                {isVi
                  ? ENGRAVED_BASE_SAMPLES[sampleModalIndex].caption
                  : ENGRAVED_BASE_SAMPLES[sampleModalIndex].captionEn}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {ENGRAVED_BASE_SAMPLES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSampleModalIndex(idx)}
                    className={`overflow-hidden rounded-lg border transition-all cursor-pointer ${
                      sampleModalIndex === idx
                        ? 'border-[#0B5268] ring-2 ring-[#0B5268]'
                        : 'border-[#DFD8CA] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={s.image} alt={s.title} className="aspect-[4/3] w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox phóng to ảnh mẫu bookmark */}
      {zoomedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setZoomedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-label={zoomedProduct.name}
        >
          <div
            className="relative max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedProduct(null)}
              aria-label={isVi ? 'Đóng' : 'Close'}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B5268]/90 text-white hover:bg-[#083E50] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={getProductImage(zoomedProduct, activeSet.material, lang).src}
              alt={zoomedProduct.name}
              className="max-h-[70vh] w-full object-cover"
            />
            <div className="p-5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0B5268]">
                {zoomedProduct.skuCode} • {isVi ? zoomedProduct.motif : zoomedProduct.motifEn}
              </span>
              <h4 className="font-display mt-0.5 text-2xl font-semibold text-[#2B2823]">
                {zoomedProduct.name} ({zoomedProduct.englishTag})
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[#645D4E]">
                {isVi ? zoomedProduct.shortDesc : zoomedProduct.shortDescEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
