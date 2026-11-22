import gsap from 'gsap';
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

export type BrochurePage = 0 | 1 | 2 | 3;

interface BrochureBookProps {
  currentPage: BrochurePage;
  onChangePage: (page: BrochurePage) => void;
  lang: Language;
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

  if (from === 0 && (to === 1 || to === 2)) return 'open-cover';
  if ((from === 1 || from === 2) && to === 0) return 'close-to-front';
  if (from === 1 && to === 2) return 'spread-forward';
  if (from === 2 && to === 1) return 'spread-backward';
  if ((from === 1 || from === 2) && to === 3) return 'close-to-back';
  if (from === 3 && (to === 1 || to === 2)) return 'open-from-back';
  if ((from === 0 && to === 3) || (from === 3 && to === 0)) return 'flip-cover-over';

  return to > from ? 'spread-forward' : 'spread-backward';
}

export function BrochureBook({
  currentPage,
  onChangePage,
  lang,
  totalOrderSets,
  renderPage,
}: BrochureBookProps) {
  const isVi = lang === 'vi';
  const [turnState, setTurnState] = useState<TurnState | null>(null);

  const prevPageRef = useRef<BrochurePage>(currentPage);
  const turnSeqRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; ignore: boolean } | null>(null);

  // GSAP refs cho cỗ máy lật trang 3D nhẹ 60fps
  const boundsRef = useRef<HTMLDivElement>(null);
  const liveBookRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const underlayRef = useRef<HTMLDivElement>(null);
  const frontShadeRef = useRef<HTMLDivElement>(null);
  const backShadeRef = useRef<HTMLDivElement>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Phát hiện chuyển trang trước khi trình duyệt paint để triệt tiêu nháy khung hình
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

  // Chạy timeline GSAP đồng bộ mượt 60fps — không clone DOM nặng của các trang đặt hàng
  useLayoutEffect(() => {
    if (!turnState || !boundsRef.current) return;

    const liveBook = liveBookRef.current;
    const rig = rigRef.current;
    const leaf = leafRef.current;
    const underlay = underlayRef.current;
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

      const { mode, to } = turnState;

      if (mode === 'reduced-fade') {
        if (liveBook) {
          tl.fromTo(
            liveBook,
            { opacity: 0.35 },
            { opacity: 1, duration: 0.18, ease: 'power2.out' }
          );
        } else {
          tl.to({}, { duration: 0.05 });
        }
        return;
      }

      if (mode === 'mobile-forward' || mode === 'mobile-backward') {
        const forward = mode === 'mobile-forward';
        if (liveBook) {
          tl.fromTo(
            liveBook,
            { scale: 0.98, opacity: 0.88 },
            { scale: 1, opacity: 1, duration: 0.44, ease: 'power3.out' },
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
            { rotateY: forward ? -96 : 96, duration: 0.44, ease: 'power3.inOut' },
            0
          );
          tl.to(leaf, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0.24);
        }
        return;
      }

      if (mode === 'flip-cover-over' && rig) {
        const rotTarget = to === 0 ? 180 : -180;
        gsap.set(rig, { transformOrigin: '50% 50%' });
        tl.fromTo(
          rig,
          { rotateY: 0, scale: 1 },
          { rotateY: rotTarget, duration: 0.7, ease: 'power2.inOut' },
          0
        )
          .to(rig, { scale: 0.965, duration: 0.34, ease: 'power2.out' }, 0)
          .to(rig, { scale: 1, duration: 0.36, ease: 'power2.inOut' }, 0.34);

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.24, duration: 0.34 }, 0);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.22 }, { opacity: 0, duration: 0.36 }, 0.34);
        }
        return;
      }

      if (mode === 'open-cover' && rig && leaf && liveBook) {
        const dur = 0.72;
        gsap.set(leaf, { transformOrigin: 'left center' });
        gsap.set(liveBook, {
          xPercent: -25,
          clipPath: 'inset(0% 0% 0% 50%)',
        });

        tl.to(liveBook, { xPercent: 0, duration: dur, ease: 'power3.inOut' }, 0)
          .fromTo(
            rig,
            { xPercent: -25 },
            { xPercent: 0, duration: dur, ease: 'power3.inOut' },
            0
          )
          .fromTo(
            leaf,
            { rotateY: 0 },
            { rotateY: -180, duration: dur, ease: 'power3.inOut' },
            0
          )
          .to(
            liveBook,
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.26, ease: 'power2.out' },
            0.38
          )
          .to(leaf, { opacity: 0, duration: 0.18, ease: 'power2.out' }, 0.54);

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.24, duration: 0.34 }, 0);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.22 }, { opacity: 0, duration: 0.34 }, 0.34);
        }
        return;
      }

      if (mode === 'open-from-back' && rig && leaf && liveBook) {
        const dur = 0.72;
        gsap.set(leaf, { transformOrigin: 'right center' });
        gsap.set(liveBook, {
          xPercent: 25,
          clipPath: 'inset(0% 50% 0% 0%)',
        });

        tl.to(liveBook, { xPercent: 0, duration: dur, ease: 'power3.inOut' }, 0)
          .fromTo(
            rig,
            { xPercent: 25 },
            { xPercent: 0, duration: dur, ease: 'power3.inOut' },
            0
          )
          .fromTo(
            leaf,
            { rotateY: 0 },
            { rotateY: 180, duration: dur, ease: 'power3.inOut' },
            0
          )
          .to(
            liveBook,
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.26, ease: 'power2.out' },
            0.38
          )
          .to(leaf, { opacity: 0, duration: 0.18, ease: 'power2.out' }, 0.54);

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.24, duration: 0.34 }, 0);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.22 }, { opacity: 0, duration: 0.34 }, 0.34);
        }
        return;
      }

      if (mode === 'close-to-front' && rig && leaf) {
        const dur = 0.7;
        gsap.set(leaf, { transformOrigin: 'right center' });
        tl.fromTo(
          rig,
          { xPercent: 0 },
          { xPercent: -25, duration: dur, ease: 'power3.inOut' },
          0
        ).fromTo(
          leaf,
          { rotateY: 0 },
          { rotateY: 180, duration: dur, ease: 'power3.inOut' },
          0
        );

        if (underlay) {
          tl.fromTo(
            underlay,
            { opacity: 0.92 },
            { opacity: 0, duration: 0.38, ease: 'power1.in' },
            0.14
          );
        }
        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.24, duration: 0.33 }, 0);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.22 }, { opacity: 0, duration: 0.35 }, 0.35);
        }
        return;
      }

      if (mode === 'close-to-back' && rig && leaf) {
        const dur = 0.7;
        gsap.set(leaf, { transformOrigin: 'left center' });
        tl.fromTo(
          rig,
          { xPercent: 0 },
          { xPercent: 25, duration: dur, ease: 'power3.inOut' },
          0
        ).fromTo(
          leaf,
          { rotateY: 0 },
          { rotateY: -180, duration: dur, ease: 'power3.inOut' },
          0
        );

        if (underlay) {
          tl.fromTo(
            underlay,
            { opacity: 0.92 },
            { opacity: 0, duration: 0.37, ease: 'power1.in' },
            0.15
          );
        }
        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.24, duration: 0.33 }, 0);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.22 }, { opacity: 0, duration: 0.35 }, 0.35);
        }
        return;
      }

      // Chuyển giữa 2 trang mở (spread-forward / spread-backward): 1 lá giấy cotton nhẹ nhàng
      const isForward = mode === 'spread-forward';
      if (liveBook) {
        tl.fromTo(
          liveBook,
          { opacity: 0.92, scale: 0.992 },
          { opacity: 1, scale: 1, duration: 0.52, ease: 'power2.out' },
          0
        );
      }
      if (leaf) {
        gsap.set(leaf, {
          transformOrigin: isForward ? 'left center' : 'right center',
        });
        tl.fromTo(
          leaf,
          { rotateY: 0 },
          { rotateY: isForward ? -180 : 180, duration: 0.6, ease: 'power2.inOut' },
          0
        ).to(leaf, { opacity: 0, duration: 0.14, ease: 'power2.out' }, 0.46);

        if (frontShade) {
          tl.fromTo(frontShade, { opacity: 0 }, { opacity: 0.2, duration: 0.28 }, 0);
        }
        if (backShade) {
          tl.fromTo(backShade, { opacity: 0.18 }, { opacity: 0, duration: 0.3 }, 0.3);
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
      if (e.key === 'ArrowRight' && currentPage < 3) {
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
      if (dx < 0 && currentPage < 3) {
        onChangePage((currentPage + 1) as BrochurePage);
      } else if (dx > 0 && currentPage > 0) {
        onChangePage((currentPage - 1) as BrochurePage);
      }
    }
  };

  const isClosedCover = currentPage === 0 || currentPage === 3;
  const allowVerticalEdgeStrips = currentPage !== 2;

  const hideLiveDuringTurn =
    turnState !== null &&
    (turnState.mode === 'close-to-front' ||
      turnState.mode === 'close-to-back' ||
      turnState.mode === 'flip-cover-over');

  const pageLabels = isVi
    ? ['Bìa trước', 'Di sản & Mẫu', `Đặt hàng (${totalOrderSets})`, 'Khoi Minh']
    : ['Cover', 'Heritage & 11', `Order (${totalOrderSets})`, 'Khoi Minh'];

  const handleNextAction = () => {
    if (currentPage < 3) {
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

  // Bìa cứng đơn gọn nhẹ (chỉ dùng cho Trang 0 hoặc Trang 3)
  const renderClosedCoverSurface = (page: BrochurePage) => (
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
  );

  // Tờ giấy cotton ngà nhẹ thay cho việc nhân đôi DOM nặng nề
  const renderLinenSheetSurface = (side: 'left' | 'right', tone: 'front' | 'back') => (
    <div
      className={`relative h-full w-full overflow-hidden border border-[#C4942E]/30 ${
        tone === 'front' ? 'bg-[#F3EFE5]' : 'bg-[#ECE7DA]'
      } ${side === 'left' ? 'rounded-l-[6px] border-r-0' : 'rounded-r-[6px] border-l-0'}`}
    >
      {side === 'left' ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-[5px] bg-gradient-to-r from-[#E8E2D2] via-[#CFC6B2] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#061C26]/10 to-transparent"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[5px] bg-gradient-to-l from-[#E8E2D2] via-[#CFC6B2] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#061C26]/10 to-transparent"
          />
        </>
      )}
    </div>
  );

  // Render lớp hiệu ứng lật trang GSAP nhẹ (chỉ render cover hoặc lá giấy cotton)
  const renderTurningRig = (turn: TurnState) => {
    const { from, to, mode } = turn;

    if (mode === 'reduced-fade') {
      return null;
    }

    if (mode === 'mobile-forward' || mode === 'mobile-backward') {
      const isFromCover = from === 0 || from === 3;
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
              isFromCover
                ? 'inset-x-0 max-w-[560px]'
                : 'inset-x-0 border border-[#C4942E]/35 bg-[#F3EFE5]'
            }`}
            style={{ transform: 'translateZ(2px)' }}
          >
            {isFromCover ? (
              renderClosedCoverSurface(from)
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-[#F5F2EA] to-[#EAE4D6]" />
            )}
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
            className="gpu-layer preserve-3d brochure-book-shadow relative h-full w-full max-w-[560px] lg:w-1/2 lg:max-w-none"
          >
            <div
              className="backface-hidden absolute inset-0"
              style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
            >
              {renderClosedCoverSurface(from)}
              <div
                ref={frontShadeRef}
                className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-l from-[#061C26]/45 via-[#061C26]/10 to-transparent opacity-0"
              />
            </div>

            <div
              className="backface-hidden absolute inset-0"
              style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
            >
              {renderClosedCoverSurface(to)}
              <div
                ref={backShadeRef}
                className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-[#061C26]/45 via-[#061C26]/10 to-transparent opacity-0"
              />
            </div>
          </div>
        </div>
      );
    }

    // 4 chế độ đóng / mở bìa & 2 chế độ lật giữa hai trang mở đôi
    let leafSide: 'left' | 'right' = 'right';
    let leafFront: ReactNode = null;
    let leafBack: ReactNode = null;
    let underlaySide: 'left' | 'right' | null = null;

    if (mode === 'open-cover') {
      leafSide = 'right';
      leafFront = renderClosedCoverSurface(from);
      leafBack = renderLinenSheetSurface('left', 'back');
    } else if (mode === 'close-to-front') {
      underlaySide = 'right';
      leafSide = 'left';
      leafFront = renderLinenSheetSurface('left', 'front');
      leafBack = renderClosedCoverSurface(to);
    } else if (mode === 'close-to-back') {
      underlaySide = 'left';
      leafSide = 'right';
      leafFront = renderLinenSheetSurface('right', 'front');
      leafBack = renderClosedCoverSurface(to);
    } else if (mode === 'open-from-back') {
      leafSide = 'left';
      leafFront = renderClosedCoverSurface(from);
      leafBack = renderLinenSheetSurface('right', 'back');
    } else if (mode === 'spread-forward') {
      leafSide = 'right';
      leafFront = renderLinenSheetSurface('right', 'front');
      leafBack = renderLinenSheetSurface('left', 'back');
    } else if (mode === 'spread-backward') {
      leafSide = 'left';
      leafFront = renderLinenSheetSurface('left', 'front');
      leafBack = renderLinenSheetSurface('right', 'back');
    }

    const leafShouldCastShadow =
      mode === 'close-to-back' ||
      mode === 'close-to-front' ||
      mode === 'open-cover' ||
      mode === 'open-from-back';

    return (
      <div
        inert={true}
        aria-hidden="true"
        className="pointer-events-none select-none preserve-3d absolute inset-0 z-30"
      >
        <div ref={rigRef} className="gpu-layer preserve-3d relative h-full w-full">
          {/* Nền giấy lót nhẹ tránh hở mép & tránh nhân đôi bóng ở bìa cuối/đầu */}
          {underlaySide && (
            <div
              ref={underlayRef}
              className={`gpu-layer absolute inset-y-0 w-1/2 ${
                underlaySide === 'left' ? 'left-0' : 'left-1/2'
              }`}
              style={{ transform: 'translateZ(-1px)' }}
            >
              {renderLinenSheetSurface(underlaySide, 'front')}
            </div>
          )}

          {/* Lá trang xoay quanh gáy giữa */}
          <div
            ref={leafRef}
            className={`gpu-layer preserve-3d absolute inset-y-0 w-1/2 ${
              leafShouldCastShadow ? 'brochure-book-shadow' : 'shadow-lg'
            } ${leafSide === 'right' ? 'left-1/2' : 'left-0'}`}
          >
            {/* Mặt trước lá trang */}
            <div
              className="backface-hidden absolute inset-0"
              style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
            >
              {leafFront}
              <div
                ref={frontShadeRef}
                className={`pointer-events-none absolute inset-0 z-30 opacity-0 ${
                  leafSide === 'right'
                    ? 'bg-gradient-to-r from-[#061C26]/45 via-[#061C26]/12 to-transparent'
                    : 'bg-gradient-to-l from-[#061C26]/45 via-[#061C26]/12 to-transparent'
                }`}
              />
            </div>

            {/* Mặt sau lá trang */}
            <div
              className="backface-hidden absolute inset-0"
              style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
            >
              {leafBack}
              <div
                ref={backShadeRef}
                className={`pointer-events-none absolute inset-0 z-30 opacity-0 ${
                  leafSide === 'right'
                    ? 'bg-gradient-to-l from-[#061C26]/45 via-[#061C26]/12 to-transparent'
                    : 'bg-gradient-to-r from-[#061C26]/45 via-[#061C26]/12 to-transparent'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="brochure-desk relative flex min-h-0 flex-1 flex-col">
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

        {/* KHUNG TỌA ĐỘ CHUẨN 1:2 (tối đa 1200x760, giữ không gian preserve-3d sạch) */}
        <div
          ref={boundsRef}
          className="preserve-3d relative flex h-full max-h-[760px] w-full max-w-[1200px] items-center justify-center"
        >
          {/* QUYỂN BROCHURE TƯƠNG TÁC TRỰC TIẾP (chỉ mount 1 lần) */}
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
                ? 'w-full max-w-[560px] border border-[#C4942E]/40 bg-[#0B5268] lg:w-1/2 lg:max-w-none'
                : 'w-full rounded-[6px] border border-[#C4942E]/35 bg-[#FAF8F3]'
            } ${
              currentPage === 0
                ? 'rounded-r-[6px] rounded-l-[2px] border-l-[10px] border-l-[#062E3B]'
                : currentPage === 3
                  ? 'rounded-l-[6px] rounded-r-[2px] border-r-[10px] border-r-[#062E3B]'
                  : ''
            }`}
          >
            {/* Gờ mép giấy xếp chồng cạnh phải */}
            {(currentPage === 0 || currentPage === 1 || currentPage === 2) && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[5px] bg-gradient-to-l from-[#E8E2D2] via-[#CFC6B2] to-[#9B907A]/60"
              />
            )}

            {/* Gờ mép giấy xếp chồng cạnh trái */}
            {(currentPage === 3 || currentPage === 1 || currentPage === 2) && (
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
            {allowVerticalEdgeStrips && currentPage < 3 && (
              <button
                type="button"
                onClick={handleNextAction}
                aria-label={isVi ? 'Bấm mép trang để lật sang trang sau' : 'Click page edge for next page'}
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
                aria-label={isVi ? 'Bấm mép trang để lật về trang trước' : 'Click page edge for previous page'}
                title={isVi ? '← Lật về trang trước' : '← Previous page'}
                className="group absolute inset-y-6 left-0 z-20 hidden w-6 items-center justify-start bg-gradient-to-r from-black/10 to-transparent opacity-0 transition-opacity hover:opacity-100 sm:flex cursor-pointer"
              >
                <span className="ml-1 flex h-8 w-5 items-center justify-center rounded-r bg-[#FAF8F3]/90 text-[#0B5268] shadow">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </span>
              </button>
            )}
          </div>

          {/* CỖ MÁY LẬT TRANG 3D GSAP */}
          {turnState && renderTurningRig(turnState)}
        </div>

        {/* Nút mũi tên lật trang tinh giản bên phải (Desktop) */}
        <button
          type="button"
          onClick={handleNextAction}
          aria-label={
            currentPage < 3
              ? isVi
                ? 'Lật sang trang sau'
                : 'Next page'
              : isVi
                ? 'Lật về bìa trước'
                : 'Back to cover'
          }
          title={
            currentPage < 3
              ? isVi
                ? 'Trang sau (→)'
                : 'Next page (→)'
              : isVi
                ? 'Về bìa trước'
                : 'Back to cover'
          }
          className="hidden lg:flex absolute right-4 z-40 h-10 w-10 items-center justify-center rounded-full border border-[#C4942E]/35 bg-[#FAF8F3]/90 text-[#0B5268] shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:border-[#C4942E] hover:bg-white cursor-pointer"
        >
          {currentPage < 3 ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* THANH PILL ĐIỀU HƯỚNG SÁCH NỔI NHẸ TRÊN MẶT BÀN */}
      <div className="flex shrink-0 justify-center px-3 pb-2.5 pt-0.5 sm:px-6 sm:pb-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C4942E]/25 bg-[#FAF8F3]/88 px-2 py-1 shadow-[0_6px_20px_-8px_rgba(8,30,42,0.22)] backdrop-blur-md">
          <button
            type="button"
            onClick={handlePrevAction}
            disabled={currentPage === 0}
            aria-label={isVi ? 'Trang trước' : 'Previous page'}
            title={isVi ? 'Trang trước (←)' : 'Previous page (←)'}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#0B5268] transition-colors hover:bg-[#0B5268]/8 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Desktop: 4 tab tinh gọn */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label={isVi ? 'Các trang ấn phẩm' : 'Brochure pages'}
          >
            {([0, 1, 2, 3] as BrochurePage[]).map((idx) => {
              const active = idx === currentPage;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangePage(idx)}
                  className={`rounded-full px-2.5 py-1 text-[11.5px] transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0B5268] font-semibold text-[#FAF8F3] shadow-2xs'
                      : 'font-medium text-[#5A5448] hover:bg-[#0B5268]/8 hover:text-[#0B5268]'
                  }`}
                >
                  {pageLabels[idx]}
                </button>
              );
            })}
          </nav>

          {/* Mobile: Chỉ báo trang & 4 chấm tròn */}
          <div className="flex items-center gap-2 px-1.5 md:hidden">
            <span className="text-[11px] font-semibold text-[#0B5268]">
              {pageLabels[currentPage]} · {currentPage + 1}/4
            </span>
            <div className="flex items-center gap-1">
              {([0, 1, 2, 3] as BrochurePage[]).map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangePage(idx)}
                  aria-label={`${isVi ? 'Trang' : 'Page'} ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentPage ? 'w-4 bg-[#0B5268]' : 'w-2 bg-[#0B5268]/25'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextAction}
            aria-label={
              currentPage < 3
                ? isVi
                  ? 'Trang sau'
                  : 'Next page'
                : isVi
                  ? 'Về bìa đầu'
                  : 'Back to cover'
            }
            title={
              currentPage < 3
                ? isVi
                  ? 'Trang sau (→)'
                  : 'Next page (→)'
                : isVi
                  ? 'Về bìa đầu'
                  : 'Back to cover'
            }
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B5268] text-[#FAF8F3] transition-colors hover:bg-[#083E50] cursor-pointer"
          >
            {currentPage < 3 ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
