# Một Lát Đông Sơn — Khoi Minh Gifts (Project Blueprint & Single Source of Truth)

> **DÀNH CHO AI AGENT / DEVELOPER Ở CÁC PHIÊN SAU (ĐỌC FILE NÀY TRƯỚC TIÊN):**
> File `README.md` này đóng gói **toàn bộ kiến trúc 5 trang, tương tác Aceternity/Motion + GSAP, danh mục 12 mẫu bookmark, cơ chế tính phí khắc gộp theo nội dung, xuất file PDF khắc `10 × 3 cm` `762 DPI`, thanh toán VietQR Techcombank, Google Apps Script Mailer và quy trình phát hành**.
> - **TRƯỚC KHI SỬA BẤT KỲ GÌ:** Luôn chạy `git fetch origin && git status` để chắc chắn nhánh cục bộ đang khớp commit mới nhất trên `origin/main`.
> - **KHÔNG CẦN quét lại toàn bộ dự án** — chỉ mở đúng file/hàm trong **Mục 6 (Bảng chỉ mục sửa nhanh)** khi cần chỉnh sửa.

---

## 1. Thông tin nhanh & Liên kết chính thức

- **Website công khai (GitHub Pages 24/7):** https://jaynguyen140159.github.io/mlds/
- **Repository GitHub:** https://github.com/jaynguyen140159/mlds.git
- **Thư mục làm việc cục bộ:** `d:\Website\mot-lat-dong-son`
- **Nhánh mã nguồn chính:** `main` · **Nhánh phát hành tĩnh:** `gh-pages` (`dist/` + `.nojekyll`, Vite `base: './'`)
- **Tech Stack hiện tại (`package.json`):**
  - React `^19.3.1` · TypeScript `~7.0.2` · Vite `^8.3.6` · Tailwind CSS v4 (`@tailwindcss/vite ^4.3.5`)
  - Chuyển động & UI: `gsap ^3.15.1` (lật sách 3D 60fps) + `motion ^14.14.0` (`src/components/ui/aceternity.tsx`) + `lucide-react ^1.77.0`
  - Xuất bản in laser: `jspdf ^4.2.1` (xuất PDF vector `10 × 3 cm` nền chữ `762 DPI`)

---

## 2. Kiến trúc tổng thể: Ấn phẩm Brochure Bìa Cứng 5 Trang (`0..4`)

Website vận hành như một **quyển sách brochure bìa cứng 5 trang (`BrochurePage = 0 | 1 | 2 | 3 | 4`)** không dùng thanh Header trên đỉnh màn hình — toàn bộ điều hướng trang và nút chuyển ngôn ngữ `VI | EN` được tích hợp gọn vào **Floating Dock kính mờ** dưới chân sách:

### 2.1 Luồng trạng thái trung tâm (`src/App.tsx`)
- Bọc ngoài `<MotionConfig reducedMotion="user">` trong khung `h-dvh overflow-hidden bg-[#E8E5DB]`.
- `lang: Language` (`'vi' | 'en'`, mặc định `'vi'`) — điều khiển từ nút `VI | EN` duy nhất nằm bên phải Floating Dock của `BrochureBook`.
- `currentPage: BrochurePage` (`0 | 1 | 2 | 3 | 4`):
  - `Page 0`: **Bìa trước** (`Hero.tsx`)
  - `Page 1`: **Di sản & 12 Mẫu** (`InsideSpread.tsx` + `StorySection.tsx`)
  - `Page 2`: **Chọn mẫu & Khắc tên** (`ProductConfigurator.tsx` với `step={1}`)
  - `Page 3`: **Xác nhận đơn & Thanh toán** (`ProductConfigurator.tsx` với `step={2}`)
  - `Page 4`: **Bìa sau Khoi Minh Gifts** (`Footer.tsx`)
- `orderSets: OrderSet[]` (`1..20` bộ độc lập) + `activeSetIndex: number` + `customerInfo: CustomerInfo` (`fullName`, `phone`, `email`, `address`, `paymentMethod: 'qr' | 'cod'`, `note`).
- Preload sẵn 10 ảnh thương hiệu cốt lõi trong `useEffect` để lật 3D lần đầu không nháy khung hình.

