import gsap from 'gsap';
import { LayoutGroup, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from 'react';
import type { Language } from '../data/catalog';

export type BrochurePage = 0 | 1 | 2 | 3 | 4;

interface BrochureBookProps {
  currentPage: BrochurePage;
  onChangePage: (page: BrochurePage) => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  totalOrderSets: number;
  renderPage: (page: BrochurePage) => ReactNode;
}

type TurnMode =
  | 'open-cover'
  | 'close-to-front'
  | 'spread-forward'
  | 'spread-backward'
  | 'close-to-back'
  | 'open-from-back'
  | 'flip-cover-over'
  | 'mobile-forward'
  | 'mobile-backward'
  | 'reduced-fade';

interface TurnState {
  key: number;
  from: BrochurePage;
  to: BrochurePage;
  mode: TurnMode;
}

function resolveTurnMode(from: BrochurePage, to: BrochurePage): TurnMode {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'reduced-fade';
  }

  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  if (!isDesktop) {
    return to > from ? 'mobile-forward' : 'mobile-backward';
  }

  if (from === 0 && (to === 1 || to === 2 || to === 3)) return 'open-cover';
  if ((from === 1 || from === 2 || from === 3) && to === 0) return 'close-to-front';
  if ((from === 1 || from === 2 || from === 3) && to === 4) return 'close-to-back';
  if (from === 4 && (to === 1 || to === 2 || to === 3)) return 'open-from-back';
  if ((from === 0 && to === 4) || (from === 4 && to === 0)) return 'flip-cover-over';

  return to > from ? 'spread-forward' : 'spread-backward';
}

