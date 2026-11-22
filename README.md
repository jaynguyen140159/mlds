# Một Lát Đông Sơn — Khoi Minh Gifts (Landing Page & Đặt Hàng Cá Nhân Hóa)

Tài liệu bàn giao dự án (**Single Source of Truth**) giúp bạn, cộng tác viên hoặc AI Agent trên **bất kỳ máy tính nào** chỉ cần đọc file này là nắm được ngay hiện trạng, các ràng buộc thiết kế đã chốt, những việc cần làm tiếp và cách đồng bộ giữa nhiều máy tính.

---

## 1. Thông tin nhanh & Liên kết chính thức

- **Website đang chạy (GitHub Pages 24/7):** https://jaynguyen140159.github.io/mlds/
- **Repository GitHub:** https://github.com/jaynguyen140159/mlds
- **Nhánh code chính:** `main` (toàn bộ mã nguồn React/Vite + ảnh gốc trong `public/images/`)
- **Nhánh phát hành tĩnh:** `gh-pages` (nội dung thư mục `dist/` kèm `.nojekyll`)
- **Công nghệ sử dụng:** React 19 · TypeScript · Vite 8 · Tailwind CSS v4 (`@tailwindcss/vite`) · `lucide-react` · `gsap`

---

## 2. Đang làm đến công đoạn nào? (Đã hoàn thành)

Toàn bộ website song ngữ **Việt / Anh (`VI | EN`)** dạng **Brochure bìa cứng gập đôi 4 trang với hiệu ứng lật trang 3D GSAP** và hệ thống đặt hàng khách lẻ đã hoàn thiện, build sạch và phát hành công khai:

1. **Thanh điều hướng (`src/components/Navbar.tsx`) & Hệ thống Lật trang Brochure (`src/components/BrochureBook.tsx`):**
   - `Navbar`: Logo ngang Khoi Minh Gifts (bấm về Bìa trước), điều hướng trực tiếp giữa các trang, **một nút chuyển ngôn ngữ duy nhất `VI | EN`** đồng bộ toàn trang và nút CTA đơn hàng.
   - `BrochureBook` (GSAP 3D 60fps trên hệ khung `1:2` cố định `max-w-[1200px]` × `max-h-[760px]`): không nhân đôi DOM nặng khi lật trang, tự động hủy timeline cũ khi chuyển nhanh liên tiếp và dọn sạch inline style sau khi hoàn tất. Điều hướng bằng thanh pill nổi gọn trên mặt bàn, mũi tên tròn hai bên Desktop, mép trang (ẩn ở Trang đặt hàng để tránh bấm nhầm), phím mũi tên `←` / `→` và vuốt ngang trên Mobile.
2. **Trang 0 — Bìa trước (`src/components/Hero.tsx`):**
   - Tái hiện bìa cứng mặt trống đồng Đông Sơn (`hero-drum-art.png`) trải **to full 100% chiều ngang bìa trước** trên nền hoa văn trống đồng (`pattern-drum-teal.png`) tông `#0B5268`, khóa tiêu đề `title-mot-lat-dong-son.png`, nút **Mở ấn phẩm** và logo `logo-stacked.png`.
3. **Trang 1 — Mặt mở đôi (`src/components/InsideSpread.tsx` + `src/components/StorySection.tsx`):**
   - **Cánh trái (`StorySection` chế độ nhúng):** Nền giấy cotton tự nhiên (`paper-texture.jpg`) trích xuất từ Trang 2 PDF, nội dung song ngữ (*Văn Minh Đông Sơn / Dong Son Civilization*, *Trống Đồng*) cùng bộ minh họa vector tách nền hoàn chỉnh (`illust-dancers.png`, `illust-chim-lac.png`, `illust-divider.png`, `illust-drum-line.png`).
   - **Cánh phải (`InsideSpread`):** Bộ xem nhanh tương tác cả 11 mẫu thiết kế, chuyển chất liệu tức thì (`Đồng` / `Mạ Vàng 24K`) và nút **Tùy biến & Đặt mua mẫu này** chuyển thẳng mẫu sang Trang đặt hàng.