### 2.2 Cỗ máy Lật trang 3D GSAP (`src/components/BrochureBook.tsx`) & Aceternity UI (`src/components/ui/aceternity.tsx`)
- **Hệ tọa độ chuẩn `1:2` (`max-w-[1080px] max-h-[780px]`):**
  - Khi đóng bìa (`Page 0` hoặc `Page 4`): rộng đúng 1 cánh `lg:w-1/2` (`540px`).
  - Khi mở đôi (`Page 1`, `Page 2`, `Page 3`): rộng full 2 cánh `w-full` (`1080px`).
- **10 chế độ GSAP `TurnMode`:** `open-cover` (`0 -> 1|2|3`), `close-to-front` (`1|2|3 -> 0`), `spread-forward`, `spread-backward`, `close-to-back` (`1|2|3 -> 4`), `open-from-back` (`4 -> 1|2|3`), `flip-cover-over` (`0 <-> 4`), `mobile-forward`, `mobile-backward`, `reduced-fade`. Không nhân đôi DOM nặng khi lật, tự dọn `clearProps` khi kết thúc; các modal Lightbox render qua `createPortal(..., document.body)`.
- **Floating Dock dưới chân sách:** 5 tab (`Bìa trước` · `Di sản & Mẫu` · `Chọn mẫu (N)` · `Xác nhận đơn` · `Khoi Minh`) với hiệu ứng `motion` spring pill `#F3E79B` + nút mũi tên trước/sau + cụm chuyển ngôn ngữ `VI | EN`. (Mép trang bấm nhanh hai bên sách tự ẩn ở `Page 2` và `Page 3` để không bấm nhầm khi nhập đơn).
- **Bộ Aceternity UI (`src/components/ui/aceternity.tsx`):**
  - `TiltCard` (nghiêng 3D nhẹ cho mặt trống đồng bìa trước), `SpotlightCard`, `ShimmerButton` (nút trắng sang trọng hover vàng `#F3E79B`), `GlossyLogo`, `LensImage` (kính lúp phóng đại chi tiết hoa văn khi rê chuột), `SlidingTabs`, `HoverHighlightGrid`.

### 2.3 Chi tiết 5 Trang của Ấn phẩm