export function BrochureBook({
  currentPage,
  onChangePage,
  lang,
  onChangeLang,
  totalOrderSets,
  renderPage,
}: BrochureBookProps) {
  const isVi = lang === 'vi';
  const [turnState, setTurnState] = useState<TurnState | null>(null);

  const prevPageRef = useRef<BrochurePage>(currentPage);
  const turnSeqRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; ignore: boolean } | null>(null);

  // GSAP refs cho cỗ máy lật trang thật 3D 60fps (không qua tờ giấy trắng trung gian)
  const boundsRef = useRef<HTMLDivElement>(null);
  const liveBookRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const frontFaceRef = useRef<HTMLDivElement>(null);
  const backFaceRef = useRef<HTMLDivElement>(null);
  const frontShadeRef = useRef<HTMLDivElement>(null);
  const backShadeRef = useRef<HTMLDivElement>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Phát hiện chuyển trang trước khi trình duyệt paint để không lóe 1 frame nào
  useLayoutEffect(() => {
    const prev = prevPageRef.current;
    if (prev === currentPage) return;

    prevPageRef.current = currentPage;

    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
      activeTimelineRef.current = null;
    }

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }

    const mode = resolveTurnMode(prev, currentPage);
    turnSeqRef.current += 1;

    setTurnState({
      key: turnSeqRef.current,
      from: prev,
      to: currentPage,
      mode,
    });
  }, [currentPage]);

  // Chạy timeline GSAP vật lý sách thật — lật trực tiếp mặt trang đang xem sang mặt trang kế tiếp
  useLayoutEffect(() => {
    if (!turnState || !boundsRef.current) return;

    const liveBook = liveBookRef.current;
    const rig = rigRef.current;
    const leaf = leafRef.current;
    const frontFace = frontFaceRef.current;
    const backFace = backFaceRef.current;
    const frontShade = frontShadeRef.current;
    const backShade = backShadeRef.current;

    const ctx = gsap.context(() => {
      const finishTurn = () => {
        if (liveBook) {
          gsap.set(liveBook, { clearProps: 'transform,opacity,clipPath' });
        }
        activeTimelineRef.current = null;
        setTurnState(null);
      };

      const tl = gsap.timeline({
        defaults: { force3D: true },
        onComplete: finishTurn,
      });
      activeTimelineRef.current = tl;

      // Chuyển mặt trước -> mặt sau dứt khoát đúng tại điểm vuông góc 90° (t = dur * 0.5)
      // để không bị bất kỳ filter / box-shadow nào của Chromium làm phẳng backface-visibility!
      const scheduleMidpointSwap = (dur: number) => {
        if (frontFace && backFace) {
          gsap.set(frontFace, { autoAlpha: 1 });
          gsap.set(backFace, { autoAlpha: 0 });
          tl.set(frontFace, { autoAlpha: 0 }, dur * 0.5);
          tl.set(backFace, { autoAlpha: 1 }, dur * 0.5);
        }
      };

      const { mode, to } = turnState;

      if (mode === 'reduced-fade') {
        if (liveBook) {
          tl.fromTo(
            liveBook,
            { opacity: 0.45 },
            { opacity: 1, duration: 0.18, ease: 'power2.out' }
          );
        } else {
          tl.to({}, { duration: 0.05 });
        }
        return;
      }

      // Mobile: lật trực tiếp trang cũ (from) mở ra trang mới (to) bên dưới, không qua giấy trắng
      if (mode === 'mobile-forward' || mode === 'mobile-backward') {
        const forward = mode === 'mobile-forward';
        if (liveBook) {
          tl.fromTo(
            liveBook,
            { scale: 0.985, opacity: 0.94 },
            { scale: 1, opacity: 1, duration: 0.46, ease: 'power2.out' },
            0
          );
        }
        if (leaf) {
          gsap.set(leaf, {
            transformOrigin: forward ? 'left center' : 'right center',
          });
          tl.fromTo(
            leaf,
            { rotateY: 0 },
            { rotateY: forward ? -105 : 105, duration: 0.48, ease: 'power2.inOut' },
            0
          ).to(leaf, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0.28);

          if (frontShade) {
            tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.28, duration: 0.32 }, 0);
          }
        }
        return;
      }

      // Lật nguyên cuốn bìa (0 <-> 4)
      if (mode === 'flip-cover-over' && rig) {
        const dur = 0.68;
        const rotTarget = to === 0 ? 180 : -180;
        gsap.set(rig, { transformOrigin: '50% 50%' });
        scheduleMidpointSwap(dur);
        tl.fromTo(
          rig,
          { rotateY: 0, scale: 1 },
          { rotateY: rotTarget, duration: dur, ease: 'power2.inOut' },
          0
        )
          .to(rig, { scale: 0.965, duration: dur * 0.5, ease: 'power2.out' }, 0)
          .to(rig, { scale: 1, duration: dur * 0.5, ease: 'power2.inOut' }, dur * 0.5);

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.3, duration: dur * 0.5 }, 0);
        }
        if (backShade) {
          tl.fromTo(
            backShade,
            { opacity: 0.28 },
            { opacity: 0, duration: dur * 0.5, ease: 'power2.out' },
            dur * 0.5
          );
        }
        return;
      }

      // MỞ BÌA TRƯỚC (0 -> 1|2|3):
      // Mặt trước lá lật = Bìa trước (0), Mặt sau lá lật = Nửa TRÁI thật của trang đích (to),
      // Bên dưới cánh phải = Nửa PHẢI thật của trang đích (liveBook được clip đúng nửa phải ngay từ t=0!)
      if (mode === 'open-cover' && rig && leaf && liveBook) {
        const dur = 0.68;
        gsap.set(leaf, { transformOrigin: 'left center' });
        gsap.set(liveBook, {
          xPercent: -25,
          clipPath: 'inset(0% 0% 0% 50%)',
        });
        scheduleMidpointSwap(dur);

        tl.to(liveBook, { xPercent: 0, duration: dur, ease: 'power2.inOut' }, 0)
          .fromTo(
            rig,
            { xPercent: -25 },
            { xPercent: 0, duration: dur, ease: 'power2.inOut' },
            0
          )
          .fromTo(
            leaf,
            { rotateY: 0 },
            { rotateY: -180, duration: dur, ease: 'power2.inOut' },
            0
          );

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.32, duration: dur * 0.5 }, 0);
        }
        if (backShade) {
          tl.fromTo(
            backShade,
            { opacity: 0.3 },
            { opacity: 0, duration: dur * 0.5, ease: 'power2.out' },
            dur * 0.5
          );
        }
        return;
      }

      // MỞ TỪ BÌA SAU (4 -> 1|2|3):
      // Mặt trước lá lật = Bìa sau (4), Mặt sau lá lật = Nửa PHẢI thật của trang đích (to),
      // Bên dưới cánh trái = Nửa TRÁI thật của trang đích (liveBook clip đúng nửa trái ngay từ t=0!)
      if (mode === 'open-from-back' && rig && leaf && liveBook) {
        const dur = 0.68;
        gsap.set(leaf, { transformOrigin: 'right center' });
        gsap.set(liveBook, {
          xPercent: 25,
          clipPath: 'inset(0% 50% 0% 0%)',
        });
        scheduleMidpointSwap(dur);

        tl.to(liveBook, { xPercent: 0, duration: dur, ease: 'power2.inOut' }, 0)
          .fromTo(
            rig,
            { xPercent: 25 },
            { xPercent: 0, duration: dur, ease: 'power2.inOut' },
            0
          )
          .fromTo(
            leaf,
            { rotateY: 0 },
            { rotateY: 180, duration: dur, ease: 'power2.inOut' },
            0
          );

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.32, duration: dur * 0.5 }, 0);
        }
        if (backShade) {
          tl.fromTo(
            backShade,
            { opacity: 0.3 },
            { opacity: 0, duration: dur * 0.5, ease: 'power2.out' },
            dur * 0.5
          );
        }
        return;
      }

      // ĐÓNG VỀ BÌA TRƯỚC (1|2|3 -> 0):
      // Cánh phải lót dưới = Nửa PHẢI thật của trang cũ (from),
      // Lá lật bên trái = Nửa TRÁI thật của trang cũ (mặt trước) -> gấp sang phải thành Bìa trước (0) (mặt sau)
      if (mode === 'close-to-front' && rig && leaf) {
        const dur = 0.68;
        gsap.set(leaf, { transformOrigin: 'right center' });
        scheduleMidpointSwap(dur);

        tl.fromTo(
          rig,
          { xPercent: 0 },
          { xPercent: -25, duration: dur, ease: 'power2.inOut' },
          0
        ).fromTo(
          leaf,
          { rotateY: 0 },
          { rotateY: 180, duration: dur, ease: 'power2.inOut' },
          0
        );

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.32, duration: dur * 0.5 }, 0);
        }
        if (backShade) {
          tl.fromTo(
            backShade,
            { opacity: 0.3 },
            { opacity: 0, duration: dur * 0.5, ease: 'power2.out' },
            dur * 0.5
          );
        }
        return;
      }

      // ĐÓNG VỀ BÌA SAU (1|2|3 -> 4):
      // Cánh trái lót dưới = Nửa TRÁI thật của trang cũ (from),
      // Lá lật bên phải = Nửa PHẢI thật của trang cũ (mặt trước) -> gấp sang trái thành Bìa sau (4) (mặt sau)
      if (mode === 'close-to-back' && rig && leaf) {
        const dur = 0.68;
        gsap.set(leaf, { transformOrigin: 'left center' });
        scheduleMidpointSwap(dur);

        tl.fromTo(
          rig,
          { xPercent: 0 },
          { xPercent: 25, duration: dur, ease: 'power2.inOut' },
          0
        ).fromTo(
          leaf,
          { rotateY: 0 },
          { rotateY: -180, duration: dur, ease: 'power2.inOut' },
          0
        );

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.32, duration: dur * 0.5 }, 0);
        }
        if (backShade) {
          tl.fromTo(
            backShade,
            { opacity: 0.3 },
            { opacity: 0, duration: dur * 0.5, ease: 'power2.out' },
            dur * 0.5
          );
        }
        return;
      }

      // LẬT GIỮA CÁC TRANG MỞ ĐÔI (1 <-> 2 <-> 3):
      const isForward = mode === 'spread-forward';
      const dur = 0.64;

      if (liveBook) {
        gsap.set(liveBook, {
          clipPath: isForward ? 'inset(0% 0% 0% 50%)' : 'inset(0% 50% 0% 0%)',
        });
      }

      if (leaf) {
        gsap.set(leaf, {
          transformOrigin: isForward ? 'left center' : 'right center',
        });
        scheduleMidpointSwap(dur);

        tl.fromTo(
          leaf,
          { rotateY: 0 },
          { rotateY: isForward ? -180 : 180, duration: dur, ease: 'power2.inOut' },
          0
        );

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.3, duration: dur * 0.5 }, 0);
        }
        if (backShade) {
          tl.fromTo(
            backShade,
            { opacity: 0.28 },
            { opacity: 0, duration: dur * 0.5, ease: 'power2.out' },
            dur * 0.5
          );
        }
      }
    }, boundsRef);

    return () => {
      ctx.revert();
    };
  }, [turnState]);

  useEffect(() => {
    return () => {
      if (activeTimelineRef.current) {
        activeTimelineRef.current.kill();
      }
    };
  }, []);

  // Điều hướng bằng phím mũi tên ← / → (tự động bỏ qua khi đang gõ text)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }
      if (e.key === 'ArrowRight' && currentPage < 4) {
        onChangePage((currentPage + 1) as BrochurePage);
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        onChangePage((currentPage - 1) as BrochurePage);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentPage, onChangePage]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName;
    const ignore = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    const t = e.touches[0];
    if (!t) return;
    touchStartRef.current = { x: t.clientX, y: t.clientY, ignore };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || start.ignore) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && currentPage < 4) {
        onChangePage((currentPage + 1) as BrochurePage);
      } else if (dx > 0 && currentPage > 0) {
        onChangePage((currentPage - 1) as BrochurePage);
      }
    }
  };

  const isClosedCover = currentPage === 0 || currentPage === 4;
  const allowVerticalEdgeStrips = currentPage !== 2 && currentPage !== 3;

  const hideLiveDuringTurn =
    turnState !== null &&
    (turnState.mode === 'close-to-front' ||
      turnState.mode === 'close-to-back' ||
      turnState.mode === 'flip-cover-over');

  const pageLabels = isVi
    ? ['Bìa trước', 'Di sản & Mẫu', `Chọn mẫu (${totalOrderSets})`, 'Xác nhận đơn', 'Khoi Minh']
    : ['Cover', 'Heritage & 12', `Design (${totalOrderSets})`, 'Checkout', 'Khoi Minh'];

  const handleNextAction = () => {
    if (currentPage < 4) {
      onChangePage((currentPage + 1) as BrochurePage);
    } else {
      onChangePage(0);
    }
  };

  const handlePrevAction = () => {
    if (currentPage > 0) {
      onChangePage((currentPage - 1) as BrochurePage);
    }
  };

  // Render mặt bìa đơn (Trang 0 hoặc Trang 4) — tách LayoutGroup riêng để không xung đột layoutId với trang thật
  const renderClosedCoverSurface = (page: BrochurePage, groupKey: string) => (
    <LayoutGroup id={`ghost-cover-${groupKey}`}>
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden border border-[#C4942E]/40 bg-[#0B5268] ${
          page === 0
            ? 'rounded-r-[6px] rounded-l-[2px] border-l-[10px] border-l-[#062E3B]'
            : 'rounded-l-[6px] rounded-r-[2px] border-r-[10px] border-r-[#062E3B]'
        }`}
      >
        {page === 0 ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[5px] bg-gradient-to-l from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[5px] bg-gradient-to-r from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
          />
        )}
        <div className="flex h-full flex-col">{renderPage(page)}</div>
      </div>
    </LayoutGroup>
  );

  // Render CHÍNH XÁC nửa trang trái hoặc nửa trang phải của một trang mở đôi thật (Page 1, 2, hoặc 3)
  // bằng cách dựng khung 200% chiều rộng và neo đúng left:0 (nửa trái) hoặc left:-100% (nửa phải)
  const renderSpreadHalfSurface = (
    page: BrochurePage,
    side: 'left' | 'right',
    groupKey: string
  ) => (
    <LayoutGroup id={`ghost-half-${groupKey}`}>
      <div
        className={`relative h-full w-full overflow-hidden border border-[#C4942E]/35 bg-[#FAF8F3] ${
          side === 'left' ? 'rounded-l-[6px] border-r-0' : 'rounded-r-[6px] border-l-0'
        }`}
      >
        <div
          className={`absolute inset-y-0 flex w-[200%] flex-col overflow-hidden ${
            side === 'left' ? 'left-0' : '-left-full'
          }`}
        >
          <div className="flex flex-1 shrink-0 basis-auto flex-col">{renderPage(page)}</div>
        </div>

        {/* Gờ mép giấy ngoài cùng & bóng gáy giữa chân thực */}
        {side === 'left' ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[5px] bg-gradient-to-r from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-gradient-to-l from-[#061C26]/14 to-transparent"
            />
          </>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[5px] bg-gradient-to-l from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-6 bg-gradient-to-r from-[#061C26]/14 to-transparent"
            />
          </>
        )}
      </div>
    </LayoutGroup>
  );

  // Render nguyên trang cho hiệu ứng lật trên Mobile (không bao giờ hiện tờ trắng)
  const renderMobilePageSurface = (page: BrochurePage, groupKey: string) => {
    if (page === 0 || page === 4) {
      return renderClosedCoverSurface(page, groupKey);
    }
    return (
      <LayoutGroup id={`ghost-mobile-${groupKey}`}>
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[6px] border border-[#C4942E]/35 bg-[#FAF8F3]">
          <div className="flex flex-1 shrink-0 basis-auto flex-col">{renderPage(page)}</div>
        </div>
      </LayoutGroup>
    );
  };

  // Dựng cỗ máy lật 3D với 100% nội dung thật của từng mặt trang
  const renderTurningRig = (turn: TurnState) => {
    const { key, from, to, mode } = turn;

    if (mode === 'reduced-fade') {
      return null;
    }

    if (mode === 'mobile-forward' || mode === 'mobile-backward') {
      const isFromCover = from === 0 || from === 4;
      return (
        <div
          ref={rigRef}
          inert={true}
          aria-hidden="true"
          className="pointer-events-none select-none preserve-3d absolute inset-0 z-30 flex items-center justify-center"
        >
          <div
            ref={leafRef}
            className={`gpu-layer preserve-3d brochure-book-shadow absolute inset-y-0 mx-auto overflow-hidden rounded-[6px] ${
              isFromCover ? 'inset-x-0 max-w-[520px]' : 'inset-x-0'
            }`}
            style={{ transform: 'translateZ(2px)' }}
          >
            {renderMobilePageSurface(from, `mob-${key}-${from}`)}
            <div
              ref={frontShadeRef}
              className="pointer-events-none absolute inset-0 z-30 bg-[#061C26]/40 opacity-0"
            />
          </div>
        </div>
      );
    }

    if (mode === 'flip-cover-over') {
      return (
        <div
          inert={true}
          aria-hidden="true"
          className="pointer-events-none select-none preserve-3d absolute inset-0 z-30 flex items-center justify-center"
        >
          <div
            ref={rigRef}
            className="gpu-layer relative h-full w-full max-w-[520px] lg:w-1/2 lg:max-w-none"
          >
            <div ref={frontFaceRef} className="brochure-book-shadow absolute inset-0">
              {renderClosedCoverSurface(from, `flip-f-${key}`)}
              <div
                ref={frontShadeRef}
                className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-l from-[#061C26]/45 via-[#061C26]/12 to-transparent opacity-0"
              />
            </div>

            <div
              ref={backFaceRef}
              className="brochure-book-shadow invisible absolute inset-0 opacity-0"
              style={{ transform: 'scaleX(-1)' }}
            >
              {renderClosedCoverSurface(to, `flip-b-${key}`)}
              <div
                ref={backShadeRef}
                className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-[#061C26]/45 via-[#061C26]/12 to-transparent opacity-0"
              />
            </div>
          </div>
        </div>
      );
    }

    let leafSide: 'left' | 'right' = 'right';
    let leafFront: ReactNode = null;
    let leafBack: ReactNode = null;
    let staticUnderlaySide: 'left' | 'right' | null = null;
    let staticUnderlayContent: ReactNode = null;

    if (mode === 'open-cover') {
      leafSide = 'right';
      leafFront = renderClosedCoverSurface(from, `oc-f-${key}`);
      leafBack = renderSpreadHalfSurface(to, 'left', `oc-b-${key}`);
    } else if (mode === 'close-to-front') {
      staticUnderlaySide = 'right';
      staticUnderlayContent = renderSpreadHalfSurface(from, 'right', `cf-u-${key}`);
      leafSide = 'left';
      leafFront = renderSpreadHalfSurface(from, 'left', `cf-f-${key}`);
      leafBack = renderClosedCoverSurface(to, `cf-b-${key}`);
    } else if (mode === 'close-to-back') {
      staticUnderlaySide = 'left';
      staticUnderlayContent = renderSpreadHalfSurface(from, 'left', `cb-u-${key}`);
      leafSide = 'right';
      leafFront = renderSpreadHalfSurface(from, 'right', `cb-f-${key}`);
      leafBack = renderClosedCoverSurface(to, `cb-b-${key}`);
    } else if (mode === 'open-from-back') {
      leafSide = 'left';
      leafFront = renderClosedCoverSurface(from, `ob-f-${key}`);
      leafBack = renderSpreadHalfSurface(to, 'right', `ob-b-${key}`);
    } else if (mode === 'spread-forward') {
      // Nửa trái giữ nguyên nửa trái trang cũ (from) cho tới khi mặt sau lá lật đáp xuống
      staticUnderlaySide = 'left';
      staticUnderlayContent = renderSpreadHalfSurface(from, 'left', `sf-u-${key}`);
      leafSide = 'right';
      leafFront = renderSpreadHalfSurface(from, 'right', `sf-f-${key}`);
      leafBack = renderSpreadHalfSurface(to, 'left', `sf-b-${key}`);
    } else if (mode === 'spread-backward') {
      // Nửa phải giữ nguyên nửa phải trang cũ (from) cho tới khi mặt sau lá lật đáp xuống
      staticUnderlaySide = 'right';
      staticUnderlayContent = renderSpreadHalfSurface(from, 'right', `sb-u-${key}`);
      leafSide = 'left';
      leafFront = renderSpreadHalfSurface(from, 'left', `sb-f-${key}`);
      leafBack = renderSpreadHalfSurface(to, 'right', `sb-b-${key}`);
    }

    return (
      <div
        inert={true}
        aria-hidden="true"
        className="pointer-events-none select-none preserve-3d absolute inset-0 z-30"
      >
        <div ref={rigRef} className="gpu-layer preserve-3d relative h-full w-full">
          {/* Nửa trang cũ nằm tĩnh bên dưới trong lúc tờ bên kia đang lật qua */}
          {staticUnderlaySide && (
            <div
              className={`gpu-layer brochure-book-shadow absolute inset-y-0 w-1/2 ${
                staticUnderlaySide === 'left' ? 'left-0' : 'left-1/2'
              }`}
              style={{ transform: 'translateZ(0px)' }}
            >
              {staticUnderlayContent}
            </div>
          )}

          {/* Lá trang thật xoay 180 độ quanh gáy giữa — chuyển mặt đúng tại điểm 90° */}
          <div
            ref={leafRef}
            className={`gpu-layer absolute inset-y-0 z-20 w-1/2 ${
              leafSide === 'right' ? 'left-1/2' : 'left-0'
            }`}
          >
            {/* Mặt trước lá trang (nội dung thật của trang đang rời đi, 0° -> 90°) */}
            <div
              ref={frontFaceRef}
              className=" absolute inset-0 shadow-[0_22px_50px_-12px_rgba(6,28,38,0.48)]"
            >
              {leafFront}
              <div
                ref={frontShadeRef}
                className={`pointer-events-none absolute inset-0 z-30 opacity-0 ${
                  leafSide === 'right'
                    ? 'bg-gradient-to-r from-[#061C26]/42 via-[#061C26]/14 to-transparent'
                    : 'bg-gradient-to-l from-[#061C26]/42 via-[#061C26]/14 to-transparent'
                }`}
              />
            </div>

            {/* Mặt sau lá trang (nội dung thật của trang đích khi qua 90° -> 180°) */}
            <div
              ref={backFaceRef}
              className="invisible absolute inset-0 opacity-0 shadow-[0_22px_50px_-12px_rgba(6,28,38,0.48)]"
              style={{ transform: 'scaleX(-1)' }}
            >
              {leafBack}
              <div
                ref={backShadeRef}
                className={`pointer-events-none absolute inset-0 z-30 opacity-0 ${
                  leafSide === 'right'
                    ? 'bg-gradient-to-l from-[#061C26]/42 via-[#061C26]/14 to-transparent'
                    : 'bg-gradient-to-r from-[#061C26]/42 via-[#061C26]/14 to-transparent'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="brochure-desk relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Hoa văn Trống Đồng làm mờ dịu trên nền bàn */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src="images/brand/pattern-drum-teal.png"
          alt=""
          className="h-full w-full scale-105 object-cover opacity-[0.13] blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#EFECE3]/40 via-transparent to-[#D3CBB8]/45" />
      </div>

      {/* KHU VỰC ĐẶT ẤN PHẨM 3D GIỮA MÀN HÌNH */}
      <div
        className="brochure-stage relative flex min-h-0 flex-1 items-center justify-center px-2 py-2 sm:px-5 sm:py-2.5 lg:px-14"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Nút mũi tên lật trang tinh giản bên trái (Desktop) */}
        {currentPage > 0 && (
          <button
            type="button"
            onClick={handlePrevAction}
            aria-label={isVi ? 'Lật về trang trước' : 'Previous page'}
            title={isVi ? 'Trang trước (←)' : 'Previous page (←)'}
            className="hidden lg:flex absolute left-4 z-40 h-10 w-10 items-center justify-center rounded-full border border-[#C4942E]/35 bg-[#FAF8F3]/90 text-[#0B5268] shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:border-[#C4942E] hover:bg-white cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* KHUNG TỌA ĐỘ CHUẨN 1:2 (tối đa 1080x780: bìa 540px, mở đôi 1080px đồng nhất) */}
        <div
          ref={boundsRef}
          className="preserve-3d relative flex h-full max-h-[780px] w-full max-w-[1080px] items-center justify-center"
        >
          {/* QUYỂN BROCHURE TƯƠNG TÁC TRỰC TIẾP */}
          <LayoutGroup id="live-brochure-book">
            <div
              ref={liveBookRef}
              className={`brochure-book-shadow gpu-layer relative flex h-full flex-col overflow-hidden ${
                hideLiveDuringTurn
                  ? 'opacity-0 pointer-events-none'
                  : turnState
                    ? 'pointer-events-none'
                    : 'opacity-100'
              } ${
                isClosedCover
                  ? 'w-full max-w-[520px] border border-[#C4942E]/40 bg-[#0B5268] lg:w-1/2 lg:max-w-none'
                  : 'w-full rounded-[6px] border border-[#C4942E]/35 bg-[#FAF8F3]'
              } ${
                currentPage === 0
                  ? 'rounded-r-[6px] rounded-l-[2px] border-l-[10px] border-l-[#062E3B]'
                  : currentPage === 4
                    ? 'rounded-l-[6px] rounded-r-[2px] border-r-[10px] border-r-[#062E3B]'
                    : ''
              }`}
            >
              {/* Gờ mép giấy xếp chồng cạnh phải */}
              {(currentPage === 0 ||
                currentPage === 1 ||
                currentPage === 2 ||
                currentPage === 3) && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[5px] bg-gradient-to-l from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
                />
              )}

              {/* Gờ mép giấy xếp chồng cạnh trái */}
              {(currentPage === 4 ||
                currentPage === 1 ||
                currentPage === 2 ||
                currentPage === 3) && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[5px] bg-gradient-to-r from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
                />
              )}

              {/* Vùng cuộn bên trong trang */}
              <div
                ref={scrollContainerRef}
                className="brochure-page-scroll brochure-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
              >
                <div key={currentPage} className="flex flex-1 shrink-0 basis-auto flex-col">
                  {renderPage(currentPage)}
                </div>
              </div>

              {/* Mép trang bấm trực tiếp bên phải (ẩn ở Trang đặt hàng để tránh bấm nhầm) */}
              {allowVerticalEdgeStrips && currentPage < 4 && (
                <button
                  type="button"
                  onClick={handleNextAction}
                  aria-label={
                    isVi ? 'Bấm mép trang để lật sang trang sau' : 'Click page edge for next page'
                  }
                  title={isVi ? 'Lật sang trang sau →' : 'Next page →'}
                  className="group absolute inset-y-6 right-0 z-20 hidden w-6 items-center justify-end bg-gradient-to-l from-black/10 to-transparent opacity-0 transition-opacity hover:opacity-100 sm:flex cursor-pointer"
                >
                  <span className="mr-1 flex h-8 w-5 items-center justify-center rounded-l bg-[#FAF8F3]/90 text-[#0B5268] shadow">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              )}

              {/* Mép trang bấm trực tiếp bên trái (ẩn ở Trang đặt hàng để tránh bấm nhầm) */}
              {allowVerticalEdgeStrips && currentPage > 0 && (
                <button
                  type="button"
                  onClick={handlePrevAction}
                  aria-label={
                    isVi
                      ? 'Bấm mép trang để lật về trang trước'
                      : 'Click page edge for previous page'
                  }
                  title={isVi ? '← Lật về trang trước' : '← Previous page'}
                  className="group absolute inset-y-6 left-0 z-20 hidden w-6 items-center justify-start bg-gradient-to-r from-black/10 to-transparent opacity-0 transition-opacity hover:opacity-100 sm:flex cursor-pointer"
                >
                  <span className="ml-1 flex h-8 w-5 items-center justify-center rounded-r bg-[#FAF8F3]/90 text-[#0B5268] shadow">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </span>
                </button>
              )}
            </div>
          </LayoutGroup>

          {/* CỖ MÁY LẬT TRANG THẬT 3D GSAP (KHÔNG QUA TRANG TRẮNG) */}
          {turnState && renderTurningRig(turnState)}
        </div>

        {/* Nút mũi tên lật trang tinh giản bên phải (Desktop) */}
        <button
          type="button"
          onClick={handleNextAction}
          aria-label={
            currentPage < 4
              ? isVi
                ? 'Lật sang trang sau'
                : 'Next page'
              : isVi
                ? 'Lật về bìa trước'
                : 'Back to cover'
          }
          title={
            currentPage < 4
              ? isVi
                ? 'Trang sau (→)'
                : 'Next page (→)'
              : isVi
                ? 'Về bìa trước'
                : 'Back to cover'
          }
          className="hidden lg:flex absolute right-4 z-40 h-10 w-10 items-center justify-center rounded-full border border-[#C4942E]/35 bg-[#FAF8F3]/90 text-[#0B5268] shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:border-[#C4942E] hover:bg-white cursor-pointer"
        >
          {currentPage < 4 ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* FLOATING DOCK ĐIỀU HƯỚNG SÁCH KÍNH MỜ TRONG SUỐT TƯƠI SÁNG */}
      <div className="flex shrink-0 justify-center px-3 pb-2.5 pt-0.5 sm:px-6 sm:pb-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/65 px-2 py-1 text-slate-700 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <button
            type="button"
            onClick={handlePrevAction}
            disabled={currentPage === 0}
            aria-label={isVi ? 'Trang trước' : 'Previous page'}
            title={isVi ? 'Trang trước (←)' : 'Previous page (←)'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-900/8 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Desktop: 5 tab Floating Dock kính mờ sáng, chỉ trang đang chọn mới fill màu */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={isVi ? 'Các trang ấn phẩm' : 'Brochure pages'}
          >
            {([0, 1, 2, 3, 4] as BrochurePage[]).map((idx) => {
              const active = idx === currentPage;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangePage(idx)}
                  className={`relative z-10 rounded-lg px-3 py-1 text-[11.5px] transition-colors cursor-pointer ${
                    active
                      ? 'font-semibold text-[#083E50]'
                      : 'font-medium text-slate-700 hover:bg-slate-900/6 hover:text-slate-950'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="brochure-dock-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-lg bg-[#F3E79B] shadow-xs"
                    />
                  )}
                  {pageLabels[idx]}
                </button>
              );
            })}
          </nav>

          {/* Mobile: Chỉ báo trang & 5 chấm tròn */}
          <div className="flex items-center gap-2 px-1.5 md:hidden">
            <span className="text-[11px] font-semibold text-slate-800">
              {pageLabels[currentPage]} · {currentPage + 1}/5
            </span>
            <div className="flex items-center gap-1">
              {([0, 1, 2, 3, 4] as BrochurePage[]).map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangePage(idx)}
                  aria-label={`${isVi ? 'Trang' : 'Page'} ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentPage ? 'w-4 bg-[#083E50]' : 'w-2 bg-slate-400/50'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextAction}
            aria-label={
              currentPage < 4
                ? isVi
                  ? 'Trang sau'
                  : 'Next page'
                : isVi
                  ? 'Về bìa đầu'
                  : 'Back to cover'
            }
            title={
              currentPage < 4
                ? isVi
                  ? 'Trang sau (→)'
                  : 'Next page (→)'
                : isVi
                  ? 'Về bìa đầu'
                  : 'Back to cover'
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-900/8 cursor-pointer"
          >
            {currentPage < 4 ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
          </button>

          <span className="mx-0.5 h-4 w-px bg-slate-300/80" aria-hidden="true" />

          <div
            className="inline-flex items-center rounded-lg bg-slate-900/6 p-0.5 text-[10.5px] font-semibold"
            role="group"
            aria-label={isVi ? 'Chọn ngôn ngữ' : 'Language selector'}
          >
            <button
              type="button"
              onClick={() => onChangeLang('vi')}
              className={`rounded-md px-1.5 py-0.5 transition-colors cursor-pointer ${
                lang === 'vi'
                  ? 'bg-[#083E50] text-[#FAF8F3] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              VI
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`rounded-md px-1.5 py-0.5 transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#083E50] text-[#FAF8F3] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
