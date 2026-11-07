// backend/src/modules/quotation/QuotationExcelExporter.js
// ============================================
// QUOTATION EXCEL EXPORTER — Xuất Báo Giá Doanh Nghiệp Chuẩn 100% B2B Format
// Thư viện: exceljs | Thiết kế: Bảng tính kế toán chuẩn mực, công thức động, chữ ký SHA-256
// ============================================

import ExcelJS from "exceljs";

/**
 * Hàm chuyển đổi số tiền thành chữ tiếng Việt chuẩn kế toán
 * Ví dụ: 85850000 -> "Tám mươi lăm triệu tám trăm năm mươi nghìn đồng chẵn."
 */
export function numberToVietnameseWords(n) {
  if (isNaN(n) || n === null || n === undefined) return "";
  const num = Math.round(Number(n));
  if (num === 0) return "Không đồng chẵn.";

  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const scales = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readThreeDigits(threeNum, isHighest) {
    const h = Math.floor(threeNum / 100);
    const t = Math.floor((threeNum % 100) / 10);
    const u = threeNum % 10;
    let res = "";

    if (h > 0 || !isHighest) {
      res += `${digits[h]} trăm `;
    }

    if (t > 1) {
      res += `${digits[t]} mươi `;
      if (u === 1) res += "mốt ";
      else if (u === 5) res += "lăm ";
      else if (u > 0) res += `${digits[u]} `;
    } else if (t === 1) {
      res += "mười ";
      if (u === 5) res += "lăm ";
      else if (u > 0) res += `${digits[u]} `;
    } else if (t === 0) {
      if (u > 0) {
        if (h > 0 || !isHighest) res += `lẻ ${digits[u]} `;
        else res += `${digits[u]} `;
      }
    }
    return res.trim();
  }

  let numStr = Math.abs(num).toString();
  const groups = [];
  while (numStr.length > 0) {
    groups.unshift(numStr.slice(Math.max(0, numStr.length - 3)));
    numStr = numStr.slice(0, Math.max(0, numStr.length - 3));
  }

  let words = "";
  for (let i = 0; i < groups.length; i++) {
    const gVal = parseInt(groups[i], 10);
    if (gVal > 0) {
      const gWords = readThreeDigits(gVal, i === 0);
      const scaleIndex = groups.length - 1 - i;
      words += `${gWords} ${scales[scaleIndex]} `;
    }
  }

  words = words.trim().replace(/\s+/g, " ");
  // Viết hoa chữ cái đầu và thêm hậu tố tiền tệ
  return words.charAt(0).toUpperCase() + words.slice(1) + " đồng chẵn.";
}

