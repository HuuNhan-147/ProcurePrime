// backend/tests/quotation.test.js
// ============================================
// QUOTATION TEST SUITE — Kiểm chứng Phase 5: Quotation Engine & Pricing Rules
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { QuotationService } from "../src/modules/quotation/QuotationService.js";
import { QuotationTemplateRenderer } from "../src/modules/quotation/QuotationTemplateRenderer.js";
import { QuotationExcelExporter, numberToVietnameseWords } from "../src/modules/quotation/QuotationExcelExporter.js";
import { ToolRegistry } from "../modules/ai-agent/tools/ToolRegistry.js";
import { AppError } from "../src/shared/errors/AppError.js";

describe("📑 ProcurePrime Phase 5: Quotation Engine & Pricing Rules Tests", () => {
  describe("1. QuotationService (Sinh & Quản Lý Báo Giá B2B)", () => {
    test("Sinh số hiệu báo giá đúng định dạng chuẩn: PP-YYYYMMDD-XXXX", () => {
      const qNum = QuotationService.generateQuotationNumber();
      const regex = /^PP-\d{8}-[0-9A-F]{4}$/;
      assert.match(qNum, regex, `Mã báo giá "${qNum}" phải khớp định dạng PP-YYYYMMDD-XXXX`);
    });

    test("Tạo báo giá tự động duyệt (<= 50 triệu) có trạng thái ISSUED và chiết khấu sỉ", async () => {
      // 5 máy tính bàn x 8.000.000 đ = 40.000.000 đ
      // SL >= 5 -> Chiết khấu B2B 5% = 2.000.000 đ -> Sau chiết khấu = 38.000.000 đ
      // VAT 10% = 3.800.000 đ -> GrandTotal = 41.800.000 đ (<= 50M -> AUTO_APPROVED -> ISSUED)
      const items = [
        { productName: "Máy tính để bàn HP ProDesk", unitPrice: 8_000_000, quantity: 5 },
      ];

      const quotation = await QuotationService.createQuotation({
        items,
        organization: {
          name: "Công ty Công Nghệ Alpha",
          taxCode: "0312345678",
          address: "Quận 1, TP.HCM",
          phone: "0908889999",
          status: "ACTIVE",
        },
      });

      assert.strictEqual(quotation.subtotal, 40_000_000);
      assert.strictEqual(quotation.volumeDiscountPercent, 5);
      assert.strictEqual(quotation.volumeDiscountAmount, 2_000_000);
      assert.strictEqual(quotation.vatAmount, 3_800_000);
      assert.strictEqual(quotation.grandTotal, 41_800_000);
      assert.strictEqual(quotation.status, "ISSUED");
      assert.strictEqual(quotation.policyEvaluation.decision, "AUTO_APPROVED");
      assert.strictEqual(quotation.policyEvaluation.authorityLevel, "SPECIALIST");
      assert.strictEqual(typeof quotation.auditFingerprint, "string");
      assert.strictEqual(quotation.auditFingerprint.length, 64);
    });

    test("Tạo báo giá giá trị lớn (50M - 200M) có trạng thái DRAFT chờ Manager duyệt", async () => {
      // 10 laptop x 12.000.000 đ = 120.000.000 đ
      // Chiết khấu 5% = 6.000.000 đ -> Sau CK = 114.000.000 đ
      // VAT 10% = 11.400.000 đ -> GrandTotal = 125.400.000 đ (50M - 200M -> ESCALATE -> DRAFT)
      const items = [
        { productName: "Laptop Dell Vostro 15", unitPrice: 12_000_000, quantity: 10 },
      ];

      const quotation = await QuotationService.createQuotation({
        items,
        organization: {
          name: "Tập Đoàn Tài Chính Beta",
          taxCode: "0109998888",
          address: "Cầu Giấy, Hà Nội",
          phone: "0912345678",
          status: "ACTIVE",
        },
      });

      assert.strictEqual(quotation.status, "DRAFT");
      assert.strictEqual(quotation.policyEvaluation.decision, "ESCALATE_TO_STAFF");
      assert.strictEqual(quotation.policyEvaluation.authorityLevel, "MANAGER");
      assert.strictEqual(quotation.policyEvaluation.requiresApproval, true);
    });

    test("Chặn đứng lập tức khi tổng tiền vượt trần ngân sách phê duyệt", async () => {
      const items = [
        { productName: "Màn hình Dell UltraSharp", unitPrice: 10_000_000, quantity: 10 },
      ];

      await assert.rejects(
        async () => {
          await QuotationService.createQuotation({
            items,
            maxBudget: 80_000_000, // Trần 80M nhưng tổng tiền sau VAT > 100M
          });
        },
        (err) => err instanceof AppError && err.statusCode === 422
      );
    });

    test("Tra cứu và Phê duyệt báo giá (Approve Workflow) thành công", async () => {
      const items = [
        { productName: "Máy in Laser Đa Năng Brother", unitPrice: 15_000_000, quantity: 4 },
      ];

      const created = await QuotationService.createQuotation({
        items,
        organization: { name: "Doanh Nghiệp Test", taxCode: "0100000000", status: "ACTIVE" },
      });

      // Tra cứu báo giá
      const found = await QuotationService.getQuotation(created.quotationNumber);
      assert.strictEqual(found.quotationNumber, created.quotationNumber);

      // Phê duyệt báo giá
      const approved = await QuotationService.approveQuotation(created.quotationNumber, "MANAGER", "Đã duyệt ngân sách");
      assert.strictEqual(approved.status, "ISSUED");
      assert.strictEqual(approved.approvedBy, "MANAGER");
      assert.strictEqual(approved.approverNote, "Đã duyệt ngân sách");
    });
  });

  describe("2. QuotationTemplateRenderer (Render HTML Chuẩn Doanh Nghiệp)", () => {
    test("Render đầy đủ các thành phần thương mại, thuế và chữ ký băm SHA-256", async () => {
      const items = [
        { productName: "Máy trạm Dell Precision", unitPrice: 30_000_000, quantity: 2 },
      ];

      const quotation = await QuotationService.createQuotation({
        items,
        organization: {
          name: "Công ty Giải Pháp Phần Mềm Gamma",
          taxCode: "0301112223",
          address: "Tân Bình, TP.HCM",
          phone: "02838112233",
          status: "ACTIVE",
        },
      });

      const html = QuotationTemplateRenderer.renderToHtml(quotation);

      assert.ok(html.includes("<!DOCTYPE html>"), "Phải chứa doctype HTML");
      assert.ok(html.includes(quotation.quotationNumber), "Phải hiển thị số hiệu báo giá");
      assert.ok(html.includes("Công ty Giải Pháp Phần Mềm Gamma"), "Phải chứa tên công ty khách hàng");
      assert.ok(html.includes("0301112223"), "Phải chứa mã số thuế");
      assert.ok(html.includes("Máy trạm Dell Precision"), "Phải chứa tên thiết bị");
      assert.ok(html.includes("TỔNG THANH TOÁN"), "Phải chứa dòng tổng thanh toán");
      assert.ok(html.includes(quotation.auditFingerprint), "Phải chứa dấu băm SHA-256 Audit Trail");
      assert.ok(html.includes("ProcurePrime"), "Phải chứa thương hiệu ProcurePrime");
    });
  });

  describe("3. ToolRegistry create_quotation Integration", () => {
    test("Tool create_quotation thực thi và trả về kết quả kèm URL xem trước", async () => {
      const tool = ToolRegistry.getTool("create_quotation");
      assert.ok(tool, "Tool create_quotation phải tồn tại trong ToolRegistry");

      const params = {
        items: [
          { productName: "Chuột không dây Logitech", unitPrice: 500_000, quantity: 10 },
          { productName: "Bàn phím cơ văn phòng", unitPrice: 1_200_000, quantity: 10 },
        ],
        companyName: "Công ty Cổ Phần Logistics Delta",
        taxCode: "0105556667",
      };

      const result = await ToolRegistry.executeTool("create_quotation", params);

      assert.strictEqual(result.success, true);
      assert.ok(result.quotationNumber.startsWith("PP-"));
      assert.ok(result.previewUrl.includes(result.quotationNumber));
      assert.strictEqual(result.itemsCount, 2);
      assert.strictEqual(typeof result.auditFingerprint, "string");
      assert.strictEqual(result.auditFingerprint.length, 64);
    });
  });

  describe("4. QuotationExcelExporter (Render Excel B2B Chuẩn Doanh Nghiệp)", () => {
    test("Hàm numberToVietnameseWords chuyển đổi số tiền thành chữ tiếng Việt chuẩn", () => {
      assert.strictEqual(
        numberToVietnameseWords(85_850_000),
        "Tám mươi lăm triệu tám trăm năm mươi nghìn đồng chẵn."
      );
      assert.strictEqual(
        numberToVietnameseWords(50_000_000),
        "Năm mươi triệu đồng chẵn."
      );
    });

    test("Xuất Buffer file Excel (.xlsx) hợp lệ với định dạng nhị phân chuẩn PK", async () => {
      const items = [
        { productName: "Laptop ThinkPad E14 Gen 5", unitPrice: 17_000_000, quantity: 5 },
      ];
      const quotation = await QuotationService.createQuotation({
        items,
        organization: {
          name: "Công ty TNHH AI Solutions",
          taxCode: "0109998887",
          address: "Hà Nội",
          phone: "0912345678",
          status: "ACTIVE",
        },
      });

      const buffer = await QuotationExcelExporter.exportToBuffer(quotation);
      assert.ok(Buffer.isBuffer(buffer), "Kết quả phải là một Buffer nhị phân");
      assert.ok(buffer.length > 5000, "Dung lượng file Excel phải lớn hơn 5KB");
      assert.strictEqual(buffer[0], 0x50, "Header byte 0 phải là 'P'");
      assert.strictEqual(buffer[1], 0x4B, "Header byte 1 phải là 'K'");
    });
  });
});

