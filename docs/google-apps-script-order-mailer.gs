/**
 * Google Apps Script — Gửi Email Đơn Hàng Khoi Minh Gifts (Có Logo + Bảng Đơn + Đính Kèm Ảnh 10x3cm)
 *
 * HƯỚNG DẪN CÀI ĐẶT (1 PHÚT):
 * 1. Truy cập https://script.google.com (đăng nhập bằng Gmail nhận đơn, VD: jaynguyen140159@gmail.com).
 * 2. Bấm "Dự án mới" (New project), xóa code mặc định và dán toàn bộ file này vào.
 * 3. Bấm "Triển khai" (Deploy) -> "Tạo bản triển khai mới" (New deployment):
 *    - Loại: Ứng dụng web (Web app)
 *    - Thực thi với tư cách (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 4. Bấm Triển khai, cấp quyền gửi Mail, rồi copy URL dạng https://script.google.com/macros/s/.../exec
 *    dán vào CONTACT_CONFIG.orderEmailEndpoint trong src/data/catalog.ts.
 */

var RECIPIENT_EMAIL = 'jaynguyen140159@gmail.com'; // Đổi thành 'info@khoiminhcst.vn' khi chạy chính thức
var LOGO_URL = 'https://jaynguyen140159.github.io/mlds/images/brand/logo-horizontal.png';

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(raw);

    var orderRef = data.orderRef || '#KM-ORDER';
    var customer = data.customer || {};
    var itemsSummary = data.itemsSummary || '';
    var engravingSpecSummary = data.engravingSpecSummary || '';
    var totalQty = data.totalQty || 1;
    var totalPriceFormatted = data.totalPriceFormatted || '';
    var printAssets = Array.isArray(data.printAssets) ? data.printAssets : [];

    var attachments = [];
    for (var i = 0; i < printAssets.length; i++) {
      var asset = printAssets[i];
      if (asset && asset.base64) {
        var bytes = Utilities.base64Decode(asset.base64);
        attachments.push(
          Utilities.newBlob(bytes, 'image/png', asset.filename || 'khac-de-go-bo-' + (i + 1) + '.png')
        );
      }
    }

    var esc = function (val) {
      return String(val || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>');
    };

    var htmlBody =
      '<div style="margin:0;padding:24px;background:#F1EFE9;font-family:Arial,Helvetica,sans-serif;color:#1E293B;">' +
        '<div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #DFD6C3;">' +
          '<div style="background:#0B5268;padding:18px 26px;border-bottom:3px solid #C4942E;">' +
            '<table style="width:100%;border-collapse:collapse;"><tr>' +
              '<td><img src="' + LOGO_URL + '" alt="Khoi Minh Gifts" style="height:32px;display:block;" /></td>' +
              '<td style="text-align:right;"><span style="background:#F3E79B;color:#083E50;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;display:inline-block;">ĐƠN ĐẶT HÀNG MỚI</span></td>' +
            '</tr></table>' +
          '</div>' +
          '<div style="padding:22px 26px;">' +
            '<h1 style="margin:0 0 4px;font-size:18px;color:#0B5268;">Đơn hàng ' + esc(orderRef) + ' — BST Một Lát Đông Sơn</h1>' +
            '<p style="margin:0 0 16px;font-size:12.5px;color:#645D4E;">Gửi tự động từ website đặt hàng cá nhân hóa Khoi Minh Gifts</p>' +
            '<table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:16px;">' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;width:34%;color:#645D4E;background:#FAF8F3;">Khách hàng</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;"><strong>' + esc(customer.fullName) + '</strong></td></tr>' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;color:#645D4E;background:#FAF8F3;">Số điện thoại / Zalo</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;">' + esc(customer.phone) + '</td></tr>' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;color:#645D4E;background:#FAF8F3;">Email</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;">' + esc(customer.email || '(Không cung cấp)') + '</td></tr>' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;color:#645D4E;background:#FAF8F3;">Địa chỉ giao hàng</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;">' + esc(customer.address || '(Chưa nhập)') + '</td></tr>' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;color:#645D4E;background:#FAF8F3;">Ghi chú</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;">' + esc(customer.note || '(Không có)') + '</td></tr>' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;color:#645D4E;background:#FAF8F3;">Tổng số lượng</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;"><strong>' + esc(totalQty + ' bộ') + '</strong></td></tr>' +
              '<tr><th style="padding:8px 10px;border-bottom:1px solid #ECE6D8;text-align:left;color:#645D4E;background:#FAF8F3;">Tổng tạm tính</th><td style="padding:8px 10px;border-bottom:1px solid #ECE6D8;"><strong style="color:#0B5268;font-size:14px;">' + esc(totalPriceFormatted) + '</strong></td></tr>' +
            '</table>' +
            '<div style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#0B5268;margin:14px 0 8px;">Chi tiết đơn hàng &amp; thông số khắc</div>' +
            '<div style="background:#FAF8F3;border:1px solid #E5DEC9;border-radius:8px;padding:12px 14px;font-size:12.5px;line-height:1.6;">' +
              esc(itemsSummary) +
              (engravingSpecSummary ? '<br/><br/><strong>Thông số khắc 10×3cm:</strong><br/>' + esc(engravingSpecSummary) : '') +
            '</div>' +
            (attachments.length > 0
              ? '<p style="margin:14px 0 0;font-size:12px;color:#0B5268;"><strong>File ảnh khắc 10 × 3 cm (' + attachments.length + ' file) đã được đính kèm bên dưới email này.</strong></p>'
              : '') +
          '</div>' +
          '<div style="background:#FAF8F3;padding:12px 26px;font-size:11px;color:#7D7665;border-top:1px solid #ECE6D8;text-align:center;">Khoi Minh Gifts (Khoi Minh CST) · info@khoiminhcst.vn · (84) 793 381 666</div>' +
        '</div>' +
      '</div>';

    var mailOptions = {
      to: RECIPIENT_EMAIL,
      subject: '[Khoi Minh Gifts] Đơn đặt hàng ' + orderRef + ' - ' + (customer.fullName || 'Khách hàng'),
      htmlBody: htmlBody,
      attachments: attachments,
    };
    if (customer.email && String(customer.email).trim()) {
      mailOptions.replyTo = String(customer.email).trim();
    }

    MailApp.sendEmail(mailOptions);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