4. **Trang 2 — Folio Đặt sản phẩm Khách lẻ 2 bước (`src/components/ProductConfigurator.tsx`):**
   - Khung nền xanh `#0B5268` có hoa văn Trống Đồng, bọc không gian Atelier ngà ấm `#FAF8F3`, chuyển bước mượt bằng GSAP.
   - **Bước 1 — Chọn số lượng trước -> Tùy biến độc lập từng bộ (`OrderSet`):**
     - Mục `01 · Số lượng bộ` thiết kế phẳng mạch: nhóm chọn nhanh (`1 bộ`, `2 bộ`, `3 bộ`, `5 bộ`) ngay cạnh stepper (`- / +`, tối đa 20 bộ), phía dưới là dải thẻ chuyển từng bộ độc lập + nút `+ Thêm bộ` + nút **Áp dụng Bộ #X cho cả N bộ**.
     - Bố cục studio **6/6 cân đối**: Cột trái gồm ảnh lớn phóng to + lưới thu gọn 11 mẫu (`2 hàng`, đã lược bỏ khối 3 ảnh đế gỗ thực tế cho gọn như mặt sách); Cột phải đồng bộ badge bước `02`–`04`, thẻ **Đồng / Đồng Mạ Vàng 24K** và **Đế gỗ trơn / Đế gỗ khắc laser** 1 dòng thẳng hàng không vỡ chữ. Khi chọn khắc laser sẽ mở khung **Mô phỏng mặt trước đế gỗ khắc** (kèm link **Xem ảnh thật**), ô nhập nội dung và bộ chọn **10 font tiếng Việt chia 3 tab** (`Cổ điển`, `Thư họa`, `Hiện đại`), hỗ trợ **"Gửi chữ sau qua chat"**.
   - **Bước 2 — Thông tin nhận hàng & Xác nhận:**
     - Form khách lẻ: Họ tên `*`, SĐT `*`, Email (tùy chọn), Địa chỉ, Ghi chú + tóm tắt từng bộ kèm nút sửa/xóa nhanh.
     - Nút **Xác nhận đặt hàng & Gửi thông tin**: tự động POST bảng chi tiết đơn về email `info@khoiminhcst.vn` qua **FormSubmit AJAX** (`submitOrderToEmail` trong `src/data/catalog.ts`), sau đó chuyển sang thẻ **Đã Xác Nhận Đơn Hàng (`#KM-MMDD-XXXX`)** kèm nút **Gửi đơn qua Messenger**, **Liên hệ qua Zalo**, **Sao chép phiếu** và link dự phòng `mailto:`.
     - *Lưu ý nền tảng Meta Messenger:* Meta không cho phép website bên ngoài âm thầm tự đẩy tin nhắn vào khung chat Messenger đang mở của khách (nếu không qua bot/webview gắn `psid`). Do đó khi khách bấm Messenger/Zalo, web tự động sao chép toàn bộ phiếu đơn vào clipboard + mở `m.me` / `zalo.me` để khách Dán & Gửi ngay trong 1 chạm.
5. **Trang 3 — Bìa sau Thương hiệu (`src/components/Footer.tsx`):**
   - Bìa đóng nền xanh trơn `#0B5268` (đồng nhất mặt bìa sau PDF, **không** dùng hoa văn Trống Đồng ở phần này), logo dọc, 3 đoạn giới thiệu Khoi Minh CST / Khoi Minh Gifts, thông tin liên hệ chính thức (`Số 38 Phố Huế, phường Cửa Nam, Hà Nội`, `(84) 793 381 666`, `info@khoiminhcst.vn`, `www.khoiminhcst.vn`), nút Chat Zalo / Messenger, mã QR (`qr-khoiminh.png`) và nút **Lật về bìa trước**.
6. **Tối ưu GitHub Pages:** Đã cấu hình `base: './'` và toàn bộ ảnh dùng đường dẫn tương đối (`images/...`), kèm nạp trước bộ ảnh thương hiệu cốt lõi trong `App.tsx`.

---

