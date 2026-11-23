import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';

function useCanHoverPointer(): boolean {
  const reducedMotion = useReducedMotion();
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return canHover && !reducedMotion;
}

/* --------------------------------------------------------------------------
 * 1. TiltCard — Aceternity 3D Perspective Card + subtle antique gold glare
 * -------------------------------------------------------------------------- */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className = '', maxTilt = 5 }: TiltCardProps) {
  const canHover = useCanHoverPointer();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);

  const rotateX = useSpring(rawRotateX, { stiffness: 220, damping: 24, mass: 0.6 });
  const rotateY = useSpring(rawRotateY, { stiffness: 220, damping: 24, mass: 0.6 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rawRotateY.set((px - 0.5) * maxTilt * 2);
    rawRotateX.set((0.5 - py) * maxTilt * 2);
  };

  const handleMouseLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return (
    <div style={{ perspective: '1100px' }} className={className}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          canHover
            ? {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
            : undefined
        }
        className="relative h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * 2. SpotlightCard — Solid border & crisp elevation highlight on hover
 * -------------------------------------------------------------------------- */
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className = '',
}: SpotlightCardProps) {
  return (
    <div
      className={`group/spotlight relative overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-[#C4942E] ${className}`}
    >
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * 3. ShimmerButton — Solid brand color CTA with crisp metallic sweep
 * -------------------------------------------------------------------------- */
interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'gold' | 'teal';
  shimmer?: boolean;
}

export function ShimmerButton({
  children,
  className = '',
  variant = 'gold',
  shimmer = true,
  disabled,
  ...props
}: ShimmerButtonProps) {
  const variantClasses =
    variant === 'gold'
      ? 'bg-white text-[#083E50] border border-[#E5DEC9] shadow-[0_6px_18px_-6px_rgba(8,30,42,0.28)] hover:bg-[#F3E79B]'
      : 'bg-white text-[#083E50] border border-[#E5DEC9] shadow-[0_6px_18px_-6px_rgba(8,30,42,0.2)] hover:bg-[#F3E79B]';

  return (
    <button
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-semibold transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${variantClasses} ${className}`}
      {...props}
    >
      {!disabled && shimmer && (
        <span
          aria-hidden="true"
          className="km-shimmer-sweep pointer-events-none absolute inset-y-0 left-0 w-10 bg-white/20"
        />
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

/* --------------------------------------------------------------------------
 * 3b. GlossyLogo — Masked metallic gold sheen over transparent PNG logo
 * -------------------------------------------------------------------------- */
interface GlossyLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export function GlossyLogo({ src, alt, className = '' }: GlossyLogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`block brightness-115 contrast-110 drop-shadow-[0_2px_10px_rgba(232,213,158,0.42)] transition-[filter] duration-300 hover:brightness-125 ${className}`}
    />
  );
}

/* --------------------------------------------------------------------------
 * 4. LensImage — Aceternity Lens magnifier on fine pointer hover
 * -------------------------------------------------------------------------- */
interface LensImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  zoom?: number;
  badge?: ReactNode;
  hintLabel?: string;
}

export function LensImage({
  src,
  alt,
  className = '',
  imgClassName = 'object-cover',
  zoom = 1.85,
  badge,
  hintLabel,
}: LensImageProps) {
  const canHover = useCanHoverPointer();
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50, px: 0, py: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setPos({
      x: (px / rect.width) * 100,
      y: (py / rect.height) * 100,
      px,
      py,
    });
  };

  return (
    <div
      onMouseEnter={() => canHover && setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovering(false)}
      className={`relative overflow-hidden ${canHover ? 'cursor-zoom-in' : ''} ${className}`}
    >
      <img src={src} alt={alt} className={`h-full w-full ${imgClassName}`} />

      {badge}

      {canHover && hintLabel && !hovering && (
        <span className="pointer-events-none absolute right-2 bottom-2 rounded-md bg-[#083E50]/80 px-2 py-0.5 text-[9.5px] font-medium text-[#E8D59E] backdrop-blur-sm">
          {hintLabel}
        </span>
      )}

      <AnimatePresence>
        {canHover && hovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.72 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            aria-hidden="true"
            className="pointer-events-none absolute z-30 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#E8D59E]/90 shadow-[0_12px_28px_rgba(8,30,42,0.45)]"
            style={{
              left: pos.px,
              top: pos.py,
              backgroundImage: `url('${src}')`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
              backgroundPosition: `${pos.x}% ${pos.y}%`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * 5. SlidingTabs — Aceternity layoutId spring pill selector
 * -------------------------------------------------------------------------- */
export interface SlidingTabItem<T extends string> {
  value: T;
  label: ReactNode;
}

interface SlidingTabsProps<T extends string> {
  items: SlidingTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  pillClassName?: string;
}

export function SlidingTabs<T extends string>({
  items,
  value,
  onChange,
  layoutId,
  className = '',
  itemClassName = 'px-2.5 py-1 text-[11px] font-semibold',
  activeClassName = 'text-[#083E50]',
  inactiveClassName = 'text-[#645D4E] hover:text-[#0B5268]',
  pillClassName = 'bg-[#C4942E] shadow-sm',
}: SlidingTabsProps<T>) {
  return (
    <div className={`relative inline-flex items-center rounded-lg p-0.5 ${className}`}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`relative z-10 inline-flex items-center justify-center rounded-md transition-colors cursor-pointer ${itemClassName} ${
              active ? activeClassName : inactiveClassName
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                aria-hidden="true"
                className={`absolute inset-0 -z-10 rounded-[inherit] ${pillClassName}`}
              />
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * 6. HoverHighlightGrid — Aceternity card-hover-effect sliding background
 * -------------------------------------------------------------------------- */
interface HoverHighlightGridProps<T> {
  items: T[];
  selectedKey: string;
  getKey: (item: T) => string;
  onSelect: (item: T) => void;
  layoutId: string;
  className?: string;
  highlightClassName?: string;
  renderItem: (item: T, isSelected: boolean, isHovered: boolean) => ReactNode;
}

export function HoverHighlightGrid<T>({
  items,
  selectedKey,
  getKey,
  onSelect,
  layoutId,
  className = '',
  highlightClassName = 'bg-[#E8D59E]/25 border border-[#C4942E]/45',
  renderItem,
}: HoverHighlightGridProps<T>) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div className={className} onMouseLeave={() => setHoveredKey(null)}>
      {items.map((item) => {
        const key = getKey(item);
        const isSelected = key === selectedKey;
        const isHovered = key === hoveredKey;
        return (
          <div
            key={key}
            className="relative p-0.5"
            onMouseEnter={() => setHoveredKey(key)}
          >
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  layoutId={layoutId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.14 } }}
                  exit={{ opacity: 0, transition: { duration: 0.14, delay: 0.06 } }}
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-lg ${highlightClassName}`}
                />
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className="relative z-10 block w-full text-left cursor-pointer"
            >
              {renderItem(item, isSelected, isHovered)}
            </button>
          </div>
        );
      })}
    </div>
  );
}