| Trang | Component | Bố cục & Tính năng hiện hành |
| --- | --- | --- |
| **Page 0** | `src/components/Hero.tsx` | **Bìa trước (`540px`):** Nền `#0B5268`, mặt trống đồng `hero-drum-art.png` bọc `TiltCard` tràn full chiều ngang phần trên (`clamp(330px,56vh,460px)`), khóa chữ `title-mot-lat-dong-son.png`, nút `ShimmerButton` **Xem & Đặt sản phẩm**, logo chân bìa `GlossyLogo`. |
| **Page 1** | `src/components/InsideSpread.tsx` + `StorySection.tsx` | **Mặt mở đôi Di sản & 12 Mẫu (`1080px`):**<br>• **Cánh trái (`StorySection embedded`):** Nền giấy cotton `paper-texture.jpg`, tiêu đề `title-van-minh-dong-son.png`, bộ minh họa Đông Sơn tách nền + 3 đoạn chuyên khảo song ngữ.<br>• **Cánh phải (`InsideSpread`):** Tiêu đề *"Khám Phá 12 Lát Cắt Hoa Văn"*, thẻ `SpotlightCard` chứa `LensImage` khung `aspect-[22/15]` căn tâm chuẩn từng mẫu + nút `Expand` mở Lightbox Portal, lưới 12 mẫu `HoverHighlightGrid` (`2 hàng × 6 cột`), nút `ShimmerButton` **Đặt mua mẫu này** chuyển sang `Page 2`. |
| **Page 2** | `src/components/ProductConfigurator.tsx` (`step={1}`) | **Mặt mở đôi Chọn mẫu & Khắc tên (`1080px`):**<br>• **Trang trái:** Mục `01` chọn nhanh số lượng (`1`, `2`, `3`, `5` + stepper `- / +` tối đa 20 bộ + nút `Áp dụng cho N bộ` + dải pill `#1..#N`); khung ảnh lớn `aspect-[22/15]` không mất góc kèm mô tả song ngữ, kích thước (`Bookmark 12 × 3 cm · Đế gỗ 10 × 3 cm`) & mã SKU; lưới chọn 12 mẫu `HoverHighlightGrid` (`aspect-[4/3]`).<br>• **Trang phải:** Thanh `SlidingTabs` (`1 · Thiết kế` / `2 · Xác nhận`); mục `02` Chọn chất liệu (`Đồng 290.000₫` / `Mạ Vàng 24K 450.000₫`); mục `03` Chọn đế gỗ (`Đế gỗ trơn 0đ` / `Đế gỗ khắc laser cá nhân hóa +30.000₫`); mục `04` (khi chọn khắc) gồm dropdown 10 font + link *Xem các mẫu khắc laser* + **ô nhập trực tiếp tỷ lệ chuẩn `10 × 3 cm` (`aspect-[10/3]`, tối đa 3 dòng / 90 ký tự)** + tùy chọn *"Gửi chữ sau qua chat"* + thanh tổng tạm tính & nút **Tiếp tục nhập thông tin** (lật sang `Page 3`). |
| **Page 3** | `src/components/ProductConfigurator.tsx` (`step={2}`) | **Mặt mở đôi Xác nhận đơn & Thanh toán (`1080px`):**<br>• **Trước khi gửi (`2A`):** Trang trái nhập `Họ tên *`, `SĐT/Zalo *`, `Email`, `Địa chỉ`, chọn **Hình thức thanh toán** (`Thanh toán QR Code` hiện ngay mã **VietQR Techcombank `8866992001` — `NGUYỄN QUANG HUY`** điền sẵn số tiền & nội dung, hoặc `Ship COD`) và `Ghi chú`. Trang phải hiển thị danh sách kiểm tra lại từng bộ (sửa/xóa nhanh, ghi chú rõ các bộ trùng chữ không tính thêm phí khắc) + nút **Xác nhận đặt hàng & Gửi thông tin**.<br>• **Sau khi gửi (`2B`):** Tự động sinh file khắc `10 × 3 cm` `762 DPI` (PNG + PDF `jsPDF`) cho từng bộ khắc và POST qua **Google Apps Script** (`submitOrderToEmail`). Trang trái hiện xác nhận đơn, mã VietQR (nếu chọn QR), và nút **tải trực tiếp file PDF khắc `10 × 3 cm`**. Trang phải hiện nút gửi nhanh qua **Messenger**, **Zalo** (tự copy phiếu đầy đủ) và **Email dự phòng**. |
| **Page 4** | `src/components/Footer.tsx` | **Bìa sau Thương hiệu (`540px`):** Nền xanh trơn `#0B5268` (không có hoa văn trống đồng), `GlossyLogo`, 3 đoạn giới thiệu Khoi Minh CST / Khoi Minh Gifts, địa chỉ `38 Phố Huế`, hotline `(84) 793 381 666`, email `info@khoiminhcst.vn`, nút Chat Zalo / Messenger, thẻ QR `qr-khoiminh.png` và nút **Lật về bìa trước**. |

---

## 3. Dữ liệu trung tâm, Quy tắc Tính Giá & Khung Ảnh (`src/data/catalog.ts`)

### 3.1 Giá bán, Quy tắc Phí Khắc Gộp & Thanh toán VietQR
- **Chất liệu (`MATERIALS`):**
  - `dong` (`D`): `290.000₫` *(giá dự kiến)*
  - `ma-vang` (`V24`): `450.000₫` *(giá dự kiến)*
- **Đế gỗ & Quy tắc tính phí khắc thông minh (`WOOD_BASES` + `getUniqueEngravingCount` + `getSetPriceInOrder`):**
  - `tron` (`TR`): `0₫` · `khac` (`KH`): `+30.000₫` / nội dung khắc duy nhất.
  - **Quy tắc quan trọng đã chốt:** Nếu khách đặt nhiều bộ dùng **cùng 1 nội dung khắc và cùng font** (hoặc cùng chọn *"Gửi chữ sau"*), **phí khắc `+30.000₫` chỉ tính 1 lần duy nhất** cho nhóm nội dung đó, không nhân lên theo số đế!