## 3. Các hạng mục cần làm tiếp (TODO Checklist)

- [ ] **Cập nhật bảng giá chính thức** trong [`src/data/catalog.ts`](src/data/catalog.ts) (hiện đang để giá dự kiến: `Đồng = 290.000₫`, `Đồng Mạ Vàng 24K = 450.000₫`, `Đế gỗ khắc laser = +50.000₫`).
- [ ] **Kiểm tra / cập nhật username Messenger** chính thức tại `CONTACT_CONFIG.messengerUsername` trong [`src/data/catalog.ts`](src/data/catalog.ts) (hiện đang để `'khoiminhcst'`).
- [ ] **Kích hoạt email nhận đơn tự động (1 lần duy nhất):** Mở https://jaynguyen140159.github.io/mlds/, đặt thử 1 đơn để FormSubmit gửi email **Activate Form** tới hộp thư `info@khoiminhcst.vn` -> mở mail bấm xác nhận là từ các đơn sau sẽ tự gửi về hộp thư (hoặc thay `orderEmailEndpoint` bằng Web3Forms / Google Apps Script webhook nếu muốn).
- [ ] *(Tùy chọn)* Cập nhật lại mô tả chi tiết cho 11 mẫu thiết kế trong `PRODUCTS` tại [`src/data/catalog.ts`](src/data/catalog.ts) nếu có nội dung copywriting mới.
- [ ] *(Tùy chọn)* Bổ sung thêm ảnh chụp thực tế chất liệu còn thiếu cho 8 mẫu hiện mới có 1 phiên bản ảnh (`Đất Trời`, `Nảy Nở`, `Giao Hòa`, `Sinh Sôi`, `Sự Sống`, `Sung Túc`, `Thuận Phát`, `Tốt Tươi`) vào `public/images/products/` và khai báo trong `PRODUCTS`.
- [ ] *(Tùy chọn)* Nếu muốn GitHub tự build lại mỗi khi `git push` lên `main`: tạo `.github/workflows/deploy.yml` trực tiếp trên web GitHub và chuyển **Settings -> Pages -> Source** sang **GitHub Actions** *(chưa đẩy file workflow bằng CLI do OAuth token cũ chưa có scope `workflow`)*.

---

## 4. Quy tắc thiết kế & Quyết định đã chốt (Ràng buộc cho mọi máy)

Khi sửa tiếp trên máy khác hoặc giao cho AI Agent chỉnh sửa, **bắt buộc giữ nguyên** các quyết định sau:

1. **Bảng màu PDF chuẩn (không đổi sang đen/vàng neon kiểu AI):**
   - Xanh petrol chủ đạo: `--km-teal: #0B5268`, header `--km-teal-header: #094558`, nhấn đậm `--km-teal-deep: #083E50`.
   - Vàng đồng cổ: `--km-gold: #C4942E`, `--km-gold-bright: #D5A640`, `--km-gold-pale: #E8D59E`.
   - Nền giấy & Atelier: `--km-paper-bg: #E8E5DB`, `#FAF8F3`, `#F3EFE6`.
2. **Vị trí hoa văn Trống Đồng (`pattern-drum-teal.png`):**
   - **CÓ** đặt ở `Hero` và `#dat-hang` (`ProductConfigurator`).
   - **KHÔNG** đặt ở `Footer` (`#khach-hang`).
3. **Ngôn ngữ:** Chỉ giữ **duy nhất 1 nút chuyển `VI | EN`** trên `Navbar` điều khiển toàn trang (không đặt nút chuyển ngôn ngữ riêng lẻ trong từng section).
4. **Phạm vi nội dung & Đối tượng đặt hàng:**
   - **KHÔNG** thêm lại section `ProductGallery` tách riêng, phần *"Khách hàng nói"*, hay *"Ứng dụng quà tặng"*.
   - Khu vực `#dat-hang` **chỉ phục vụ Khách lẻ (`1–20 bộ`)** — không đưa tùy chọn *Doanh nghiệp*, *Xuất VAT*, hay *Khắc Logo* vào luồng đặt nhanh (chỉ giữ 1 dòng liên kết dẫn khách doanh nghiệp tới `#khach-hang` để báo giá riêng).