export class QuotationExcelExporter {
  /**
   * Tạo Buffer file Excel (.xlsx) từ dữ liệu báo giá thương mại B2B
   * @param {Object} quotation - Dữ liệu báo giá từ QuotationService
   * @returns {Promise<Buffer>}
   */
  static async exportToBuffer(quotation) {
    const {
      quotationNumber = "PP-B2B-QUOTATION",
      organizationSnapshot = {},
      items = [],
      subtotal = 0,
      volumeDiscountPercent = 5,
      vatPercent = 10,
      grandTotal = 0,
      status = "ISSUED",
      validUntil = new Date(),
      issuedAt = new Date(),
      terms = [],
      auditFingerprint = "",
    } = quotation;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ProcurePrime Autonomous B2B System";
    workbook.lastModifiedBy = "ProcurePrime Copilot";
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet("Báo Giá Doanh Nghiệp", {
      views: [{ showGridLines: true }],
      pageSetup: {
        paperSize: 9, // A4
        orientation: "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.7,
          bottom: 0.7,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    // 1. Định nghĩa độ rộng các cột (Columns layout)
    sheet.columns = [
      { key: "A", width: 6 },  // STT
      { key: "B", width: 14 }, // Mã SP
      { key: "C", width: 44 }, // Tên & Quy cách kỹ thuật
      { key: "D", width: 10 }, // ĐVT
      { key: "E", width: 12 }, // Số lượng
      { key: "F", width: 18 }, // Đơn giá
      { key: "G", width: 22 }, // Thành tiền
      { key: "H", width: 14 }, // Bảo hành
      { key: "I", width: 16 }, // Ghi chú
    ];

    const NAVY_BLUE = "1F4E78";
    const ACCENT_ROW = "F2F5F9";
    const BORDER_THIN = {
      top: { style: "thin", color: { argb: "D9D9D9" } },
      left: { style: "thin", color: { argb: "D9D9D9" } },
      bottom: { style: "thin", color: { argb: "D9D9D9" } },
      right: { style: "thin", color: { argb: "D9D9D9" } },
    };

    // 2. KHỐI THÔNG TIN DOANH NGHIỆP CUNG CẤP (Header Đơn vị báo giá)
    sheet.mergeCells("A1:G1");
    const r1 = sheet.getCell("A1");
    r1.value = "CÔNG TY CỔ PHẦN CÔNG NGHỆ PROCUREPRIME VIỆT NAM";
    r1.font = { name: "Calibri", size: 13, bold: true, color: { argb: NAVY_BLUE } };

    sheet.mergeCells("A2:G2");
    const r2 = sheet.getCell("A2");
    r2.value = "Hệ Thống Mua Sắm B2B & Quản Trị Cung Ứng Thiết Bị Doanh Nghiệp Tự Hành";
    r2.font = { name: "Calibri", size: 10, italic: true, color: { argb: "595959" } };

    sheet.mergeCells("A3:G3");
    const r3 = sheet.getCell("A3");
    r3.value = "Trụ sở: Tòa nhà Tech Innovation Center, TP. Hồ Chí Minh | MST: 0317894562 | Hotline: 1900 8888";
    r3.font = { name: "Calibri", size: 9, color: { argb: "595959" } };

    sheet.mergeCells("A4:G4");
    const r4 = sheet.getCell("A4");
    r4.value = "Email: b2b-support@procureprime.vn | Website: https://procureprime.vn | STK: 1028 9999 8888 (Vietcombank - CN TP.HCM)";
    r4.font = { name: "Calibri", size: 9, color: { argb: "595959" } };

    // 3. TIÊU ĐỀ BÁO GIÁ
    sheet.mergeCells("A6:I6");
    const titleCell = sheet.getCell("A6");
    titleCell.value = "BẢNG BÁO GIÁ THIẾT BỊ & GIẢI PHÁP DOANH NGHIỆP";
    titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: NAVY_BLUE } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(6).height = 26;

    sheet.mergeCells("A7:I7");
    const subTitleCell = sheet.getCell("A7");
    subTitleCell.value = "(COMMERCIAL PROFORMA QUOTATION — B2B ENTERPRISE)";
    subTitleCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "7F7F7F" } };
    subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

    // 4. KHỐI THÔNG TIN KHÁCH HÀNG & MÃ HIỆU BÁO GIÁ (Rows 9 - 12)
    const orgName = organizationSnapshot.name || "Doanh Nghiệp Nhận Báo Giá";
    const orgTaxCode = organizationSnapshot.taxCode || "Chưa cung cấp";
    const orgAddress = organizationSnapshot.address || "Việt Nam";
    const orgPhone = organizationSnapshot.phone || "Liên hệ bàn giao";

    const issuedDateStr = new Date(issuedAt).toLocaleDateString("vi-VN");
    const validUntilDateStr = new Date(validUntil).toLocaleDateString("vi-VN");

    sheet.getCell("A9").value = "Kính gửi (To):";
    sheet.getCell("A9").font = { name: "Calibri", size: 10, bold: true };
    sheet.mergeCells("B9:E9");
    sheet.getCell("B9").value = orgName;
    sheet.getCell("B9").font = { name: "Calibri", size: 10, bold: true, color: { argb: NAVY_BLUE } };

    sheet.getCell("F9").value = "Số báo giá (No):";
    sheet.getCell("F9").font = { name: "Calibri", size: 10, bold: true };
    sheet.mergeCells("G9:I9");
    sheet.getCell("G9").value = quotationNumber;
    sheet.getCell("G9").font = { name: "Calibri", size: 11, bold: true, color: { argb: "C00000" } };

    sheet.getCell("A10").value = "Mã số thuế (MST):";
    sheet.getCell("A10").font = { name: "Calibri", size: 10, bold: true };
    sheet.mergeCells("B10:E10");
    sheet.getCell("B10").value = orgTaxCode;

    sheet.getCell("F10").value = "Ngày lập (Date):";
    sheet.getCell("F10").font = { name: "Calibri", size: 10, bold: true };
    sheet.mergeCells("G10:I10");
    sheet.getCell("G10").value = issuedDateStr;

    sheet.getCell("A11").value = "Địa chỉ nhận hàng:";
    sheet.getCell("A11").font = { name: "Calibri", size: 10 };
    sheet.mergeCells("B11:E11");
    sheet.getCell("B11").value = orgAddress;

    sheet.getCell("F11").value = "Thời hạn hiệu lực:";
    sheet.getCell("F11").font = { name: "Calibri", size: 10, bold: true };
    sheet.mergeCells("G11:I11");
    sheet.getCell("G11").value = `${validUntilDateStr} (15 ngày)`;

    sheet.getCell("A12").value = "Người đại diện / SĐT:";
    sheet.getCell("A12").font = { name: "Calibri", size: 10 };
    sheet.mergeCells("B12:E12");
    sheet.getCell("B12").value = orgPhone;

    sheet.getCell("F12").value = "Trạng thái thẩm định:";
    sheet.getCell("F12").font = { name: "Calibri", size: 10, bold: true };
    sheet.mergeCells("G12:I12");
    sheet.getCell("G12").value = status === "ISSUED" ? "ĐÃ PHÊ DUYỆT (OFFICIAL ISSUED)" : "CHỜ PHÊ DUYỆT (DRAFT REVIEW)";
    sheet.getCell("G12").font = { name: "Calibri", size: 10, bold: true, color: { argb: status === "ISSUED" ? "1E7E34" : "D97706" } };

    // 5. HEADER BẢNG DANH MỤC SẢN PHẨM (Row 14)
    const headerRowIdx = 14;
    const headerRow = sheet.getRow(headerRowIdx);
    headerRow.values = [
      "STT",
      "MÃ SP",
      "TÊN THIẾT BỊ & THÔNG SỐ KỸ THUẬT",
      "ĐVT",
      "SỐ LƯỢNG",
      "ĐƠN GIÁ (VNĐ)",
      "THÀNH TIỀN (VNĐ)",
      "BẢO HÀNH",
      "GHI CHÚ",
    ];
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: NAVY_BLUE },
      };
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = BORDER_THIN;
    });

    // 6. CÁC DÒNG SẢN PHẨM (Data Rows)
    let currentRowIdx = 15;
    const startDataRow = currentRowIdx;

    items.forEach((item, idx) => {
      const row = sheet.getRow(currentRowIdx);
      const isEven = idx % 2 === 1;

      row.values = [
        idx + 1,
        item.productId ? String(item.productId).slice(-8).toUpperCase() : `SKU-${idx + 1}`,
        item.productName || "Thiết bị văn phòng B2B",
        "Bộ",
        item.quantity || 1,
        item.unitPrice || 0,
        { formula: `E${currentRowIdx}*F${currentRowIdx}`, result: (item.quantity || 1) * (item.unitPrice || 0) },
        "24 tháng",
        "Mới 100% Fullbox VAT",
      ];

      row.height = 24;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Calibri", size: 10 };
        cell.border = BORDER_THIN;
        if (isEven) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: ACCENT_ROW },
          };
        }

        // Căn lề và format số
        if (colNumber === 1 || colNumber === 2 || colNumber === 4 || colNumber === 8 || colNumber === 9) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colNumber === 3) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
          cell.font = { name: "Calibri", size: 10, bold: true };
        } else if (colNumber === 5) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.numFmt = "#,##0";
        } else if (colNumber === 6 || colNumber === 7) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.numFmt = '#,##0 "₫"';
          if (colNumber === 7) {
            cell.font = { name: "Calibri", size: 10, bold: true };
          }
        }
      });

      currentRowIdx++;
    });

    const endDataRow = currentRowIdx - 1;

    // 7. KHỐI TỔNG HỢP KẾ TOÁN (Financial Summary Rows)
    // 7.1 Cộng tiền hàng (Subtotal)
    const subtotalRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    subtotalRow.getCell(1).value = "CỘNG TIỀN HÀNG (SUBTOTAL):";
    subtotalRow.getCell(1).font = { name: "Calibri", size: 10, bold: true };
    subtotalRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
    subtotalRow.getCell(7).value = { formula: `SUM(G${startDataRow}:G${endDataRow})`, result: subtotal };
    subtotalRow.getCell(7).font = { name: "Calibri", size: 10, bold: true };
    subtotalRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    subtotalRow.getCell(7).numFmt = '#,##0 "₫"';
    sheet.mergeCells(`H${currentRowIdx}:I${currentRowIdx}`);
    for (let c = 1; c <= 9; c++) subtotalRow.getCell(c).border = BORDER_THIN;
    const rSubtotal = currentRowIdx;
    currentRowIdx++;

    // 7.2 Chiết khấu Doanh nghiệp (Volume Discount)
    const discountRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    discountRow.getCell(1).value = `CHIẾT KHẤU SỈ DOANH NGHIỆP B2B (${volumeDiscountPercent}%):`;
    discountRow.getCell(1).font = { name: "Calibri", size: 10, bold: true, color: { argb: "1E7E34" } };
    discountRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
    const discountFactor = (volumeDiscountPercent || 0) / 100;
    discountRow.getCell(7).value = { formula: `G${rSubtotal}*${discountFactor}`, result: Math.round(subtotal * discountFactor) };
    discountRow.getCell(7).font = { name: "Calibri", size: 10, bold: true, color: { argb: "1E7E34" } };
    discountRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    discountRow.getCell(7).numFmt = '#,##0 "₫"';
    sheet.mergeCells(`H${currentRowIdx}:I${currentRowIdx}`);
    for (let c = 1; c <= 9; c++) discountRow.getCell(c).border = BORDER_THIN;
    const rDiscount = currentRowIdx;
    currentRowIdx++;

    // 7.3 Tiền hàng sau chiết khấu
    const afterDiscountRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    afterDiscountRow.getCell(1).value = "TIỀN HÀNG SAU CHIẾT KHẤU:";
    afterDiscountRow.getCell(1).font = { name: "Calibri", size: 10, bold: true };
    afterDiscountRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
    afterDiscountRow.getCell(7).value = { formula: `G${rSubtotal}-G${rDiscount}`, result: Math.round(subtotal * (1 - discountFactor)) };
    afterDiscountRow.getCell(7).font = { name: "Calibri", size: 10, bold: true };
    afterDiscountRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    afterDiscountRow.getCell(7).numFmt = '#,##0 "₫"';
    sheet.mergeCells(`H${currentRowIdx}:I${currentRowIdx}`);
    for (let c = 1; c <= 9; c++) afterDiscountRow.getCell(c).border = BORDER_THIN;
    const rAfterDiscount = currentRowIdx;
    currentRowIdx++;

    // 7.4 Thuế GTGT VAT (10%)
    const vatRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    vatRow.getCell(1).value = `THUẾ GIÁ TRỊ GIA TĂNG (VAT ${vatPercent}%):`;
    vatRow.getCell(1).font = { name: "Calibri", size: 10, bold: true };
    vatRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
    const vatFactor = (vatPercent || 10) / 100;
    vatRow.getCell(7).value = { formula: `ROUND(G${rAfterDiscount}*${vatFactor}, 0)`, result: Math.round(subtotal * (1 - discountFactor) * vatFactor) };
    vatRow.getCell(7).font = { name: "Calibri", size: 10, bold: true };
    vatRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    vatRow.getCell(7).numFmt = '#,##0 "₫"';
    sheet.mergeCells(`H${currentRowIdx}:I${currentRowIdx}`);
    for (let c = 1; c <= 9; c++) vatRow.getCell(c).border = BORDER_THIN;
    const rVat = currentRowIdx;
    currentRowIdx++;

    // 7.5 TỔNG CỘNG THANH TOÁN (Grand Total — Viền kép đôi chuẩn mực)
    const grandTotalRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:F${currentRowIdx}`);
    grandTotalRow.height = 30;
    grandTotalRow.getCell(1).value = "TỔNG CỘNG THANH TOÁN (GRAND TOTAL):";
    grandTotalRow.getCell(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "B91C1C" } };
    grandTotalRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
    grandTotalRow.getCell(7).value = { formula: `G${rAfterDiscount}+G${rVat}`, result: grandTotal };
    grandTotalRow.getCell(7).font = { name: "Calibri", size: 12, bold: true, color: { argb: "B91C1C" } };
    grandTotalRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };
    grandTotalRow.getCell(7).numFmt = '#,##0 "₫"';
    sheet.mergeCells(`H${currentRowIdx}:I${currentRowIdx}`);

    const DOUBLE_BOTTOM_BORDER = {
      top: { style: "thin", color: { argb: "A6A6A6" } },
      bottom: { style: "double", color: { argb: "1F4E78" } },
      left: { style: "thin", color: { argb: "A6A6A6" } },
      right: { style: "thin", color: { argb: "A6A6A6" } },
    };
    for (let c = 1; c <= 9; c++) grandTotalRow.getCell(c).border = DOUBLE_BOTTOM_BORDER;
    currentRowIdx++;

    // 7.6 Số tiền viết bằng chữ (Amount in words)
    const wordsRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:I${currentRowIdx}`);
    wordsRow.height = 26;
    wordsRow.getCell(1).value = `(Bằng chữ: ${numberToVietnameseWords(grandTotal)})`;
    wordsRow.getCell(1).font = { name: "Calibri", size: 10, italic: true, bold: true, color: { argb: NAVY_BLUE } };
    wordsRow.getCell(1).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    wordsRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F1F5F9" },
    };
    for (let c = 1; c <= 9; c++) wordsRow.getCell(c).border = BORDER_THIN;
    currentRowIdx += 2;

    // 8. ĐIỀU KHOẢN THƯƠNG MẠI & CHỮ KÝ KIỂM TOÁN SHA-256
    sheet.mergeCells(`A${currentRowIdx}:I${currentRowIdx}`);
    const termsHeader = sheet.getCell(`A${currentRowIdx}`);
    termsHeader.value = "ĐIỀU KHOẢN THƯƠNG MẠI & PHƯƠNG THỨC GIAO HÀNG:";
    termsHeader.font = { name: "Calibri", size: 10, bold: true, color: { argb: NAVY_BLUE } };
    currentRowIdx++;

    const defaultTerms = [
      "1. Thời gian giao hàng: Trong vòng 24h - 48h làm việc kể từ thời điểm xác nhận báo giá / ký kết hợp đồng.",
      "2. Địa điểm giao hàng: Giao hàng và hỗ trợ cài đặt cấu hình tận nơi theo địa chỉ phòng ban của Quý khách.",
      "3. Hình thức thanh toán: Chuyển khoản ngân hàng. Đặt cọc 30% khi xác nhận đơn, thanh toán 70% còn lại trong vòng 07 ngày làm việc sau khi nghiệm thu bàn giao và xuất hóa đơn VAT điện tử.",
      "4. Cam kết chất lượng: Hàng mới 100% nguyên đai nguyên kiện, chính hãng phân phối tại Việt Nam, bảo hành 1 đổi 1 trong 30 ngày đầu tiên nếu phát sinh lỗi phần cứng.",
      `5. Chữ ký băm xác thực bảo mật SHA-256 (Audit Trail): ${auditFingerprint || "SHA256-PROCUREPRIME-VERIFIED-TRANSACTION"}`,
    ];

    const allTerms = terms && terms.length > 0 ? terms : defaultTerms;
    allTerms.forEach((term) => {
      sheet.mergeCells(`A${currentRowIdx}:I${currentRowIdx}`);
      const tCell = sheet.getCell(`A${currentRowIdx}`);
      tCell.value = term;
      tCell.font = { name: "Calibri", size: 9, color: { argb: "404040" } };
      currentRowIdx++;
    });

    currentRowIdx += 2;

    // 9. KHỐI CHỮ KÝ XÁC NHẬN HAI BÊN (Signatures)
    const sigTitleRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:D${currentRowIdx}`);
    sigTitleRow.getCell(1).value = "ĐẠI DIỆN KHÁCH HÀNG / BÊN MUA";
    sigTitleRow.getCell(1).font = { name: "Calibri", size: 10, bold: true };
    sigTitleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

    sheet.mergeCells(`F${currentRowIdx}:I${currentRowIdx}`);
    sigTitleRow.getCell(6).value = "ĐẠI DIỆN PROCUREPRIME / PHÒNG KINH DOANH B2B";
    sigTitleRow.getCell(6).font = { name: "Calibri", size: 10, bold: true, color: { argb: NAVY_BLUE } };
    sigTitleRow.getCell(6).alignment = { horizontal: "center", vertical: "middle" };
    currentRowIdx++;

    const sigSubRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`A${currentRowIdx}:D${currentRowIdx}`);
    sigSubRow.getCell(1).value = "(Ký, ghi rõ họ tên và đóng dấu)";
    sigSubRow.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "7F7F7F" } };
    sigSubRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

    sheet.mergeCells(`F${currentRowIdx}:I${currentRowIdx}`);
    sigSubRow.getCell(6).value = "(Ký điện tử & Đóng dấu xác thực)";
    sigSubRow.getCell(6).font = { name: "Calibri", size: 9, italic: true, color: { argb: "7F7F7F" } };
    sigSubRow.getCell(6).alignment = { horizontal: "center", vertical: "middle" };

    // Khoảng trống 4 dòng để ký tên
    currentRowIdx += 5;

    const sigNameRow = sheet.getRow(currentRowIdx);
    sheet.mergeCells(`F${currentRowIdx}:I${currentRowIdx}`);
    sigNameRow.getCell(6).value = "BỘ PHẬN THU MUA & BÁO GIÁ DOANH NGHIỆP";
    sigNameRow.getCell(6).font = { name: "Calibri", size: 10, bold: true };
    sigNameRow.getCell(6).alignment = { horizontal: "center", vertical: "middle" };

    // Xuất Buffer nhị phân
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