- **Tài khoản VietQR (`BANK_TRANSFER_CONFIG`):**
  - Ngân hàng: `Techcombank` (`bankId: 'TCB'`) · Số TK: `8866992001` · Chủ TK: `NGUYỄN QUANG HUY`
  - Hàm `buildVietQrUrl(amount, description)` tự sinh ảnh QR `img.vietqr.io` kèm số tiền và nội dung chuyển khoản không dấu.
- **Xuất File Khắc Laser `10 × 3 cm` `762 DPI` (`generateEngravingPrintAsset`):**
  - Vẽ canvas `3600 × 1380 px` (`scale = 3` trên khung `120 × 46 mm`, bên trong là ô chữ nhật viền đen chuẩn `100 × 30 mm` = `10 × 3 cm`), cỡ chữ khuyến nghị `14–16 pt` (`getRecommendedFontSizePt`), đóng gói thành file PDF `khac-de-go-bo-X.pdf` vừa đính kèm vào email xưởng vừa cho phép tải xuống tại màn hình xác nhận đơn.
- **Google Apps Script Mailer (`docs/google-apps-script-order-mailer.gs`):**
  - Endpoint hiện tại cấu hình tại `CONTACT_CONFIG.orderEmailEndpoint` gửi email HTML có logo Khoi Minh Gifts + bảng thông tin khách + chi tiết kho/khắc + file đính kèm `khac-de-go-bo-X.pdf`.
  - Lưu ý trong `docs/google-apps-script-order-mailer.gs`: biến `RECIPIENT_EMAIL` đang để `'jaynguyen140159@gmail.com'` để test — khi vận hành chính thức chỉ cần đổi thành `'info@khoiminhcst.vn'` trên Google Apps Script và bấm *New deployment*.

### 3.2 Danh mục 12 Mẫu Bookmark (`PRODUCTS`) & Hệ thống Căn Khung Ảnh (`IMAGE_FRAME_PRESETS`)

> **Tại sao bắt buộc phải giữ `IMAGE_FRAME_PRESETS` (tránh làm mất góc ảnh):**
> Thư mục `public/images/products/` có **15 file ảnh gốc** thuộc **2 tỷ lệ khác nhau**:
> - **14 ảnh dọc (`2:3`, tỷ lệ `0.668`):** gồm 13 ảnh `1710 × 2560` và `tu-do-vang-24k.jpg` `684 × 1024`. Trong cả 14 ảnh dọc này, nửa trên (`y = 0%..44%`) là phông vải mờ, còn chiếc bookmark + đế gỗ + tua rua nằm ở nửa dưới (`y ≈ 35%..85%`, chiếm `25%–36%` chiều cao ảnh).
> - **1 ảnh ngang sát mép (`1512 × 1078`, tỷ lệ `1.403:1`):** `sinh-soi-vang-24k.jpg` (`MLDS-07 Sinh Sôi`), sừng trên trái chạm sát mép đỉnh và tua rua chạm sát góc dưới phải.
> - **Cấu hình chuẩn đã áp dụng:**
>   1. Khung ảnh lớn ở cả `InsideSpread.tsx` (Page 1) và `ProductConfigurator.tsx` (Page 2) dùng `aspect-[22/15] max-h-[296px]` (mở cửa sổ hiển thị `45.5%` chiều cao ảnh dọc — rộng rãi hơn toàn bộ chiều cao bookmark + đế gỗ).
>   2. `IMAGE_FRAME_PRESETS` căn `previewObjectPosition`, `cardThumbPosition` (`4:3`) và `squareThumbPosition` (`1:1`) riêng cho từng bức ảnh để luôn chừa lề thoáng cả trên sừng lẫn dưới đế gỗ.
>   3. Riêng `sinh-soi-vang-24k.jpg` dùng `previewFit: 'contain'` và `thumbFit: 'contain'` trên nền ấm `bg-[#F3ECE0]` để không bao giờ bị cắt sừng trên, sừng trái hay tua rua phải ở bất kỳ khung nào.