5. **Đường dẫn ảnh cho GitHub Pages (`subpath /mlds/`):**
   - Giữ `base: './'` trong `vite.config.ts`.
   - Mọi ảnh trong `src/` và `index.html` phải dùng đường dẫn tương đối (`images/...` hoặc `./images/...`), **tuyệt đối không** dùng `/images/...` (dấu `/` ở đầu sẽ lỗi `404` trên `/mlds/`).
6. **Quy tắc chuẩn hóa chữ khắc cho xưởng (`formatEngravingForWorkshop`):**
   - Font `F08` (Be Vietnam Pro) và `F09` (Montserrat) tự động chuyển `IN HOA` đúng như bản xem trước để xưởng laser khắc khớp 100%.

---

## 5. Bản đồ cấu trúc file quan trọng

```text
mot-lat-dong-son/
├── README.md                          # File bàn giao & hướng dẫn đồng bộ giữa các máy
├── index.html                         # Entry HTML, Google Fonts (10 font khắc + Be Vietnam Pro + Cormorant)
├── vite.config.ts                     # Cấu hình Vite với base: './'
├── public/images/
│   ├── products/ (14 file .jpg)       # Ảnh chụp thật 11 mẫu bookmark (MLDS-01..11)
│   ├── bases/    (3 file .jpg)        # 3 ảnh mẫu đế gỗ khắc laser thực tế
│   └── brand/    (13 file .png/.jpg)  # Logo, bìa trống đồng, hoa văn nền, chữ PP Migra, vector trang 2, giấy cotton, QR
└── src/
    ├── index.css                      # Biến màu thương hiệu, 10 class font khắc, vân gỗ .wood-grain-surface & mặt bàn 3D brochure
    ├── App.tsx                        # Quản lý trạng thái trang Brochure (0|1|2|3), step (1|2), OrderSet[], nạp trước ảnh cốt lõi
    ├── data/catalog.ts                # Dữ liệu tập trung (giá, liên hệ, sản phẩm, OrderSet, phiếu đơn, submitOrderToEmail)
    └── components/
        ├── BrochureBook.tsx           # Khung sách gập đôi 3D GSAP 60fps, điều khiển pill nổi, mũi tên, phím & vuốt Mobile
        ├── Navbar.tsx                 # Thanh điều hướng cố định chuyển trang brochure + 1 nút VI | EN duy nhất
        ├── Hero.tsx                   # Trang 0: Bìa trước Một Lát Đông Sơn (ảnh Trống Đồng full-bleed)
        ├── InsideSpread.tsx           # Trang 1: Mặt mở đôi ghép Di sản (trái) + 11 mẫu tương tác (phải)
        ├── StorySection.tsx           # Chuyên khảo Văn Minh Đông Sơn trên nền giấy cotton PDF
        ├── ProductConfigurator.tsx    # Trang 2: Đặt hàng 2 bước gọn phẳng, chọn số lượng -> tùy biến từng bộ -> xác nhận đơn
        └── Footer.tsx                 # Trang 3: Bìa sau Khoi Minh CST / Khoi Minh Gifts + QR + liên hệ
```

---

## 6. Quy trình làm việc & Đồng bộ giữa 2 máy tính

### A. Lần đầu mở trên máy tính mới
```bash
git clone https://github.com/jaynguyen140159/mlds.git
cd mlds
npm install
npm run dev
```
*(Nếu dùng AI Assistant / Google Antigravity trên máy mới, hãy mở thư mục `mlds` và nhắn: **"Hãy đọc kỹ file README.md để nắm hiện trạng và quy tắc dự án trước khi tiếp tục sửa."**)*

### B. Trước khi bắt đầu làm việc mỗi ngày (rất quan trọng để tránh xung đột)
```bash
git pull origin main
npm install   # chỉ cần chạy lại nếu package.json có thay đổi từ máy kia
```

### C. Sau khi sửa xong trên bất kỳ máy nào — Đẩy code lên `main`
1. Kiểm tra build sạch:
   ```bash
   npm run build
   ```
