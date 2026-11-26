import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
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
import { createPortal } from 'react-dom';
import {
  BANK_TRANSFER_CONFIG,
  buildMailtoHref,
  buildSellerReadyOrderMessage,
  buildVietQrUrl,
  CONTACT_CONFIG,
  copyTextReliably,
  ENGRAVED_BASE_SAMPLES,
  ENGRAVING_FONTS,
  FONT_CATEGORIES,
  formatEngravingForWorkshop,
  formatVND,
  generateEngravingPrintAsset,
  getFontById,
  getFullSetSku,
  getProductById,
  getProductImage,
  getSetPrice,
  getSetPriceInOrder,
  getUniqueEngravingCount,
  isSetEngravingValid,
  MATERIALS,
  PRODUCTS,
  submitOrderToEmail,
  WOOD_BASES,
  type BuiltOrderPayload,
  type CustomerInfo,
  type EngravingPrintAsset,
  type Language,
  type MaterialId,
  type OrderSet,
  type PaymentMethodId,
  type ProductDesign,
  type WoodBaseId,
} from '../data/catalog';
import {
  HoverHighlightGrid,
  ShimmerButton,
  SlidingTabs,
  SpotlightCard,
} from './ui/aceternity';

interface ProductConfiguratorProps {
  lang: Language;
  step: 1 | 2;
  onChangeStep: (step: 1 | 2) => void;
  orderSets: OrderSet[];
  activeSetIndex: number;
  onSelectSetIndex: (index: number) => void;
  onSetTotalQuantity: (qty: number) => void;
  onUpdateActiveSet: (patch: Partial<Omit<OrderSet, 'id'>>) => void;
  onApplyActiveToAll: () => void;
  onRemoveSet: (index: number) => void;
  onEditSetFromStep2: (index: number) => void;
  customerInfo: CustomerInfo;
  onUpdateCustomer: (patch: Partial<CustomerInfo>) => void;
  onResetOrder: () => void;
}

interface SubmittedOrderState {
  payload: BuiltOrderPayload;
  customerSnapshot: CustomerInfo;
  emailMode: 'sent' | 'fallback';
  printAssets: EngravingPrintAsset[];
}