| Mã SKU | `id` | Tên mẫu | Hoọa tiết chủ đạo | File ảnh có sẵn trong `public/images/products/` | Kích thước gốc & Tọa độ chính |
| --- | --- | --- | --- | --- | --- |
| `MLDS-01` | `mat-troi` | **Mặt Trời** (*The Sun Origin*) | Mặt Trời trung tâm Trống Đồng | `mat-troi-dong.jpg`, `mat-troi-vang-24k.jpg` | `1710×2560` (`50% 72%`) |
| `MLDS-02` | `com-moi` | **Cơm Mới** (*Harvest Celebration*) | Hội giã gạo & mùa lúa mới | `com-moi-dong.jpg`, `com-moi-vang-24k.jpg` | `1710×2560` (`50% 59%` / `50% 73%`) |
| `MLDS-03` | `hop-nhat` | **Hợp Nhất** (*Harmony in Unity*) | Vòng hoa văn đồng tâm | `hop-nhat-dong.jpg`, `hop-nhat-vang-24k.jpg` | `1710×2560` (`50% 73%` / `50% 75%`) |
| `MLDS-04` | `dat-troi` | **Đất Trời** (*Heaven & Earth*) | Triết lý Âm Dương | `dat-troi-dong.jpg` | `1710×2560` (`50% 81%`) |
| `MLDS-05` | `nay-no` | **Nảy Nở** (*Blossoming Spirit*) | Vũ công & đàn hươu | `nay-no-dong.jpg` | `1710×2560` (`50% 80%`) |
| `MLDS-06` | `giao-hoa` | **Giao Hòa** (*Sacred Resonance*) | Chim Lạc & sóng nước | `giao-hoa-vang-24k.jpg` | `1710×2560` (`50% 76%`) |
| `MLDS-07` | `sinh-soi` | **Sinh Sôi** (*Abundant Vitality*) | Đàn hươu tiếp nối | `sinh-soi-vang-24k.jpg` | **`1512×1078` ngang** (`contain`, `50% 50%`) |
| `MLDS-08` | `su-song` | **Sự Sống** (*Pulse of Life*) | Dòng chảy sinh mệnh | `su-song-vang-24k.jpg` | `1710×2560` (`50% 74%`) |
| `MLDS-09` | `sung-tuc` | **Sung Túc** (*Prosperity*) | Mùa màng bội thu | `sung-tuc-vang-24k.jpg` | `1710×2560` (`50% 79%`) |
| `MLDS-10` | `thuan-phat` | **Thuận Phát** (*Auspicious Flow*) | Thuyền rồng & cánh chim | `thuan-phat-vang-24k.jpg` | `1710×2560` (`50% 80%`) |
| `MLDS-11` | `tot-tuoi` | **Tốt Tươi** (*Flourishing Grace*) | Hoa văn sinh thực | `tot-tuoi-vang-24k.jpg` | `1710×2560` (`50% 74%`) |
| `MLDS-12` | `tu-do` | **Tự Do** (*Soaring Freedom*) | Đàn chim Lạc sải cánh | `tu-do-vang-24k.jpg` | `684×1024` (`50% 84%`) |

---

## 4. Ràng buộc Thiết kế & Kỹ thuật BẮT BUỘC (Guardrails)

1. **Bảng màu thương hiệu chuẩn PDF (`src/index.css`):**
   - Xanh petrol chủ đạo: `#0B5268` · xanh đậm `#083E50` · vàng đồng cổ `#C4942E` · vàng sáng `#F3E79B` / `#E8D59E` · nền giấy `#E8E5DB`, `#FAF8F3`, `#F5F2EA`.
2. **Giữ đúng bố cục sách 5 trang hiện tại:**
   - **KHÔNG** gắn lại thanh `Navbar` trên đỉnh màn hình (điều hướng và nút `VI | EN` nằm gọn trong Floating Dock dưới chân sách).
   - **KHÔNG** đặt hoa văn Trống Đồng (`pattern-drum-teal.png`) lên `Footer` (Bìa sau `Page 4` giữ nền `#0B5268` trơn).
   - **KHÔNG** dùng hiệu ứng nút bong bóng lóa kiểu *iOS Liquid Glass* (đã thử & bị loại bỏ).
   - **KHÔNG** tính trùng phí khắc `+30.000₫` cho các bộ có cùng nội dung khắc & cùng font.
