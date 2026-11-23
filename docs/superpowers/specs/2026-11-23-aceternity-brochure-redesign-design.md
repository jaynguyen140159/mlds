# Design Spec: Một Lát Đông Sơn — Redesign Brochure 4 Trang theo Tinh Thần Aceternity UI

**Date:** 2026-11-23  
**Project:** `mlds` (Một Lát Đông Sơn — Khoi Minh Gifts)  
**Selected Approach:** Phương án 1 — *Di sản Ánh Kim & Vi Tương Tác* (Museum Editorial + Aceternity Micro-Interactions)

---

## 1. Intent & Why

Website hiện tại đã hoàn thiện đầy đủ luồng nghiệp vụ 4 trang dạng Brochure gập đôi 3D (`Hero`, `InsideSpread` + `StorySection`, `ProductConfigurator` 2 bước, `Footer`) và tuân thủ chặt chẽ nhận diện ấn phẩm PDF. Tuy nhiên, giao diện từng trang còn khá "phẳng" và tĩnh, chưa có độ sâu vật liệu (đồng, vàng 24K, giấy cotton) và các vi tương tác tinh tế.

Mục tiêu của bản thiết kế lại này là **giữ nguyên cấu trúc Brochure 4 trang lật 3D**, nhưng **thiết kế lại toàn bộ giao diện từng trang** bằng ngôn ngữ chuyển động và tương tác học hỏi từ **Aceternity UI** (`motion/react` + Tailwind CSS v4), giúp trải nghiệm chạm/hover/xem sản phẩm trở nên sang trọng, có chiều sâu và "đắt" hơn mà không đánh mất chất di sản bảo tàng.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- Tái thiết kế toàn bộ giao diện 4 trang (`Hero`, `InsideSpread`, `StorySection`, `ProductConfigurator`, `Footer`) và shell điều hướng (`Navbar`, `BrochureBook` floating dock).
- Xây dựng bộ primitive tái sử dụng theo pattern Aceternity UI (nhẹ, không phụ thuộc thư viện cồng kềnh, hỗ trợ `prefers-reduced-motion`):
  1. **3D Perspective Card (`TiltCard`)**: nghiêng nhẹ theo con trỏ + lớp ánh kim/glare tinh tế (dùng ở `Hero` cover artwork & thẻ preview).
  2. **Spotlight / Glare Card (`SpotlightCard`)**: vầng sáng vàng đồng ấm `#C4942E` theo con trỏ trên nền `#0B5268` hoặc `#FAF8F3`.
  3. **Shimmer / Moving Border CTA (`ShimmerButton`)**: nút hành động chính có ánh quét kim loại mượt (cho nút *Mở ấn phẩm*, *Tùy biến & Đặt mua*, *Xác nhận đặt hàng*).
  4. **Hover Highlight Grid (`HoverHighlightGrid`)**: nền highlight trượt mượt bằng `motion` `layoutId` khi di chuột qua 11 mẫu thiết kế (kiểu Aceternity `card-hover-effect`).
  5. **Lens / Magnifier Zoom (`LensImage`)**: soi cận cảnh hoa văn chạm khắc Đồng & Mạ Vàng 24K ngay trên khung xem trước.
  6. **Sliding Tab Pill (`SlidingTabs`)**: pill chuyển trạng thái dùng `layoutId` cho chuyển chất liệu, chuyển `OrderSet`, chuyển bước và thanh điều hướng đáy `FloatingDock`.
- Giữ nguyên 100% logic đặt hàng, form validation, `submitOrderToEmail`, copy phiếu đơn Zalo/Messenger, song ngữ `VI | EN`.

### Non-Goals
- Không đổi sang landing page cuộn dọc; giữ nguyên `BrochureBook` 4 trang lật 3D GSAP.
- Không thay đổi dữ liệu sản phẩm, giá, SKU, logic `OrderSet` trong `src/data/catalog.ts`.
- Không thêm các section ngoài phạm vi (Testimonials, Corporate VAT flow, v.v.).

### Anti-Goals
- **Không** biến trang web thành giao diện "dark-mode SaaS / neon AI" — mọi ánh sáng/glow phải dùng tông vàng đồng cổ `#C4942E` / `#E8D59E` và xanh petrol `#0B5268`.
- **Không** để animation của `motion` xung đột với GSAP 3D page-flip trong `BrochureBook.tsx` (không gắn `transform` phức tạp lên node gốc đang bị GSAP điều khiển).
- **Không** làm nặng/giật trên mobile: `TiltCard` và `LensImage` tự động hạ cấp mượt trên thiết bị cảm ứng (`pointer: coarse`).

---

## 3. Constraints (Từ `README.md` & Kỹ thuật)