export function ProductConfigurator({
  lang,
  step,
  onChangeStep,
  orderSets,
  activeSetIndex,
  onSelectSetIndex,
  onSetTotalQuantity,
  onUpdateActiveSet,
  onApplyActiveToAll,
  onRemoveSet,
  onEditSetFromStep2,
  customerInfo,
  onUpdateCustomer,
  onResetOrder,
}: ProductConfiguratorProps) {
  const isVi = lang === 'vi';
  const [fontDropdownOpen, setFontDropdownOpen] = useState<boolean>(false);
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

  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const engravingInputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const viewStage = step === 1 ? 'step1' : submittedState === null ? 'step2-form' : 'step2-done';
  const prevStageRef = useRef<string>(viewStage);

  useEffect(() => {
    if (!fontDropdownOpen) return;
    const onPointerDown = (e: globalThis.MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFontDropdownOpen(false);
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fontDropdownOpen]);

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
        prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: prefersReduced ? 0.16 : 0.28,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }, stepContentRef);

    return () => ctx.revert();
  }, [viewStage]);

  const safeActiveIndex = Math.min(activeSetIndex, Math.max(0, orderSets.length - 1));
  const activeSet = orderSets[safeActiveIndex] ?? orderSets[0];
  const activeProduct = getProductById(activeSet.productId);
  const activeFont = getFontById(activeSet.fontId);
  const activeImage = getProductImage(activeProduct, activeSet.material, lang);

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

  const totalEngravedCount = orderSets.filter((s) => s.woodBase === 'khac').length;
  const uniqueEngravingCount = useMemo(() => getUniqueEngravingCount(orderSets), [orderSets]);

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
    const rawAssets = await Promise.all(
      orderSets.map((s, idx) => generateEngravingPrintAsset(s, idx))
    );
    const printAssets = rawAssets.filter((a): a is EngravingPrintAsset => a !== null);
    const result = await submitOrderToEmail(payloadSnapshot, customerInfo, lang, printAssets);

    setSubmittedState({
      payload: payloadSnapshot,
      customerSnapshot: { ...customerInfo },
      emailMode: result.mode,
      printAssets,
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

  const rawLineCount = Math.min(
    3,
    Math.max(1, activeSet.engravingText.replace(/\r\n/g, '\n').split('\n').length)
  );
  const previewLineCount = Math.max(
    rawLineCount,
    (formattedWorkshopPreview || activeFont.sampleText).split('\n').length
  );
  const previewLength = (formattedWorkshopPreview || activeFont.sampleText).length;
  const previewFontSizeClass =
    previewLineCount >= 3
      ? 'text-[11px] leading-snug sm:text-xs'
      : previewLineCount === 2 || previewLength > 24
        ? 'text-xs leading-snug sm:text-sm'
        : 'text-sm leading-snug sm:text-base';

  const renderInlineWoodPreview = () => (
    <div ref={fontDropdownRef} className="relative rounded-xl border border-[#DFD6C3] bg-white p-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => setFontDropdownOpen((o) => !o)}
          aria-expanded={fontDropdownOpen}
          className="inline-flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg border border-[#D8CEBC] bg-[#FAF8F3] px-2.5 py-1.5 text-left transition-colors hover:border-[#0B5268] cursor-pointer"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <Type className="h-3.5 w-3.5 shrink-0 text-[#0B5268]" />
            <span className="shrink-0 rounded bg-[#0B5268]/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0B5268]">
              {activeFont.code}
            </span>
            <span className="truncate text-xs font-semibold text-[#2B2823]">
              {activeFont.name}
            </span>
          </div>
          {fontDropdownOpen ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[#0B5268]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#0B5268]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setSampleModalIndex(0);
            setShowSampleModal(true);
          }}
          className="shrink-0 text-[11px] font-semibold text-[#0B5268] underline underline-offset-2 hover:text-[#083E50] cursor-pointer"
        >
          {isVi ? 'Xem các mẫu khắc laser' : 'Laser engraving samples'}
        </button>
      </div>

      <AnimatePresence>
        {fontDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.14 }}
            className="absolute left-2.5 right-2.5 top-12 z-30 max-h-56 overflow-y-auto rounded-xl border border-[#C4942E]/45 bg-white p-1.5 shadow-xl"
          >
            {FONT_CATEGORIES.map((cat) => {
              const groupFonts = ENGRAVING_FONTS.filter((f) => f.category === cat.id);
              return (
                <div key={cat.id} className="mb-1.5 last:mb-0">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7D7665]">
                    {isVi ? cat.label : cat.labelEn}
                  </div>
                  <div className="space-y-0.5">
                    {groupFonts.map((f) => {
                      const active = activeSet.fontId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            onUpdateActiveSet({ fontId: f.id });
                            setFontDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0B5268] text-[#FAF8F3]'
                              : 'text-[#2B2823] hover:bg-[#F5F2EA]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`font-mono text-[10px] font-semibold ${
                                active ? 'text-[#E8D59E]' : 'text-[#0B5268]'
                              }`}
                            >
                              [{f.code}]
                            </span>
                            <span className="truncate text-xs font-medium">{f.name}</span>
                            <span
                              className={`truncate text-xs ${f.cssClass} ${
                                active ? 'text-[#D1D3D4]' : 'text-[#645D4E]'
                              }`}
                              style={{ fontFamily: f.fontFamily }}
                            >
                              · {f.sampleText}
                            </span>
                          </div>
                          {active && <Check className="h-3.5 w-3.5 shrink-0 text-[#E8D59E]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2 rounded-lg border border-[#E5DEC9] bg-white px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[10.5px] text-[#645D4E]">
          <span>
            {isVi ? 'Kích thước khung khắc:' : 'Engraving area:'}{' '}
            <strong className="font-mono font-semibold text-[#0B5268]">10 × 3 cm</strong>
          </span>
          <span className="rounded bg-[#0B5268]/8 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0B5268]">
            {isVi ? `Dòng ${rawLineCount}/3` : `Line ${rawLineCount}/3`}
          </span>
        </div>

        <div
          onClick={() => !activeSet.engravingLater && engravingInputRef.current?.focus()}
          className={`mx-auto flex min-h-[96px] aspect-[10/3] w-full max-w-[340px] items-center justify-center border border-[#111111] bg-white px-3 py-2 transition-shadow ${
            activeSet.engravingLater
              ? 'cursor-default opacity-65'
              : 'cursor-text focus-within:ring-2 focus-within:ring-[#0D9488]/25'
          }`}
        >
          {activeSet.engravingLater ? (
            <p className="text-center text-xs text-[#645D4E]">
              {isVi ? 'Gửi nội dung sau qua chat' : 'Engraving text via chat'}
            </p>
          ) : (
            <textarea
              ref={engravingInputRef}
              rows={rawLineCount}
              maxLength={90}
              value={activeSet.engravingText}
              onChange={(e) => {
                const cappedLines = e.target.value
                  .replace(/\r\n/g, '\n')
                  .split('\n')
                  .slice(0, 3)
                  .join('\n');
                onUpdateActiveSet({ engravingText: cappedLines });
                setStep1Error(null);
              }}
              placeholder={activeFont.sampleText}
              className={`w-full resize-none overflow-hidden border-0 bg-transparent text-center text-[#111111] placeholder:text-[#111111]/35 focus:outline-none ${previewFontSizeClass} ${
                activeFont.cssClass
              } ${activeFont.caseRule === 'UPPERCASE' ? 'uppercase' : ''}`}
              style={{
                fontFamily: activeFont.fontFamily,
              }}
            />
          )}
        </div>
        {!activeSet.engravingLater && (
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#7D7665]">
            <span>
              {isVi
                ? 'Nhấn Enter để xuống dòng (tối đa 3 dòng)'
                : 'Press Enter for new line (max 3 lines)'}
            </span>
            <span className="font-mono">{activeSet.engravingText.length}/90</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section
      id="dat-hang"
      className="relative flex flex-1 min-h-full flex-col overflow-hidden bg-[#0B5268] p-2.5 text-[#2B2823] sm:p-4"
    >
      {/* Hoa văn Trống Đồng nền #0B5268 (đúng quy tắc README) */}
      <img
        src="images/brand/pattern-drum-teal.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.22]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[#083E50]/35"
      />

      {/* SÁCH MỞ 2 TRANG DẠNG ATELIER NGÀ ẤM */}
      <div
        ref={stepContentRef}
        className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-xl border border-[#C4942E]/45 bg-[#FAF8F3] shadow-[0_24px_60px_-18px_rgba(6,28,38,0.55)]"
      >
        {step === 1 && (
          <div className="relative grid flex-1 lg:grid-cols-2">
            {/* NẾP GẤP GÁY GIỮA 2 TRANG TRÊN DESKTOP (đồng bộ w-10 như InsideSpread) */}
            <div
              aria-hidden="true"
              className="brochure-spine-center-light pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-10 -translate-x-1/2 lg:block"
            />

            {/* ==================== TRANG TRÁI: SỐ LƯỢNG + ẢNH RÕ NÉT + 12 MẪU ==================== */}
            <div className="flex min-w-0 flex-col justify-between gap-2 border-b border-[#E5DEC9] p-3 sm:p-3.5 lg:border-b-0 lg:pr-5">
              {/* 01 · Số lượng bộ & Dải chuyển bộ */}
              <div className="rounded-xl border border-[#DFD6C3] bg-[#F5F2EA] p-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 items-center rounded bg-[#0B5268] px-1.5 font-mono text-[10px] font-semibold text-[#FAF8F3]">
                      01
                    </span>
                    <span className="text-[11px] font-semibold text-[#2B2823]">
                      {isVi ? 'Bước 1: Số lượng bộ' : 'Step 1: Quantity'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 5].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => onSetTotalQuantity(q)}
                          className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold transition-colors cursor-pointer ${
                            orderSets.length === q
                              ? 'border border-[#C4942E]/45 bg-[#F3E79B] text-[#083E50]'
                              : 'border border-[#D8CEBC] bg-white text-[#645D4E] hover:border-[#0B5268]'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    <div className="inline-flex items-center rounded-md border border-[#D8CEBC] bg-white">
                      <button
                        type="button"
                        onClick={() => onSetTotalQuantity(orderSets.length - 1)}
                        disabled={orderSets.length <= 1}
                        aria-label={isVi ? 'Giảm số bộ' : 'Decrease quantity'}
                        className="flex h-6 w-6 items-center justify-center text-[#0B5268] hover:bg-[#F3EFE6] disabled:opacity-35 cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[1.6rem] text-center font-mono text-[11px] font-bold text-[#2B2823]">
                        {orderSets.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSetTotalQuantity(orderSets.length + 1)}
                        disabled={orderSets.length >= 20}
                        aria-label={isVi ? 'Tăng số bộ' : 'Increase quantity'}
                        className="flex h-6 w-6 items-center justify-center text-[#0B5268] hover:bg-[#F3EFE6] disabled:opacity-35 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {orderSets.length > 1 && (
                      <button
                        type="button"
                        onClick={handleSyncAll}
                        className="inline-flex items-center gap-1 rounded-md border border-[#C4942E]/55 bg-white px-2 py-0.5 text-[10px] font-semibold text-[#0B5268] hover:bg-[#FBF7EC] cursor-pointer"
                      >
                        <Layers className="h-3 w-3 text-[#C4942E]" />
                        <span>
                          {syncedAllNotice
                            ? isVi
                              ? `Đã gộp ${orderSets.length} bộ`
                              : `Applied (${orderSets.length})`
                            : isVi
                              ? `Áp dụng cả ${orderSets.length} bộ`
                              : `Apply all (${orderSets.length})`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {orderSets.length > 1 && (
                  <div className="mt-1.5 flex max-h-14 flex-wrap gap-1 overflow-y-auto border-t border-[#E5DEC9] pt-1.5">
                    {orderSets.map((set, idx) => {
                      const active = idx === safeActiveIndex;
                      const prod = getProductById(set.productId);
                      const valid = isSetEngravingValid(set);
                      return (
                        <button
                          key={set.id}
                          type="button"
                          onClick={() => onSelectSetIndex(idx)}
                          className={`relative z-10 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] transition-colors cursor-pointer ${
                            active
                              ? 'border-[#0B5268] text-[#FAF8F3]'
                              : valid
                                ? 'border-[#D8CEBC] bg-white text-[#2B2823] hover:border-[#0B5268]/60'
                                : 'border-amber-400 bg-amber-50 text-amber-900'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="config-active-set-pill"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              aria-hidden="true"
                              className="absolute inset-0 -z-10 rounded-[5px] bg-[#0B5268]"
                            />
                          )}
                          <span className="font-mono font-semibold">#{idx + 1}</span>
                          <span className="max-w-[72px] truncate">{prod.name}</span>
                          {!valid && <AlertCircle className="h-3 w-3 text-amber-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Khung ảnh sản phẩm lớn xếp trên cùng + mô tả theo ngôn ngữ hiện tại */}
              <SpotlightCard className="rounded-xl border border-[#DFD6C3] bg-white p-2.5 shadow-2xs">
                <div className="flex flex-col gap-1.5">
                  <div
                    className={`relative mx-auto aspect-[22/15] max-h-[258px] w-full overflow-hidden rounded-lg border border-[#ECE6D8] ${activeImage.containBgClass}`}
                  >
                    <img
                      src={activeImage.src}
                      alt={activeProduct.name}
                      style={{ objectPosition: activeImage.previewObjectPosition }}
                      className={`h-full w-full ${
                        activeImage.previewFit === 'contain' ? 'object-contain' : 'object-cover'
                      }`}
                    />

                    {!activeImage.isExactMaterial && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-[#0B5268]/90 px-2 py-0.5 text-[10px] font-medium text-[#FAF8F3]">
                        {isVi
                          ? `Tham khảo (${activeImage.actualMaterialLabel})`
                          : `Ref. (${activeImage.actualMaterialLabel})`}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setZoomedProduct(activeProduct)}
                      aria-label={isVi ? 'Phóng to ảnh mẫu' : 'Expand product image'}
                      title={isVi ? 'Phóng to xem chi tiết' : 'Click to enlarge'}
                      className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-lg border border-[#C4942E]/45 bg-white/95 text-[#0B5268] shadow-xs transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Expand className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold leading-tight text-[#2B2823] sm:text-xl">
                          {activeProduct.name}
                          {!isVi && (
                            <span className="text-xs font-medium text-[#7D7665] sm:text-sm">
                              {' '}
                              · {activeProduct.englishTag}
                            </span>
                          )}
                        </h3>
                        <p className="text-[10.5px] font-medium text-[#0B5268]">
                          {isVi ? activeProduct.motif : activeProduct.motifEn}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold tabular-nums text-[#0B5268] sm:text-lg">
                          {formatVND(getSetPrice(activeSet))}
                        </span>
                        <span className="ml-1 text-[10px] text-[#7D7665]">
                          {isVi ? '/ bộ' : '/ set'}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-[11px] leading-snug text-[#5A5448]">
                      {isVi ? activeProduct.shortDesc : activeProduct.shortDescEn}
                    </p>

                    <div className="flex items-center justify-end border-t border-[#ECE6D8] pt-1 text-[10.5px] text-[#645D4E]">
                      <span className="rounded bg-[#0B5268]/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0B5268]">
                        {getFullSetSku(activeSet)}
                      </span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Lưới 12 mẫu thu gọn nằm ngay trên Trang Trái */}
              <div className="rounded-xl border border-[#DFD6C3] bg-white p-2">
                <div className="mb-1 flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-[#2B2823]">
                    {isVi ? 'Chọn 1 trong 12 mẫu hoa văn' : 'Choose 1 of 12 Heritage Motifs'}
                  </span>
                  <span className="font-mono text-[#7D7665]">{activeProduct.skuCode}</span>
                </div>

                <HoverHighlightGrid<ProductDesign>
                  items={PRODUCTS}
                  selectedKey={activeSet.productId}
                  getKey={(item) => item.id}
                  onSelect={(item) => {
                    onUpdateActiveSet({ productId: item.id });
                    setStep1Error(null);
                  }}
                  layoutId="config-product-hover"
                  highlightClassName="bg-[#C4942E]/18 border border-[#C4942E]/45"
                  className="grid grid-cols-4 gap-1 sm:grid-cols-6"
                  renderItem={(item, active) => {
                    const thumb = getProductImage(item, activeSet.material, lang);
                    return (
                      <div
                        className={`relative overflow-hidden rounded-lg border transition-all ${
                          active
                            ? 'border-[#0B5268] bg-[#FAF8F3] ring-1 ring-[#0B5268]'
                            : 'border-[#E5DEC9] bg-white'
                        }`}
                      >
                        <div
                          className={`relative aspect-[4/3] w-full overflow-hidden ${
                            thumb.thumbFit === 'contain' ? thumb.containBgClass : 'bg-[#EDE8DC]'
                          }`}
                        >
                          <img
                            src={thumb.src}
                            alt={item.name}
                            style={{ objectPosition: thumb.cardThumbPosition }}
                            className={`h-full w-full ${
                              thumb.thumbFit === 'contain' ? 'object-contain' : 'object-cover'
                            }`}
                            loading="lazy"
                          />
                          {active && (
                            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0B5268] text-white">
                              <Check className="h-2 w-2" />
                            </span>
                          )}
                        </div>
                        <span
                          className={`block truncate px-1 py-0.5 text-center text-[9.5px] ${
                            active ? 'font-semibold text-[#0B5268]' : 'text-[#5A5448]'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    );
                  }}
                />
              </div>
            </div>

            {/* ==================== TRANG PHẢI: TÙY BIẾN CHẤT LIỆU + ĐẾ GỖ + KHẮC + CTA ==================== */}
            <div className="flex min-w-0 flex-col justify-between gap-2 p-3 sm:p-3.5 lg:pl-5">
              <div className="space-y-2.5">
                {/* Header Trang Phải + Stepper SlidingTabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2.5">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[#2B2823] sm:text-2xl">
                      {isVi ? 'Tùy Biến & Khắc Tên' : 'Customize & Engrave'}
                    </h2>
                  </div>

                  <SlidingTabs<'1' | '2'>
                    layoutId="config-step-tabs"
                    value="1"
                    onChange={(val) => {
                      if (val === '2') handleGoToStep2();
                    }}
                    className="border border-[#D8CEBC] bg-[#EDE8DC]"
                    pillClassName="bg-[#0B5268] shadow-xs"
                    activeClassName="text-[#FAF8F3]"
                    inactiveClassName="text-[#645D4E] hover:text-[#2B2823]"
                    items={[
                      {
                        value: '1',
                        label: isVi ? '1 · Thiết kế' : '1 · Design',
                      },
                      {
                        value: '2',
                        label: isVi ? '2 · Xác nhận' : '2 · Checkout',
                      },
                    ]}
                  />
                </div>

                {/* 02 · Chất liệu */}
                <div className="rounded-xl border border-[#DFD6C3] bg-white p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-5 items-center rounded bg-[#0B5268] px-1.5 font-mono text-[10px] font-semibold text-[#FAF8F3]">
                      02
                    </span>
                    <span className="text-xs font-semibold text-[#2B2823]">
                      {isVi ? 'Bước 2: Lựa chọn chất liệu' : 'Step 2: Select Material'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(['dong', 'ma-vang'] as MaterialId[]).map((matId) => {
                      const mat = MATERIALS[matId];
                      const active = activeSet.material === matId;
                      return (
                        <button
                          key={matId}
                          type="button"
                          onClick={() => onUpdateActiveSet({ material: matId })}
                          className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                            active
                              ? 'border-[#0B5268] bg-[#0B5268]/[0.04] ring-1 ring-[#0B5268]'
                              : 'border-[#E5DEC9] bg-[#FAF8F3]/60 hover:border-[#C4942E]/70'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span
                              className={`h-3.5 w-3.5 shrink-0 rounded-full bg-gradient-to-br ${mat.swatchClass} ring-1 ring-black/10`}
                            />
                            <span className="truncate text-xs font-semibold text-[#2B2823]">
                              {isVi ? mat.shortLabel : mat.shortLabelEn}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[11px] font-bold text-[#0B5268]">
                            {formatVND(mat.unitPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 03 · Đế gỗ trưng bày */}
                <div className="rounded-xl border border-[#DFD6C3] bg-white p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-5 items-center rounded bg-[#0B5268] px-1.5 font-mono text-[10px] font-semibold text-[#FAF8F3]">
                      03
                    </span>
                    <span className="text-xs font-semibold text-[#2B2823]">
                      {isVi ? 'Bước 3: Lựa chọn đế gỗ' : 'Step 3: Select Wood Base'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                          className={`flex flex-col justify-between gap-1 rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                            active
                              ? 'border-[#0B5268] bg-[#0B5268]/[0.04] ring-1 ring-[#0B5268]'
                              : 'border-[#E5DEC9] bg-[#FAF8F3]/60 hover:border-[#C4942E]/70'
                          }`}
                        >
                          <div className="flex w-full items-start justify-between gap-2">
                            <span className="text-xs font-semibold leading-snug text-[#2B2823]">
                              {isVi ? base.label : base.labelEn}
                            </span>
                            <span className="shrink-0 font-mono text-[11px] font-bold text-[#0B5268]">
                              {base.extraPrice === 0
                                ? '0đ'
                                : `+${formatVND(base.extraPrice)}`}
                            </span>
                          </div>
                          {baseId === 'tron' && (
                            <span className="text-[10.5px] leading-snug text-[#645D4E]">
                              - {isVi ? base.subtitle : base.subtitleEn}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 04 · Khắc laser & 10 Font (khi chọn đế khắc) */}
                {activeSet.woodBase === 'khac' && (
                  <div className="space-y-2.5 rounded-xl border border-[#C4942E]/45 bg-[#FBF7EC]/75 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 items-center rounded bg-[#C4942E] px-1.5 font-mono text-[10px] font-semibold text-[#083E50]">
                          04
                        </span>
                        <span className="text-xs font-semibold text-[#2B2823]">
                          {isVi ? 'Bước 4: Nội dung khắc & font' : 'Step 4: Engraving & Font'}
                        </span>
                      </div>

                      <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0B5268] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeSet.engravingLater}
                          onChange={(e) => {
                            onUpdateActiveSet({ engravingLater: e.target.checked });
                            setStep1Error(null);
                          }}
                          className="h-3.5 w-3.5 rounded border-[#0B5268] accent-[#0B5268]"
                        />
                        <span>{isVi ? 'Gửi chữ sau qua chat' : 'Send later via chat'}</span>
                      </label>
                    </div>

                    {renderInlineWoodPreview()}
                  </div>
                )}

                {step1Error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <span>{step1Error}</span>
                  </div>
                )}
              </div>

                  {/* Thanh tổng kết & CTA sang Bước 2 */}
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#DFD6C3] bg-[#F5F2EA] px-4 py-2.5">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#7D7665]">
                      {isVi
                        ? `Tổng tạm tính (${orderSets.length} bộ)`
                        : `Est. Total (${orderSets.length})`}
                    </span>
                    <span className="text-lg font-bold tabular-nums text-[#0B5268]">
                      {formatVND(builtOrder.totalPrice)}
                    </span>
                    {totalEngravedCount > uniqueEngravingCount && (
                      <span className="block text-[10px] font-medium text-[#0B5268]">
                        {isVi
                          ? `Cùng nội dung khắc: chỉ tính ${uniqueEngravingCount}× phí khắc`
                          : `Same text: charged ${uniqueEngravingCount}× engraving fee`}
                      </span>
                    )}
                  </div>

                  <ShimmerButton
                    type="button"
                    variant="gold"
                    onClick={handleGoToStep2}
                    className="w-full px-5 py-2.5 text-sm sm:w-auto"
                  >
                    <span>{isVi ? 'Tiếp tục nhập thông tin' : 'Continue to Checkout'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BƯỚC 2A: DẠNG MỞ ĐÔI 2 TRANG ==================== */}
        {step === 2 && !submittedState && (
          <form onSubmit={handleConfirmOrder} className="relative grid flex-1 lg:grid-cols-2">
            <div
              aria-hidden="true"
              className="brochure-spine-center-light pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-10 -translate-x-1/2 lg:block"
            />

            {/* TRANG TRÁI: THÔNG TIN NGƯỜI NHẬN */}
            <div className="flex flex-col justify-between space-y-3 border-b border-[#E5DEC9] p-4 sm:p-5 lg:border-b-0 lg:pr-7">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#ECE6D8] pb-2.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0B5268]">
                      {isVi ? 'Bước 2 / 2' : 'Step 2 / 2'}
                    </span>
                    <h3 className="font-display text-2xl font-semibold text-[#2B2823]">
                      {isVi ? 'Thông tin người nhận' : 'Recipient Information'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#D8CEBC] bg-white px-2.5 py-1 text-xs font-semibold text-[#0B5268] hover:border-[#0B5268] cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{isVi ? 'Chỉnh mẫu' : 'Edit design'}</span>
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#2B2823]">
                      {isVi ? 'Họ và tên *' : 'Full Name *'}
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      value={customerInfo.fullName}
                      onChange={(e) => {
                        onUpdateCustomer({ fullName: e.target.value });
                        setCustomerError(null);
                      }}
                      placeholder={isVi ? 'Nguyễn Văn A' : 'Your full name'}
                      className="w-full rounded-lg border border-[#D8CEBC] bg-white px-3 py-2 text-sm focus:border-[#0B5268] focus:outline-none focus:ring-2 focus:ring-[#0B5268]/15"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#2B2823]">
                      {isVi ? 'Số điện thoại / Zalo *' : 'Phone / Zalo *'}
                    </label>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      required
                      value={customerInfo.phone}
                      onChange={(e) => {
                        onUpdateCustomer({ phone: e.target.value });
                        setCustomerError(null);
                      }}
                      placeholder="09xx xxx xxx"
                      className="w-full rounded-lg border border-[#D8CEBC] bg-white px-3 py-2 text-sm focus:border-[#0B5268] focus:outline-none focus:ring-2 focus:ring-[#0B5268]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2B2823]">
                    {isVi ? 'Email (tùy chọn)' : 'Email (optional)'}
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => onUpdateCustomer({ email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-[#D8CEBC] bg-white px-3 py-2 text-sm focus:border-[#0B5268] focus:outline-none focus:ring-2 focus:ring-[#0B5268]/15"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2B2823]">
                    {isVi ? 'Địa chỉ giao hàng' : 'Shipping Address'}
                  </label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => onUpdateCustomer({ address: e.target.value })}
                    placeholder={
                      isVi ? 'Số nhà, đường, quận/huyện, tỉnh/TP' : 'Street, city, country'
                    }
                    className="w-full rounded-lg border border-[#D8CEBC] bg-white px-3 py-2 text-sm focus:border-[#0B5268] focus:outline-none focus:ring-2 focus:ring-[#0B5268]/15"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#2B2823]">
                    {isVi ? 'Hình thức thanh toán' : 'Payment Method'}
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(
                      [
                        {
                          id: 'qr' as PaymentMethodId,
                          vi: 'Thanh toán QR Code',
                          en: 'QR Code Transfer',
                        },
                        {
                          id: 'cod' as PaymentMethodId,
                          vi: 'Thanh toán khi nhận hàng (ship COD)',
                          en: 'Cash on Delivery (COD)',
                        },
                      ]
                    ).map((opt) => {
                      const active = customerInfo.paymentMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onUpdateCustomer({ paymentMethod: opt.id })}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all cursor-pointer ${
                            active
                              ? 'border-[#0B5268] bg-[#0B5268]/[0.05] text-[#0B5268] ring-1 ring-[#0B5268]'
                              : 'border-[#D8CEBC] bg-white text-[#5A5448] hover:border-[#C4942E]/70'
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                              active ? 'border-[#0B5268] bg-[#0B5268]' : 'border-[#BDB49F]'
                            }`}
                          >
                            {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span>{isVi ? opt.vi : opt.en}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#2B2823]">
                    {isVi ? 'Ghi chú đơn hàng' : 'Order Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={customerInfo.note}
                    onChange={(e) => onUpdateCustomer({ note: e.target.value })}
                    placeholder={
                      isVi
                        ? 'Yêu cầu đóng gói quà tặng, thời gian nhận...'
                        : 'Gift wrapping, preferred delivery time...'
                    }
                    className="w-full rounded-lg border border-[#D8CEBC] bg-white px-3 py-2 text-sm focus:border-[#0B5268] focus:outline-none focus:ring-2 focus:ring-[#0B5268]/15"
                  />
                </div>

                {customerInfo.paymentMethod === 'qr' && (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-[#C4942E]/45 bg-[#FAF8F3] p-3 shadow-2xs sm:flex-row sm:items-center">
                    <img
                      src={buildVietQrUrl(
                        builtOrder.totalPrice,
                        `Khoi Minh Gifts ${customerInfo.phone.trim() || customerInfo.fullName.trim()}`
                      )}
                      alt={`VietQR ${BANK_TRANSFER_CONFIG.bankName}`}
                      className="h-40 w-40 shrink-0 rounded-lg border border-[#E5DEC9] bg-white p-1.5 object-contain"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-[#0B5268]">
                          {isVi ? 'Quét mã VietQR chuyển khoản' : 'Scan VietQR to Pay'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyTextReliably(BANK_TRANSFER_CONFIG.accountNumber)}
                          className="inline-flex items-center gap-1 rounded border border-[#D8CEBC] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#0B5268] hover:border-[#0B5268] cursor-pointer"
                        >
                          <Copy className="h-2.5 w-2.5" />
                          <span>{isVi ? 'Chép STK' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[#5A5448]">
                        {BANK_TRANSFER_CONFIG.bankName} ·{' '}
                        <strong className="font-mono text-[#2B2823]">
                          {BANK_TRANSFER_CONFIG.accountNumber}
                        </strong>
                      </p>
                      <p className="truncate font-semibold text-[#2B2823]">
                        {BANK_TRANSFER_CONFIG.accountName}
                      </p>
                      <p className="text-[10.5px] font-semibold text-[#0B5268]">
                        {isVi ? 'Số tiền:' : 'Amount:'} {formatVND(builtOrder.totalPrice)}
                      </p>
                      <p className="text-[10px] text-[#7D7665]">
                        {isVi
                          ? 'Số tiền & nội dung được điền tự động khi quét.'
                          : 'Amount & reference pre-filled automatically.'}
                      </p>
                    </div>
                  </div>
                )}

                {customerError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <span>{customerError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* TRANG PHẢI: XEM LẠI ĐƠN HÀNG */}
            <div className="flex flex-col justify-between bg-[#F5F2EA] p-4 sm:p-5 lg:pl-7">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-[#DFD6C3] pb-2.5">
                  <h3 className="font-display text-xl font-semibold text-[#2B2823] sm:text-2xl">
                    {isVi ? 'Cùng xem lại đơn hàng của Quý khách' : 'Review Your Order'}
                  </h3>
                  <span className="shrink-0 whitespace-nowrap rounded bg-[#0B5268]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0B5268]">
                    {orderSets.length} {isVi ? 'bộ' : orderSets.length > 1 ? 'sets' : 'set'}
                  </span>
                </div>

                <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
                  {orderSets.map((set, idx) => {
                    const prod = getProductById(set.productId);
                    const mat = MATERIALS[set.material];
                    const setCost = getSetPriceInOrder(set, idx, orderSets);
                    return (
                      <div
                        key={set.id}
                        className="flex items-start justify-between gap-2 rounded-lg border border-[#DFD6C3] bg-white p-2.5 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0B5268]">#{idx + 1}</span>
                            <span className="truncate font-semibold text-[#2B2823]">
                              {prod.name}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-[#645D4E]">
                            {isVi ? mat.shortLabel : mat.shortLabelEn} ·{' '}
                            {summarizeSetEngraving(set)}
                          </p>
                          {setCost.isDuplicateEngraving && (
                            <span className="mt-0.5 inline-block rounded bg-[#F3E79B]/70 px-1.5 py-0.5 text-[10px] font-medium text-[#083E50]">
                              {isVi ? 'Cùng nội dung — không tính thêm phí khắc' : 'Same text — no extra engraving fee'}
                            </span>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="font-mono font-bold text-[#0B5268]">
                            {formatVND(setCost.total)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditSetFromStep2(idx)}
                              aria-label={isVi ? 'Sửa bộ' : 'Edit set'}
                              className="text-[#0B5268] hover:text-[#083E50] cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {orderSets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => onRemoveSet(idx)}
                                aria-label={isVi ? 'Xóa bộ' : 'Remove set'}
                                className="text-red-600 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-[#DFD6C3] pt-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-[#645D4E]">
                    {isVi ? 'Tổng giá dự kiến' : 'Estimated Total'}
                  </span>
                  <span className="text-xl font-bold tabular-nums text-[#0B5268]">
                    {formatVND(builtOrder.totalPrice)}
                  </span>
                </div>

                <ShimmerButton
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting}
                  className="w-full py-3 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isVi ? 'Đang gửi phiếu đơn...' : 'Submitting order...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {isVi ? 'Xác nhận đặt hàng & Gửi thông tin' : 'Confirm & Submit Order'}
                      </span>
                    </>
                  )}
                </ShimmerButton>
              </div>
            </div>
          </form>
        )}

        {/* ==================== BƯỚC 2B: ĐÃ XÁC NHẬN ĐƠN HÀNG (DẠNG 2 TRANG) ==================== */}
        {step === 2 && submittedState && (
          <div className="relative grid flex-1 lg:grid-cols-2">
            <div
              aria-hidden="true"
              className="brochure-spine-center-light pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-10 -translate-x-1/2 lg:block"
            />

            {/* TRANG TRÁI: THÔNG BÁO XÁC NHẬN & CHI TIẾT PHIẾU */}
            <div className="flex flex-col justify-between border-b border-[#E5DEC9] bg-white p-5 sm:p-6 lg:border-b-0 lg:pr-7">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#ECE6D8] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[#2B2823] sm:text-2xl">
                        {isVi
                          ? 'Đơn hàng của Quý khách đã được ghi nhận'
                          : 'Your Order Has Been Recorded'}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                      submittedState.emailMode === 'sent'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    {submittedState.emailMode === 'sent'
                      ? isVi
                        ? 'Đã gửi về Khoi Minh Gifts'
                        : 'Sent to Khoi Minh Gifts'
                      : isVi
                        ? 'Sẵn sàng gửi qua Chat / Email'
                        : 'Ready via Chat / Email'}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-[#E5DEC9] bg-[#FAF8F3] p-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="text-[#2B2823]">
                        {submittedState.customerSnapshot.fullName}
                      </strong>{' '}
                      ·{' '}
                      <span className="text-[#645D4E]">
                        {submittedState.customerSnapshot.phone}
                      </span>
                    </div>
                    <strong className="font-mono text-sm text-[#0B5268]">
                      {formatVND(submittedState.payload.totalPrice)}
                    </strong>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyPayload(submittedState.payload)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8CEBC] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B5268] hover:border-[#0B5268] cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>
                        {justCopied
                          ? isVi
                            ? 'Đã sao chép phiếu!'
                            : 'Copied!'
                          : isVi
                            ? 'Sao chép phiếu'
                            : 'Copy folio'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMessagePreview((p) => !p)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#645D4E] hover:text-[#0B5268] cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{isVi ? 'Xem chi tiết phiếu' : 'View details'}</span>
                      {showMessagePreview ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {showMessagePreview && (
                    <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-[#DFD8CA] bg-white p-3 font-sans text-xs leading-relaxed text-[#2B2823]">
                      {submittedState.payload.message.replace(/\s*·\s*#KM-\d{4}-\d{4}/g, '')}
                    </pre>
                  )}
                </div>

                {submittedState.customerSnapshot.paymentMethod === 'qr' && (
                  <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-[#C4942E]/45 bg-[#FAF8F3] p-3 sm:flex-row sm:items-center">
                    <img
                      src={buildVietQrUrl(
                        submittedState.payload.totalPrice,
                        `Khoi Minh Gifts ${
                          submittedState.customerSnapshot.phone.trim() ||
                          submittedState.customerSnapshot.fullName.trim()
                        }`
                      )}
                      alt={`VietQR ${BANK_TRANSFER_CONFIG.bankName}`}
                      className="h-40 w-40 shrink-0 rounded-lg border border-[#E5DEC9] bg-white p-1.5 object-contain"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-[#0B5268]">
                          {isVi ? 'Quét mã VietQR để thanh toán' : 'Scan VietQR to Complete Payment'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyTextReliably(BANK_TRANSFER_CONFIG.accountNumber)}
                          className="inline-flex items-center gap-1 rounded border border-[#D8CEBC] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#0B5268] hover:border-[#0B5268] cursor-pointer"
                        >
                          <Copy className="h-2.5 w-2.5" />
                          <span>{isVi ? 'Chép STK' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[#5A5448]">
                        {BANK_TRANSFER_CONFIG.bankName} ·{' '}
                        <strong className="font-mono text-[#2B2823]">
                          {BANK_TRANSFER_CONFIG.accountNumber}
                        </strong>
                      </p>
                      <p className="truncate font-semibold text-[#2B2823]">
                        {BANK_TRANSFER_CONFIG.accountName}
                      </p>
                      <p className="text-[10.5px] font-semibold text-[#0B5268]">
                        {isVi ? 'Số tiền:' : 'Amount:'}{' '}
                        {formatVND(submittedState.payload.totalPrice)}
                      </p>
                    </div>
                  </div>
                )}

                {submittedState.printAssets.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="block text-[11px] font-semibold text-[#0B5268]">
                      {isVi
                        ? 'File in khắc đế gỗ 10 × 3 cm (đã đính kèm gửi email)'
                        : 'Print-ready 10 × 3 cm engraving files (attached to email)'}
                    </span>
                    <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
                      {submittedState.printAssets.map((asset) => (
                        <div
                          key={asset.filename}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[#DFD8CA] bg-white p-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <img
                              src={asset.dataUrl}
                              alt={asset.filename}
                              className="h-10 w-24 shrink-0 rounded border border-slate-200 object-contain"
                            />
                            <div className="min-w-0 text-[10.5px]">
                              <span className="block truncate font-semibold text-[#2B2823]">
                                Bộ #{asset.setIndex + 1} · {asset.boxSizeLabel}
                              </span>
                              <span className="block truncate text-[#645D4E]">
                                {asset.fontSizeLabel} · {asset.fontLabel}
                              </span>
                            </div>
                          </div>
                          <a
                            href={asset.pdfDataUrl}
                            download={asset.filename}
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#0B5268]/25 bg-[#FAF8F3] px-2 py-1 text-[10.5px] font-semibold text-[#0B5268] hover:border-[#0B5268]"
                          >
                            <Download className="h-3 w-3" />
                            <span>PDF</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-[#E6DFD0] pt-4">
                <button
                  type="button"
                  onClick={handleStartNewOrder}
                  className="text-xs font-semibold text-[#0B5268] hover:underline cursor-pointer"
                >
                  {isVi ? '← Tạo đơn hàng mới' : '← Start a new order'}
                </button>
              </div>
            </div>

            {/* TRANG PHẢI: KÊNH GỬI ĐƠN MESSENGER / ZALO / EMAIL */}
            <div className="flex flex-col justify-between bg-[#F5F2EA] p-5 sm:p-6 lg:pl-7">
              <div>
                <h4 className="font-display text-2xl font-semibold text-[#2B2823]">
                  {isVi ? 'Gửi phiếu đơn qua Chat' : 'Send Order via Chat'}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#645D4E]">
                  {handoffChannel
                    ? isVi
                      ? `Đã tự động sao chép toàn bộ phiếu đơn ${submittedState.payload.orderRef}. Khi cửa sổ ${handoffChannel === 'messenger' ? 'Messenger' : 'Zalo'} mở ra, bạn chỉ cần Dán và Gửi!`
                      : `Full order ${submittedState.payload.orderRef} copied! Simply Paste & Send inside your open chat.`
                    : isVi
                      ? 'Khi bấm Messenger hoặc Zalo, toàn bộ chi tiết đơn hàng được tự động sao chép để bạn dán ngay vào đoạn chat với Khoi Minh Gifts.'
                      : 'Clicking Messenger or Zalo automatically copies the full order so you can paste it right into chat.'}
                </p>

                <div className="mt-5 space-y-3">
                  <ShimmerButton
                    type="button"
                    variant="teal"
                    onClick={() => handleChannelHandoff('messenger', submittedState.payload)}
                    className="w-full px-5 py-3 text-sm"
                  >
                    <Send className="h-4 w-4 text-[#E8D59E]" />
                    <span>{isVi ? 'Gửi đơn qua Messenger' : 'Send via Messenger'}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-75" />
                  </ShimmerButton>

                  <button
                    type="button"
                    onClick={() => handleChannelHandoff('zalo', submittedState.payload)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#C4942E] bg-white px-5 py-3 text-sm font-semibold text-[#0B5268] transition-colors hover:bg-[#FBF7EC] cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 text-[#C4942E]" />
                    <span>{isVi ? 'Liên hệ qua Zalo' : 'Contact via Zalo'}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </button>

                  <a
                    href={buildMailtoHref(submittedState.payload, submittedState.customerSnapshot)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#D8CEBC] bg-white px-5 py-2.5 text-xs font-semibold text-[#645D4E] hover:border-[#0B5268] hover:text-[#0B5268]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{isVi ? 'Gửi Email dự phòng' : 'Fallback Email'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal xem 3 ảnh mẫu đế gỗ thực tế (Portal ra document.body để không bị cắt bởi 3D Brochure) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            <AnimatePresence>
              {showSampleModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
                  onClick={() => setShowSampleModal(false)}
                  role="dialog"
                  aria-modal="true"
                  aria-label={isVi ? 'Ảnh mẫu đế gỗ khắc thực tế' : 'Real wood engraving samples'}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setShowSampleModal(false)}
                      aria-label={isVi ? 'Đóng' : 'Close'}
                      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B5268]/90 text-white hover:bg-[#083E50] cursor-pointer"
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
                      className="max-h-[58vh] w-full bg-[#EDE8DC] object-contain"
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lightbox phóng to ảnh mẫu bookmark */}
            <AnimatePresence>
              {zoomedProduct && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
                  onClick={() => setZoomedProduct(null)}
                  role="dialog"
                  aria-modal="true"
                  aria-label={zoomedProduct.name}
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
                      onClick={() => setZoomedProduct(null)}
                      aria-label={isVi ? 'Đóng' : 'Close'}
                      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0B5268]/90 text-white hover:bg-[#083E50] cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <img
                      src={getProductImage(zoomedProduct, activeSet.material, lang).src}
                      alt={zoomedProduct.name}
                      className="max-h-[70vh] w-full bg-[#EDE8DC] object-contain"
                    />
                    <div className="p-5">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0B5268]">
                        {zoomedProduct.skuCode} • {isVi ? zoomedProduct.motif : zoomedProduct.motifEn}
                      </span>
                      <h4 className="font-display mt-0.5 text-2xl font-semibold text-[#2B2823]">
                        {zoomedProduct.name}
                        {!isVi ? ` (${zoomedProduct.englishTag})` : ''}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-[#645D4E]">
                        {isVi ? zoomedProduct.shortDesc : zoomedProduct.shortDescEn}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </section>
  );
}