3. **Đường dẫn ảnh tương đối cho GitHub Pages (`/mlds/`):**
   - `vite.config.ts` giữ `base: './'`.
   - Mọi ảnh trong `src/` và `index.html` bắt buộc viết tương đối `images/...` hoặc `./images/...` (tuyệt đối không viết `/images/...`).
4. **Quy tắc IN HOA tự động cho xưởng laser:**
   - Font `F08` (`Be Vietnam Pro`) và `F09` (`Montserrat`) có `caseRule: 'UPPERCASE'`, tự động in hoa trong cả ô nhập `10 × 3 cm`, file PDF xuất ra và phiếu đơn gửi xưởng.

---

## 5. Bản đồ thư mục dự án

```text
mot-lat-dong-son/
├── README.md                                  # Tài liệu đóng gói toàn diện (Single Source of Truth)
├── docs/
│   ├── google-apps-script-order-mailer.gs     # Script Google Apps Script gửi mail HTML + đính kèm PDF 10x3cm
│   └── superpowers/                           # Tài liệu thiết kế Aceternity brochure
├── public/images/
│   ├── products/ (15 file .jpg)               # Ảnh thật 12 mẫu bookmark (MLDS-01..12)
│   ├── bases/    (3 file .jpg)                # 3 ảnh mẫu đế gỗ khắc laser thực tế
│   └── brand/    (13 file .png/.jpg)          # Trống đồng bìa, hoa văn nền, giấy cotton, logo, vector, QR
└── src/
    ├── App.tsx                                # Điều phối 5 trang (0..4), OrderSet[], CustomerInfo
    ├── index.css                              # Biến màu, 10 class font khắc, hiệu ứng sách 3D & shimmer
    ├── data/catalog.ts                        # Dữ liệu 12 mẫu, IMAGE_FRAME_PRESETS, VietQR, PDF 762 DPI, gửi đơn
    └── components/
        ├── ui/aceternity.tsx                  # TiltCard, SpotlightCard, ShimmerButton, GlossyLogo, LensImage, SlidingTabs, HoverHighlightGrid
        ├── BrochureBook.tsx                   # Sách 3D GSAP 5 trang + Floating Dock + công tắc VI | EN
        ├── Hero.tsx                           # Page 0: Bìa trước Mặt Trống Đồng
        ├── InsideSpread.tsx                   # Page 1: Di sản Đông Sơn (trái) + Khám phá 12 mẫu (phải)
        ├── StorySection.tsx                   # Chuyên khảo Văn Minh Đông Sơn trên nền giấy cotton
        ├── ProductConfigurator.tsx            # Page 2 (step=1: Chọn mẫu & khắc 10x3cm) + Page 3 (step=2: Xác nhận & VietQR)
        └── Footer.tsx                         # Page 4: Bìa sau Khoi Minh CST / Khoi Minh Gifts
```

---

## 6. Bảng chỉ mục sửa nhanh (Quick Edit Cheat Sheet)

| Khi cần thay đổi... | Mở đúng file & vị trí này |
| --- | --- |
| **Giá Đồng / Mạ Vàng 24K / Phí khắc đế gỗ** | `src/data/catalog.ts` -> `MATERIALS` (`290000` / `450000`) & `WOOD_BASES.khac.extraPrice` (`30000`) |
| **Số tài khoản / Ngân hàng VietQR** | `src/data/catalog.ts` -> `BANK_TRANSFER_CONFIG` & `buildVietQrUrl()` |
| **Email nhận đơn tự động & Apps Script URL** | `src/data/catalog.ts` -> `CONTACT_CONFIG.orderEmailEndpoint` + `docs/google-apps-script-order-mailer.gs` (`RECIPIENT_EMAIL`) |
| **Thêm / sửa mẫu bookmark hoặc chỉnh khung ảnh** | `src/data/catalog.ts` -> `PRODUCTS` + `IMAGE_FRAME_PRESETS` |
| **Kích thước / DPI file PDF khắc `10 × 3 cm`** | `src/data/catalog.ts` -> `generateEngravingPrintAsset()` |
| **Trang Khám phá 12 mẫu (`Page 1`)** | `src/components/InsideSpread.tsx` |
| **Trang Chọn mẫu (`Page 2`) & Xác nhận đơn (`Page 3`)** | `src/components/ProductConfigurator.tsx` |
| **Hiệu ứng lật sách 3D & Floating Dock 5 trang** | `src/components/BrochureBook.tsx` |

