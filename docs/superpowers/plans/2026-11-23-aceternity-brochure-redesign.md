# Một Lát Đông Sơn — Aceternity Brochure Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all 4 brochure pages and navigation shell of `mlds` with Aceternity UI-inspired micro-interactions (`TiltCard`, `SpotlightCard`, `ShimmerButton`, `HoverHighlightGrid`, `LensImage`, `SlidingTabs`) while preserving the 3D GSAP brochure engine, brand palette, and all ordering logic.

**Architecture:** Install `motion` (`motion/react`) and wrap `App` in `<MotionConfig reducedMotion="user">` so all Aceternity-style springs and `layoutId` transitions respect accessibility. Build a focused, reusable `src/components/ui/aceternity.tsx` primitive module, then redesign `Navbar` + `BrochureBook` floating dock, `Hero` (Page 0), `StorySection` + `InsideSpread` (Page 1), `ProductConfigurator` (Page 2), and `Footer` (Page 3) without altering `src/data/catalog.ts` business logic or GSAP's 3D page-flip nodes.

**Tech Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · `motion` (`motion/react`) · `gsap` · `lucide-react` · `oxlint`

**Spec:** `docs/superpowers/specs/2026-11-23-aceternity-brochure-redesign-design.md`

## Global Constraints
- Palette locked to PDF brand tokens: `--km-teal: #0B5268`, `--km-teal-header: #094558`, `--km-teal-deep: #083E50`, `--km-gold: #C4942E`, `--km-gold-bright: #D5A640`, `--km-gold-pale: #E8D59E`, `--km-paper-bg: #E8E5DB`, `--km-atelier-bg: #F5F2EA`, `--km-ink: #2B2823`.
- `pattern-drum-teal.png` MUST appear on `Hero`, right side of `InsideSpread`, and `ProductConfigurator` frame; MUST NOT appear on `Footer`.
- Single `VI | EN` language switcher in `Navbar` only.
- All image paths must remain relative (`images/...` or `./images/...`) for `base: './'` GitHub Pages deployment.
- Keep `formatEngravingForWorkshop` behavior (`F08`/`F09` uppercase) and all `OrderSet` / `submitOrderToEmail` / Zalo / Messenger flows intact.
- Do not attach conflicting `motion` transforms to GSAP's `rigRef` / `leafRef` / `underlayRef` DOM nodes in `BrochureBook.tsx`.

## Review Focus
- `TiltCard` and `LensImage` on touch/mobile (`pointer: coarse`) must gracefully disable hover-only pointer tracking so scrolling and tapping never stick or jitter.
- `prefers-reduced-motion: reduce` must disable shimmer sweeps, 3D tilt, and spring translations via `MotionConfig reducedMotion="user"` and CSS media query.
- Rapidly clicking `Navbar` or `FloatingDock` page buttons mid-flip must not leave `layoutId` pills or GSAP page-flip states out of sync.
- `ProductConfigurator` Step 1 multi-set tabs (`1–20` sets), laser-engraving live wood preview, and Step 2 form validation/submission must remain 100% functional on both `vi` and `en`.
- `LensImage` and `HoverHighlightGrid` must never clip tooltips/badges or cause horizontal overflow inside the fixed `max-w-[1200px]` brochure frame.

---

### Task 1: Install `motion`, Add Shimmer CSS & Build Aceternity Primitives

**Files:**
- Modify: `package.json`
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Create: `src/components/ui/aceternity.tsx`

**Interfaces:**
- Produces in `src/components/ui/aceternity.tsx`:
  - `TiltCard({ children, className, maxTilt?: number })`
  - `SpotlightCard({ children, className, spotlightColor?: string })`
  - `ShimmerButton({ children, className, variant?: 'gold' | 'teal', ...buttonProps })`
  - `LensImage({ src, alt, className, imgClassName, zoom?: number, badge?: ReactNode })`
  - `SlidingTabs<T extends string>({ items, value, onChange, layoutId, className, itemClassName, activeClassName, inactiveClassName })`
  - `HoverHighlightGrid<T>({ items, selectedKey, getKey, onSelect, layoutId, className, renderItem })`

- [ ] **Step 1: Install `motion` package**
  Run: `npm install motion` in `/Users/m1/mlds`
  Expected: `motion` added to `package.json` dependencies cleanly.