1. **Bảng màu PDF chuẩn:**
   - Petrol Teal: `#0B5268`, header `#094558`, deep `#083E50`.
   - Antique Gold: `#C4942E`, bright `#D5A640`, pale `#E8D59E`.
   - Cotton Paper & Atelier: `#E8E5DB`, `#FAF8F3`, `#F3EFE6`, mực `#2B2823`, chữ trên giấy `#645D4E`.
2. **Hoa văn Trống Đồng (`pattern-drum-teal.png`):**
   - **CÓ** ở `Hero` (Trang 0), mặt phải `InsideSpread` (Trang 1), và `#dat-hang` `ProductConfigurator` (Trang 2).
   - **KHÔNG** đặt ở `Footer` (Trang 3).
3. **Ngôn ngữ:** Duy nhất 1 nút `VI | EN` trên `Navbar`.
4. **Đường dẫn ảnh:** Giữ `base: './'` trong `vite.config.ts` và mọi ảnh dùng đường dẫn tương đối (`images/...`).
5. **Workshop Engraving:** Giữ `formatEngravingForWorkshop` (`F08`/`F09` tự động IN HOA).
6. **Dependencies:** Cài thêm `motion` (`framer-motion` mới) để dùng `MotionConfig reducedMotion="user"`, `AnimatePresence`, `layoutId`, `useMotionValue`, `useSpring`, `useMotionTemplate`.

---

## 4. Approaches Considered

- **Phương án 1 (Đã chọn — Di sản Ánh Kim & Vi Tương Tác):** Giữ chất liệu ấn phẩm bảo tàng ấm áp, dùng các pattern Aceternity UI có chọn lọc (3D Tilt, Spotlight, Shimmer CTA, Hover Highlight Grid, Lens Zoom, Floating Dock với `layoutId`) để nâng tầm chiều sâu và cảm giác cao cấp.
- **Phương án 2 (Đương đại tương phản cao):** Dùng nhiều glassmorphism, beams, glowing border mạnh trên nền tối. Bị loại vì dễ làm mất chất giấy cotton và đồng cổ đặc trưng của ấn phẩm *Một Lát Đông Sơn*.

---

## 5. Page-by-Page Redesign Specification

### 5.1. Shell: `Navbar.tsx` & `BrochureBook.tsx`
- **`Navbar.tsx`:**
  - Giữ chiều cao gọn, nền `#094558/95` với `backdrop-blur-md` và đường viền nhũ vàng mảnh dưới đáy.
  - Link điều hướng giữa các trang dùng **active underline trượt mượt** (`layoutId="navbar-active-indicator"`).
  - Nút `VI | EN` dùng pill trượt mượt; nút CTA đơn hàng có badge số lượng rõ ràng.
- **`BrochureBook.tsx`:**
  - Giữ nguyên toàn bộ engine GSAP 3D page-flip 60fps (`resolveTurnMode`, `rigRef`, `leafRef`, `underlayRef`).
  - Nâng cấp thanh điều khiển phía dưới thành **Floating Dock** kính mờ (`bg-[#083E50]/90 backdrop-blur-md border border-[#C4942E]/35 shadow-xl`) với pill active trượt mượt (`layoutId="brochure-dock-pill"`), icon + label ngắn gọn rõ ràng.

### 5.2. Trang 0: `Hero.tsx` (Bìa Trước)
- Nền `#0B5268` + `pattern-drum-teal.png` + viền chỉ nhũ vàng 2 lớp tinh tế (outer hairline + góc bo nhẹ kiểu bìa sách ép kim).
- Khối mặt Trống Đồng (`hero-drum-art.png`) đặt trong khung **3D Perspective Tilt** nhẹ nhàng theo chuột trên desktop, kèm vệt sáng vàng đồng phản chiếu tinh tế khi di chuột.
- Khối tiêu đề `title-mot-lat-dong-son.png` + mô tả ngắn gọn + 3 chỉ số di sản tinh xảo (*11 Lát Cắt · Đồng & Mạ Vàng 24K · Đế Gỗ Khắc Riêng*) trình bày gọn như dấu triện.
- Nút **Mở ấn phẩm** dùng `ShimmerButton` (ánh quét vàng kim nhẹ trên nền `#C4942E` → `#D5A640`).
- Chân bìa: Logo `logo-stacked.png` + gợi ý lật trang thanh mảnh.

### 5.3. Trang 1: `StorySection.tsx` & `InsideSpread.tsx` (Mặt Mở Đôi)
- **Cánh trái (`StorySection.tsx`):**
  - Giữ nền giấy cotton `paper-texture.jpg`, cải thiện nhịp typography tạp chí: khoảng thở rõ hơn giữa tiêu đề `title-van-minh-dong-son.png` + minh họa `illust-dancers.png`, đoạn dẫn có chữ cái đầu hoặc nhịp biên tập sạch sẽ, khối Chim Lạc (`illust-chim-lac.png`) và Trống Đồng (`illust-drum-line.png`) đặt trong khung minh họa nhẹ có hiệu ứng stagger reveal tinh tế khi mở trang.