---

## 7. Hạng mục chờ chốt khi vận hành chính thức (TODO Checklist)

- [ ] Cập nhật bảng giá bán chính thức trong `src/data/catalog.ts` (`MATERIALS` & `WOOD_BASES` nếu thay đổi so với `290.000₫` / `450.000₫` / `+30.000₫`).
- [ ] Đổi `RECIPIENT_EMAIL` trong Google Apps Script (`docs/google-apps-script-order-mailer.gs`) từ `'jaynguyen140159@gmail.com'` sang `'info@khoiminhcst.vn'` (hoặc email nhận đơn chính thức) và redeploy Web App.
- [ ] Kiểm tra lại `CONTACT_CONFIG.messengerUsername` (`'khoiminhcst'`).
- [ ] *(Tùy chọn)* Bổ sung ảnh chụp chất liệu còn thiếu cho các mẫu mới có 1 phiên bản ảnh vào `public/images/products/` và khai báo vào `PRODUCTS` + `IMAGE_FRAME_PRESETS`.

---

## 8. Quy trình Đồng bộ Git & Phát hành GitHub Pages (`main` + `gh-pages`)

### A. Trước khi bắt đầu làm việc ở bất kỳ phiên nào
```powershell
cd d:\Website\mot-lat-dong-son
git fetch origin
git pull origin main
npm install
```

### B. Kiểm tra build & Đẩy mã nguồn lên `main`
```powershell
cd d:\Website\mot-lat-dong-son
npm run build
git add -A
git commit -m "Mo ta ngan gon thay doi"
git push origin main
```

### C. Phát hành bản web tĩnh lên `gh-pages` (cập nhật https://jaynguyen140159.github.io/mlds/)
```powershell
cd d:\Website\mot-lat-dong-son
npm run build
$gitName = git config user.name
$gitEmail = git config user.email
$tmp = Join-Path $env:TEMP 'mlds-gh-pages'
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
Copy-Item -Recurse .\dist $tmp
New-Item -ItemType File -Path (Join-Path $tmp '.nojekyll') -Force | Out-Null
Push-Location $tmp
git init -b gh-pages
git config user.name $gitName
git config user.email $gitEmail
git add -A
git commit -m "Publish updated static build"
git push -f https://github.com/jaynguyen140159/mlds.git gh-pages
Pop-Location
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
```

---

## 9. Nhật ký thay đổi (Work Log)

| Ngày | Phiên cập nhật | Nội dung đã hoàn thành |
| --- | --- | --- |
| **2026-11-22** | Khởi tạo & Phát hành | Giao diện chuẩn màu PDF `#0B5268`, đặt hàng đa bộ `OrderSet`, đường dẫn tương đối cho GitHub Pages. |
| **2026-11-23** | Brochure 3D, Aceternity UI, Mẫu thứ 12, VietQR & PDF 762 DPI | Nâng cấp tương tác Aceternity (`08f4d83`), tính phí khắc 1 lần cho mỗi nội dung duy nhất (`f3294a6`), Lightbox trên InsideSpread (`1a4076d`), tích hợp Google Apps Script mailer (`71452be`), bổ sung mẫu thứ 12 **Tự Do (`MLDS-12`)**, tách luồng sách 5 trang (`0..4`), thanh toán VietQR Techcombank và xuất PDF khắc `10 × 3 cm` `762 DPI` (`56a2362`). |
| **2026-11-24** | Sửa mất góc toàn bộ 12 mẫu ảnh & Đóng gói `README.md` | Đồng bộ trên nền `56a2362`, đo tọa độ cả 15 ảnh sản phẩm (`14` ảnh dọc + `1` ảnh ngang `Sinh Sôi`), bổ sung `IMAGE_FRAME_PRESETS` trong `catalog.ts`, mở khung `aspect-[22/15]` căn tâm chuẩn từng mẫu + `object-contain` cho `Sinh Sôi` trên cả `InsideSpread.tsx` (Page 1, kèm `LensImage`) và `ProductConfigurator.tsx` (Page 2), đồng thời đóng gói `README.md` thành tài liệu Blueprint hoàn chỉnh. |