- [ ] **Step 2: Add subtle metallic shimmer keyframes & reduced-motion guard to `src/index.css`**
  Add `@keyframes km-shimmer` and `.km-shimmer-sweep` utility with `@media (prefers-reduced-motion: reduce)` fallback.

- [ ] **Step 3: Create `src/components/ui/aceternity.tsx`**
  Implement `TiltCard`, `SpotlightCard`, `ShimmerButton`, `LensImage`, `SlidingTabs`, and `HoverHighlightGrid` using `motion/react` (`useMotionValue`, `useSpring`, `useMotionTemplate`, `motion.div`, `motion.span`, `AnimatePresence`). Ensure coarse-pointer detection (`window.matchMedia('(pointer: coarse)')`) disables pointer-tracking tilt/lens on touch devices.

- [ ] **Step 4: Wrap `App` in `<MotionConfig reducedMotion="user">` in `src/App.tsx`**
  Import `MotionConfig` from `motion/react` and wrap the root container.

- [ ] **Step 5: Verify build & lint**
  Run: `npm run lint && npm run build`
  Expected: 0 errors.

---

### Task 2: Redesign `Navbar.tsx` & `BrochureBook.tsx` Floating Dock

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/BrochureBook.tsx`

**Interfaces:**
- Consumes: `SlidingTabs` (or `motion.span` with `layoutId`) from `src/components/ui/aceternity.tsx`
- Preserves: `NavbarProps`, `BrochureBookProps`, `BrochurePage` type, all GSAP refs (`rigRef`, `leafRef`, `underlayRef`, `frontShadeRef`, `backShadeRef`)

- [ ] **Step 1: Redesign `Navbar.tsx`**
  Add frosted petrol header (`bg-[#094558]/95 backdrop-blur-md`), smooth sliding active underline (`layoutId="navbar-active-indicator"`), animated `VI | EN` pill toggle (`layoutId="navbar-lang-pill"`), and refined order CTA button with subtle gold border glow.

- [ ] **Step 2: Upgrade `BrochureBook.tsx` bottom navigation to Aceternity Floating Dock**
  Keep the GSAP 3D page-flip logic untouched. Replace the bottom pill bar with a glassmorphic `FloatingDock` (`bg-[#083E50]/90 backdrop-blur-md border border-[#C4942E]/35`) featuring `layoutId="brochure-dock-pill"` active indicator, crisp icons + short labels, and hover elevation on desktop.

- [ ] **Step 3: Verify build & lint**
  Run: `npm run lint && npm run build`
  Expected: 0 errors.

---

### Task 3: Redesign Page 0 — `Hero.tsx` (Front Cover)

**Files:**
- Modify: `src/components/Hero.tsx`

**Interfaces:**
- Consumes: `TiltCard`, `ShimmerButton` from `src/components/ui/aceternity.tsx`
- Preserves: `HeroProps` (`lang`, `onOpenBrochure`), `pattern-drum-teal.png`, `hero-drum-art.png`, `title-mot-lat-dong-son.png`, `logo-stacked.png`

- [ ] **Step 1: Redesign `Hero.tsx`**
  - Double-hairline antique gold book-cover frame with subtle corner accents.
  - Wrap `hero-drum-art.png` in `TiltCard` (`maxTilt={5}`) with soft gold specular glare.
  - Present `title-mot-lat-dong-son.png`, concise bilingual subtitle, 3 heritage stamp pills (`11 Lát Cắt` · `Đồng & Mạ Vàng 24K` · `Khắc Laser Riêng`), and `ShimmerButton` for *"Mở ấn phẩm / Open Brochure"*.
  - Clean footer lockup with `logo-stacked.png` and subtle page-turn hint.

- [ ] **Step 2: Verify build & lint**
  Run: `npm run lint && npm run build`
  Expected: 0 errors.

---

### Task 4: Redesign Page 1 — `StorySection.tsx` & `InsideSpread.tsx` (Inside Spread)

**Files:**
- Modify: `src/components/StorySection.tsx`
- Modify: `src/components/InsideSpread.tsx`

**Interfaces:**
- Consumes: `SpotlightCard`, `LensImage`, `SlidingTabs`, `HoverHighlightGrid`, `ShimmerButton` from `src/components/ui/aceternity.tsx`
- Preserves: `StorySectionProps`, `InsideSpreadProps`

- [ ] **Step 1: Redesign `StorySection.tsx`**
  Refine editorial magazine rhythm on `paper-texture.jpg`: crisp header lockup (`title-van-minh-dong-son.png` + `illust-dancers.png`), subtle `motion.div` staggered reveal for the 3 heritage blocks, framed vector illustrations (`illust-chim-lac.png`, `illust-drum-line.png`) with delicate hairline borders.

- [ ] **Step 2: Redesign `InsideSpread.tsx`**
  - Keep left `StorySection` + center spine + right `pattern-drum-teal.png` showcase.
  - Upgrade the featured preview card into `SpotlightCard` with `LensImage` (magnifier zoom on desktop to inspect brass/24K gold engraving details), `SlidingTabs` for `Đồng` / `Mạ Vàng 24K`, and `ShimmerButton` for *"Tùy biến & Đặt mua mẫu này"*.
  - Upgrade the 11-design selector to `HoverHighlightGrid` with smooth `layoutId="spread-hover-bg"` highlight following the cursor and crisp active gold ring.

- [ ] **Step 3: Verify build & lint**
  Run: `npm run lint && npm run build`
  Expected: 0 errors.

---

### Task 5: Redesign Page 2 — `ProductConfigurator.tsx` (2-Step Atelier Order)

**Files:**
- Modify: `src/components/ProductConfigurator.tsx`

**Interfaces:**
- Consumes: `SpotlightCard`, `LensImage`, `SlidingTabs`, `HoverHighlightGrid`, `ShimmerButton` from `src/components/ui/aceternity.tsx`
- Preserves: `ProductConfiguratorProps`, all `OrderSet` handlers, `submitOrderToEmail`, `ENGRAVING_FONTS`, `formatEngravingForWorkshop`, Zalo/Messenger copy-and-open flows, corporate link to Page 3.

- [ ] **Step 1: Redesign Atelier header, step indicator & Step 1 quantity/set bar**
  - Clean Atelier header with `SlidingTabs` for Step 1 ↔ Step 2 and live order summary pill.
  - Flat, cohesive `01 · Số lượng bộ` bar with quick-select pills, `- / +` stepper, and `OrderSet` tabs with smooth `layoutId` active indicator + *Áp dụng cho tất cả* action.

- [ ] **Step 2: Redesign Step 1 6/6 Studio Grid**
  - Left column: `SpotlightCard` + `LensImage` large product preview + compact 11-design `HoverHighlightGrid` (`layoutId="config-hover-bg"`).
  - Right column: Clearly tiered `02 Chất liệu`, `03 Đế gỗ trưng bày`, `04 Nội dung khắc & Font chữ` with refined active cards, crisp `.wood-grain-surface` live laser-engraving preview (plus real-sample lightbox), and `SlidingTabs` for the 3 font categories (`Cổ điển`, `Thư họa`, `Hiện đại`).

- [ ] **Step 3: Redesign Step 2 Checkout & Confirmed Order Card**
  - Balanced 2-column layout: Customer Info form with clean `#0B5268` focus states on the left, **Atelier Folio Receipt** summary + `ShimmerButton` submit CTA on the right.
  - Refined **Order Confirmed (`#KM-MMDD-XXXX`)** card with Messenger, Zalo, Copy, and `mailto:` fallback actions.

- [ ] **Step 4: Verify build & lint**
  Run: `npm run lint && npm run build`
  Expected: 0 errors.

---

### Task 6: Redesign Page 3 — `Footer.tsx` (Back Cover) & Full Browser Verification

**Files:**
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Consumes: `SpotlightCard` from `src/components/ui/aceternity.tsx`
- Preserves: `FooterProps`, solid `#0B5268` background (NO `pattern-drum-teal.png`), `ABOUT_BRAND_CONTENT`, `CONTACT_CONFIG`, QR link, `onBackToCover`.

- [ ] **Step 1: Redesign `Footer.tsx`**
  - Solid `#0B5268` back cover with double-hairline antique gold border, centered `logo-stacked.png`, balanced editorial brand story paragraphs, structured contact grid + Zalo/Messenger CTAs, and `qr-khoiminh.png` inside a subtle `SpotlightCard`.

- [ ] **Step 2: Run final lint & production build**
  Run: `npm run lint && npm run build`
  Expected: 0 errors, clean `dist/` output.

- [ ] **Step 3: Visual & Interactive Browser Verification**
  Start `npm run dev` and inspect all 4 brochure pages, page-flip transitions, `LensImage`, `HoverHighlightGrid`, `ProductConfigurator` Step 1/2, `VI | EN` toggle, and mobile responsive layout via Playwright/browser.