2. Cập nhật nhanh vài dòng vào mục **7. Nhật ký thay đổi** ở cuối file `README.md` (ghi rõ đã sửa gì và còn gì chưa xong).
3. Commit & push lên `main`:
   ```bash
   git add -A
   git commit -m "Mo ta ngan gon nhung gi vua sua"
   git push origin main
   ```

### D. Cập nhật lại bản chạy web công khai (`gh-pages`) sau khi build xong
*(Thực hiện khi muốn trang https://jaynguyen140159.github.io/mlds/ cập nhật bản mới nhất)*

**Trên Windows (PowerShell):**
```powershell
npm run build
$tmp = Join-Path $env:TEMP 'mlds-gh-pages'
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
Copy-Item -Recurse .\dist $tmp
New-Item -ItemType File -Path (Join-Path $tmp '.nojekyll') -Force | Out-Null
Push-Location $tmp
git init -b gh-pages
git add -A
git commit -m "Publish updated static build"
git push -f https://github.com/jaynguyen140159/mlds.git gh-pages
Pop-Location
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
```

**Trên macOS / Linux (Bash):**
```bash
npm run build
rm -rf /tmp/mlds-gh-pages && cp -r dist /tmp/mlds-gh-pages && touch /tmp/mlds-gh-pages/.nojekyll
cd /tmp/mlds-gh-pages && git init -b gh-pages && git add -A && git commit -m "Publish updated static build"
git push -f https://github.com/jaynguyen140159/mlds.git gh-pages
cd - && rm -rf /tmp/mlds-gh-pages
```

> **Lưu ý file ngoài repo:** File PDF gốc thiết kế (`BÌA CỨNG BOOKMARK ĐỒNG Nov 5, 2026.pdf`, ~45 MB) không đẩy lên GitHub để repo gọn nhẹ. Toàn bộ ảnh trích xuất đã có sẵn trong `public/images/brand/`, chỉ cần giữ lại PDF gốc riêng nếu sau này cần cắt lại hình mới.

---

## 7. Nhật ký thay đổi (Work Log giữa các máy)

| Ngày | Máy / Người sửa | Nội dung đã làm | Việc cần làm tiếp ở phiên sau |
| --- | --- | --- | --- |
| **2026-11-22** | Máy 1 (Initial setup & launch) | Hoàn thiện giao diện PDF (`#0B5268`, sửa cắt mép trống đồng), luồng đặt hàng khách lẻ chọn số lượng trước -> tùy biến độc lập từng bộ (`OrderSet`), xác nhận 2 bước (Auto-Email + Messenger/Zalo), chỉnh path tương đối và đẩy lên GitHub (`main` + `gh-pages`). | Điền giá bán chính thức & `messengerUsername` trong `src/data/catalog.ts`; kích hoạt FormSubmit email lần đầu tới `info@khoiminhcst.vn`. |
| **2026-11-23** | Máy 1 (Bi-fold 3D GSAP Brochure) | Chuyển toàn site thành brochure gập đôi 4 trang (`BrochureBook.tsx`, `InsideSpread.tsx`) dùng GSAP (`^3.15.1`) 60fps; làm ảnh bìa Trống Đồng to full bìa trước (`Hero.tsx`); thiết kế lại thanh pill nổi tối giản + bỏ góc gấp thừa; làm gọn mục `01 · Số lượng bộ`, thẻ chất liệu/đế gỗ không vỡ dòng và bỏ khối 3 ảnh mẫu thực tế ở cột trái (`ProductConfigurator.tsx`); đẩy lên GitHub (`main` + `gh-pages`). | Điền giá bán chính thức & `messengerUsername` trong `src/data/catalog.ts`; kích hoạt FormSubmit email lần đầu tới `info@khoiminhcst.vn`. |
| *(Ngày mới)* | *(Máy 1 / Máy 2)* | *(Ghi ngắn gọn những file/tính năng vừa sửa)* | *(Ghi điểm đang dừng lại hoặc lỗi cần xử lý)* |