- **Cánh phải (`InsideSpread.tsx`):**
  - **Thẻ xem trước nổi bật (`SpotlightCard` + `LensImage`):** Ảnh sản phẩm bên trái hỗ trợ **soi kính lúp (Lens Zoom)** khi di chuột trên desktop để khách thấy rõ nét chạm trổ đồng/mạ vàng; bên phải là SKU badge, tên mẫu, ý nghĩa hoa văn, giá và **SlidingTabs** chuyển nhanh `Đồng` / `Mạ Vàng 24K`.
  - **Lưới 11 mẫu (`HoverHighlightGrid`):** Hiển thị 11 mẫu dạng grid gọn gàng với nền highlight vàng đồng trượt mượt theo hover (`layoutId="spread-hover-bg"`), trạng thái đang chọn có viền vàng nổi bật.
  - Nút CTA **Tùy biến & Đặt mua mẫu này** dùng `ShimmerButton`.

### 5.4. Trang 2: `ProductConfigurator.tsx` (Atelier Đặt Hàng 2 Bước)
- Khung ngoài `#0B5268` + `pattern-drum-teal.png` bọc không gian Atelier `#FAF8F3` có viền nhũ vàng mảnh và `Spotlight` nhẹ ở header.
- **Header & Stepper:** Thiết kế lại thanh chuyển Bước 1 (*Thiết kế & Khắc*) ↔ Bước 2 (*Thông tin & Xác nhận*) dạng pill trượt mượt, hiển thị tóm tắt số bộ + tổng tạm tính gọn ở góc phải.
- **Bước 1:**
  - **Thanh `01 · Số lượng & Danh sách bộ`:** Thiết kế phẳng, mạch lạc với quick-select (`1, 2, 3, 5`) + stepper (`- / +`) + dải tab các bộ `Bộ #1, Bộ #2...` có pill active trượt mượt (`layoutId`).
  - **Cột trái (6 cols) — Studio Preview:** Khung ảnh lớn trong `SpotlightCard` + `LensImage` soi chi tiết, bên dưới là lưới 11 mẫu dùng `HoverHighlightGrid` gọn 2 hàng.
  - **Cột phải (6 cols) — Tùy biến:** Phân tầng rõ 3 bước `02 Chất liệu`, `03 Đế gỗ trưng bày`, `04 Nội dung khắc & Font chữ` với các card chọn có viền active ánh kim, khung mô phỏng gỗ dẻ gai `.wood-grain-surface` sắc nét hơn (có nút xem ảnh thật dạng modal/lightbox sạch), 3 tab font trượt mượt.
- **Bước 2 (Checkout):**
  - Bố cục 2 cột cân đối: Trái là Form thông tin khách hàng với focus ring `#0B5268` sạch sẽ; Phải là **Phiếu Đơn Atelier** (tóm tắt từng bộ + sửa/xóa nhanh + tổng tiền + nút `ShimmerButton` **Xác nhận đặt hàng & Gửi thông tin**).
  - Trạng thái **Đã Xác Nhận (`#KM-MMDD-XXXX`)** trình bày như tấm thiệp xác nhận sang trọng với các nút Messenger, Zalo, Sao chép phiếu, Email dự phòng.

### 5.5. Trang 3: `Footer.tsx` (Bìa Sau Thương Hiệu)
- Nền xanh trơn `#0B5268` (tuyệt đối **không** dùng `pattern-drum-teal.png` theo README), viền chỉ nhũ vàng mảnh.
- Tái bố cục cân đối như bìa sau ấn phẩm cao cấp: Logo `logo-stacked.png` ở đỉnh → 3 đoạn câu chuyện Khoi Minh CST / Khoi Minh Gifts trong khối đọc thoáng → Khối liên hệ + nút Zalo/Messenger + **thẻ QR bọc trong `SpotlightCard` phát sáng nhẹ** → Dòng bản quyền + nút **Lật về bìa trước**.

---

## 6. Verification Plan

Sau khi triển khai:
1. Chạy `npm run lint` (`oxlint`) — đảm bảo 0 lỗi.
2. Chạy `npm run build` (`tsc -b && vite build`) — đảm bảo TypeScript và Vite bundle sạch.
3. Khởi động dev server (`npm run dev`) và kiểm tra trực quan trên trình duyệt (Desktop + Mobile viewport) qua cả 4 trang Brochure, thử lật trang 3D, hover/lens zoom, chọn nhiều bộ, chuyển `VI | EN`, và kiểm tra `prefers-reduced-motion`.
