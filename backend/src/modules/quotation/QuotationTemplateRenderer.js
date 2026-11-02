// backend/src/modules/quotation/QuotationTemplateRenderer.js
// ============================================
// QUOTATION TEMPLATE RENDERER — Render Báo Giá Thương Mại B2B Chuẩn Mực HTML
// Thiết kế responsive, typography sắc nét, sẵn sàng in ấn (Print CSS) và xuất PDF
// ============================================

export class QuotationTemplateRenderer {
  /**
   * Render dữ liệu báo giá sang văn bản HTML thương mại hoàn chỉnh
   * @param {Object} quotation - Dữ liệu đối tượng báo giá từ QuotationService
   * @returns {string} Chuỗi mã HTML hoàn chỉnh
   */
  static renderToHtml(quotation) {
    const {
      quotationNumber,
      organizationSnapshot = {},
      items = [],
      subtotal = 0,
      volumeDiscountPercent = 0,
      volumeDiscountAmount = 0,
      vatPercent = 10,
      vatAmount = 0,
      grandTotal = 0,
      status = "ISSUED",
      validUntil = new Date(),
      issuedAt = new Date(),
      terms = [],
      auditFingerprint = "",
      policyEvaluation = {},
    } = quotation;

    const issuedDateStr = new Date(issuedAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const validUntilStr = new Date(validUntil).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const statusBadge =
      status === "ISSUED"
        ? `<span class="badge badge-success">✓ ĐÃ PHÁT HÀNH (OFFICIAL ISSUED)</span>`
        : `<span class="badge badge-warning">⏳ CHỜ PHÊ DUYỆT (PENDING APPROVAL - ${policyEvaluation.authorityLevel || "MANAGER"})</span>`;

    const itemsRows = items
      .map(
        (item, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td>
            <strong>${item.productName || "Thiết bị doanh nghiệp"}</strong>
            ${item.productId ? `<div class="text-muted small">Mã: ${item.productId}</div>` : ""}
          </td>
          <td class="text-center">${item.quantity}</td>
          <td class="text-right">${item.unitPrice.toLocaleString("vi-VN")} đ</td>
          <td class="text-right font-weight-bold">${item.subtotal.toLocaleString("vi-VN")} đ</td>
        </tr>
      `
      )
      .join("");

    const termsList = terms
      .map((term) => `<li>${term}</li>`)
      .join("");

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Giá Thương Mại — ${quotationNumber}</title>
  <style>
    :root {
      --primary: #1e3a8a;
      --secondary: #0284c7;
      --accent: #2563eb;
      --dark: #0f172a;
      --light: #f8fafc;
      --border: #e2e8f0;
      --success: #16a34a;
      --warning: #d97706;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: #f1f5f9; color: var(--dark); padding: 40px 20px; line-height: 1.5; font-size: 14px; }
    .page-container { max-width: 860px; margin: 0 auto; background: #ffffff; padding: 48px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header-table { width: 100%; border-bottom: 2px solid var(--border); padding-bottom: 24px; margin-bottom: 28px; }
    .brand-title { font-size: 20px; font-weight: 800; color: var(--primary); letter-spacing: -0.5px; text-transform: uppercase; }
    .brand-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
    .doc-title-section { text-align: center; margin: 24px 0 28px 0; }
    .doc-title { font-size: 24px; font-weight: 800; color: var(--primary); letter-spacing: 0.5px; }
    .doc-subtitle { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .meta-box { display: flex; justify-content: space-between; background: var(--light); border: 1px solid var(--border); border-radius: 6px; padding: 16px 20px; margin-bottom: 24px; }
    .meta-col { flex: 1; }
    .meta-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
    .meta-val { font-size: 14px; font-weight: 600; color: var(--dark); }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; margin-bottom: 10px; border-left: 3px solid var(--secondary); padding-left: 8px; }
    .customer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; font-size: 13px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table th { background: #f8fafc; border-top: 1px solid var(--border); border-bottom: 2px solid var(--border); padding: 12px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #475569; text-align: left; }
    .items-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { color: #64748b; }
    .small { font-size: 12px; }
    .font-weight-bold { font-weight: 700; }
    .summary-box { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .summary-table { width: 340px; border-collapse: collapse; }
    .summary-table td { padding: 6px 12px; font-size: 13px; }
    .summary-table .grand-row td { border-top: 2px solid var(--dark); font-size: 16px; font-weight: 800; color: var(--primary); padding-top: 10px; }
    .terms-box { background: #fafafa; border: 1px dashed var(--border); border-radius: 6px; padding: 16px 20px; margin-bottom: 32px; }
    .terms-box ul { padding-left: 20px; font-size: 12px; color: #475569; }
    .terms-box li { margin-bottom: 4px; }
    .footer-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; margin-top: 20px; }
    .sig-title { font-weight: 700; font-size: 13px; text-transform: uppercase; margin-bottom: 80px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .hash-seal { margin-top: 28px; border-top: 1px solid var(--border); padding-top: 16px; font-family: monospace; font-size: 10px; color: #64748b; word-break: break-all; text-align: center; }
    @media print {
      body { background: white; padding: 0; }
      .page-container { box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="brand-title">ProcurePrime B2B</div>
          <div class="brand-sub">Đội thi: AgentX Prime • Nền Tảng Mua Sắm & Báo Giá Tự Động</div>
          <div class="brand-sub">Tầng 12, Tòa nhà Công nghệ Cao, TP. Hồ Chí Minh • Hotline: 1900 6868</div>
        </td>
        <td style="text-align: right; vertical-align: top;">
          ${statusBadge}
        </td>
      </tr>
    </table>

    <div class="doc-title-section">
      <div class="doc-title">BẢNG BÁO GIÁ THƯƠNG MẠI</div>
      <div class="doc-subtitle">COMMERCIAL PROCUREMENT QUOTATION</div>
    </div>

    <div class="meta-box">
      <div class="meta-col">
        <div class="meta-label">Số Hiệu Báo Giá</div>
        <div class="meta-val" style="color: var(--primary); font-family: monospace;">${quotationNumber}</div>
      </div>
      <div class="meta-col text-center">
        <div class="meta-label">Ngày Phát Hành</div>
        <div class="meta-val">${issuedDateStr}</div>
      </div>
      <div class="meta-col text-right">
        <div class="meta-label">Hiệu Lực Đến</div>
        <div class="meta-val">${validUntilStr}</div>
      </div>
    </div>

    <div class="section-title">Thông Tin Doanh Nghiệp Nhận Báo Giá</div>
    <div class="customer-grid">
      <div><strong>Đơn vị:</strong> ${organizationSnapshot.name || "Doanh nghiệp Mua Sắm B2B"}</div>
      <div><strong>Mã số thuế:</strong> ${organizationSnapshot.taxCode || "Chưa cung cấp"}</div>
      <div><strong>Địa chỉ:</strong> ${organizationSnapshot.address || "Việt Nam"}</div>
      <div><strong>Điện thoại:</strong> ${organizationSnapshot.phone || "Chưa cung cấp"}</div>
    </div>

    <div class="section-title">Danh Mục Thiết Bị Đề Xuất</div>
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 40px;" class="text-center">STT</th>
          <th>Tên Thiết Bị / Chi Tiết Cấu Hình</th>
          <th style="width: 70px;" class="text-center">SL</th>
          <th style="width: 130px;" class="text-right">Đơn Giá</th>
          <th style="width: 140px;" class="text-right">Thành Tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-box">
      <table class="summary-table">
        <tr>
          <td>Cộng tiền hàng (Subtotal):</td>
          <td class="text-right font-weight-bold">${subtotal.toLocaleString("vi-VN")} đ</td>
        </tr>
        ${
          volumeDiscountPercent > 0
            ? `<tr>
                <td style="color: var(--success);">Chiết khấu sỉ B2B (${volumeDiscountPercent}%):</td>
                <td class="text-right font-weight-bold" style="color: var(--success);">- ${volumeDiscountAmount.toLocaleString("vi-VN")} đ</td>
              </tr>`
            : ""
        }
        <tr>
          <td>Thuế GTGT VAT (${vatPercent}%):</td>
          <td class="text-right font-weight-bold">+ ${vatAmount.toLocaleString("vi-VN")} đ</td>
        </tr>
        <tr class="grand-row">
          <td>TỔNG THANH TOÁN:</td>
          <td class="text-right">${grandTotal.toLocaleString("vi-VN")} đ</td>
        </tr>
      </table>
    </div>

    <div class="section-title">Điều Khoản Thương Mại & Bảo Hành</div>
    <div class="terms-box">
      <ul>
        ${termsList}
      </ul>
    </div>

    <div class="footer-signatures">
      <div>
        <div class="sig-title">Đại Diện Khách Hàng</div>
        <div>(Ký và ghi rõ họ tên)</div>
      </div>
      <div>
        <div class="sig-title">Đại Diện ProcurePrime (AgentX Prime)</div>
        <div style="color: var(--primary); font-weight: 700;">HỆ THỐNG XÁC THỰC TỰ ĐỘNG</div>
        <div class="small text-muted">Ký số điện tử bằng mật mã SHA-256</div>
      </div>
    </div>

    <div class="hash-seal">
      🔒 <strong>SHA-256 AUDIT SNAPSHOT:</strong> ${auditFingerprint || "GENESIS_SEAL_PROCUREPRIME"}
    </div>
  </div>
</body>
</html>`;
  }
}

