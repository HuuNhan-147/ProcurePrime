// backend/tests/e2e.test.js
// ============================================
// END-TO-END TEST SUITE — Kịch Bản Demo Toàn Diện Hackathon 2026
// Kịch bản hoàn chỉnh 8 bước: Từ yêu cầu ngôn ngữ tự nhiên -> Bóc tách B2B -> So khớp Specs
// -> Thẩm định Ngân sách -> Chặn quyền tự duyệt -> Sinh Báo giá & Ký số SHA-256 -> Phê duyệt Quản lý
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { RequirementExtractionEngine } from "../src/modules/ai-agent/extractor/RequirementExtractionEngine.js";
import { SpecificationMatchingService } from "../src/modules/procurement/SpecificationMatchingService.js";
import { BudgetValidationService } from "../src/modules/procurement/BudgetValidationService.js";
import { ProcurementPolicyEngine } from "../src/modules/governance/ProcurementPolicyEngine.js";
import { AuditTrailService } from "../src/modules/governance/AuditTrailService.js";
import { QuotationService } from "../src/modules/quotation/QuotationService.js";
import { QuotationTemplateRenderer } from "../src/modules/quotation/QuotationTemplateRenderer.js";
import { ToolRegistry } from "../modules/ai-agent/tools/ToolRegistry.js";

describe("🏆 ProcurePrime Phase 7: End-to-End Hackathon Demo Verification", () => {
  test("Kịch bản mua sắm trọn gói 8 bước của Doanh Nghiệp (Full Pipeline Verification)", async () => {
    // ----------------------------------------------------
    // BƯỚC 1: Người dùng nhập yêu cầu tự nhiên phức tạp
    // ----------------------------------------------------
    const userPrompt =
      "Công ty TNHH Giải Pháp AI cần trang bị cho 5 nhân viên: 5 laptop văn phòng RAM tối thiểu 16GB, 5 bộ chuột phím không dây. Tổng ngân sách tối đa 90 triệu, cần xuất hóa đơn VAT.";

    // ----------------------------------------------------
    // BƯỚC 2: AI Requirement Extraction Engine bóc tách dữ liệu
    // ----------------------------------------------------
    const extracted = RequirementExtractionEngine.extract(userPrompt);

    assert.strictEqual(extracted.needsClarification, false, "Yêu cầu đầy đủ, không cần hỏi lại");
    assert.strictEqual(extracted.maxBudget, 90_000_000, "Trần ngân sách là 90.000.000 đ");
    assert.strictEqual(extracted.requireVAT, true, "Phải yêu cầu hóa đơn VAT");
    assert.ok(extracted.companyName.includes("Công ty TNHH Giải Pháp AI"), "Nhận diện tên công ty");
    assert.strictEqual(extracted.items.length, 2, "Bóc tách được 2 hạng mục thiết bị");

    const laptopReq = extracted.items.find((i) => i.category === "laptop");
    assert.ok(laptopReq, "Phải nhận diện danh mục laptop");
    assert.strictEqual(laptopReq.quantity, 5, "Số lượng laptop phải là 5");
    assert.strictEqual(laptopReq.specifications.minRamGb, 16, "Cấu hình RAM tối thiểu là 16GB");

    // ----------------------------------------------------
    // BƯỚC 3: Specification Matching Service thẩm định cấu hình kỹ thuật
    // ----------------------------------------------------
    const candidateLaptopStandard = {
      name: "Laptop Dell Vostro 5620 Core i5 RAM 16GB SSD 512GB",
      specs: { ram: "16GB", ssd: "512GB", cpu: "Core i5" },
      price: 15_000_000,
    };
    const candidateLaptopSubstandard = {
      name: "Laptop HP 240 G8 Core i3 RAM 8GB SSD 256GB",
      specs: { ram: "8GB", ssd: "256GB", cpu: "Core i3" },
      price: 10_000_000,
    };

    const matchGood = SpecificationMatchingService.matchProductSpecs(candidateLaptopStandard, laptopReq.specifications);
    assert.strictEqual(matchGood.isMatched, true, "Máy 16GB RAM phải đạt yêu cầu");
    assert.strictEqual(matchGood.matchScore, 100, "Điểm khớp cấu hình phải đạt 100%");

    const matchBad = SpecificationMatchingService.matchProductSpecs(candidateLaptopSubstandard, laptopReq.specifications);
    assert.strictEqual(matchBad.isMatched, false, "Máy 8GB RAM không đạt cấu hình tối thiểu");

    // ----------------------------------------------------
    // BƯỚC 4: Budget Validation Service tính toán tài chính & chiết khấu B2B
    // ----------------------------------------------------
    const procurementItems = [
      { productName: candidateLaptopStandard.name, unitPrice: candidateLaptopStandard.price, quantity: 5 },
      { productName: "Bộ chuột phím không dây Logitech MK295", unitPrice: 1_000_000, quantity: 5 },
    ];

    // Subtotal = 5*15M + 5*1M = 80M đ
    // Tổng số lượng 10 >= 5 máy và Subtotal >= 50M -> Chiết khấu sỉ 5% = 4M đ -> Sau CK = 76M đ
    // Thuế VAT 10% = 7.6M đ -> Grand Total = 83.6M đ
    // 83.6M đ <= 90M đ (Trong trần ngân sách cho phép!)
    const budgetAnalysis = BudgetValidationService.validateAndCalculate(
      procurementItems,
      extracted.maxBudget
    );

    assert.strictEqual(budgetAnalysis.subtotal, 80_000_000);
    assert.strictEqual(budgetAnalysis.discountPercent, 5);
    assert.strictEqual(budgetAnalysis.discountAmount, 4_000_000);
    assert.strictEqual(budgetAnalysis.amountAfterDiscount, 76_000_000);
    assert.strictEqual(budgetAnalysis.vatAmount, 7_600_000);
    assert.strictEqual(budgetAnalysis.grandTotal, 83_600_000);
    assert.strictEqual(budgetAnalysis.isExceeded, false, "Nằm trong trần ngân sách 90 triệu");

    // ----------------------------------------------------
    // BƯỚC 5: Procurement Policy Engine thẩm định quyền hạn (EDUREF_AI Multi-Layer)
    // ----------------------------------------------------
    const policyResult = ProcurementPolicyEngine.evaluatePolicy({
      items: procurementItems,
      maxBudget: extracted.maxBudget,
      currentTotal: budgetAnalysis.grandTotal,
      organization: {
        name: extracted.companyName,
        status: "ACTIVE",
      },
    });

    // Vì tổng giá trị 83.6M > 50M (ngưỡng tự duyệt của nhân viên) nhưng <= 200M:
    // Hệ thống BẮT BUỘC leo thang phê duyệt tới Trưởng phòng Mua sắm (MANAGER)
    assert.strictEqual(policyResult.decision, "ESCALATE_TO_STAFF");
    assert.strictEqual(policyResult.classification, "BEYOND_AUTHORITY");
    assert.strictEqual(policyResult.authorityLevel, "MANAGER");
    assert.strictEqual(policyResult.requiresApproval, true);

    // ----------------------------------------------------
    // BƯỚC 6: Quotation Service khởi tạo Báo Giá Thương Mại & Ký Số SHA-256
    // ----------------------------------------------------
    const quotation = await QuotationService.createQuotation({
      items: procurementItems,
      organization: {
        name: extracted.companyName,
        taxCode: "0109988776",
        address: "Tòa nhà Keangnam, Hà Nội",
        phone: "02439998888",
        status: "ACTIVE",
      },
      maxBudget: extracted.maxBudget,
    });

    assert.ok(quotation.quotationNumber.startsWith("PP-"), "Có mã hiệu báo giá PP-");
    assert.strictEqual(quotation.grandTotal, 83_600_000, "Tổng thanh toán khớp tính toán");
    assert.strictEqual(quotation.status, "DRAFT", "Trạng thái DRAFT chờ phê duyệt từ Manager");
    assert.ok(typeof quotation.auditFingerprint === "string" && quotation.auditFingerprint.length === 64);

    // Kiểm tra render văn bản HTML báo giá
    const html = QuotationTemplateRenderer.renderToHtml(quotation);
    assert.ok(html.includes(quotation.quotationNumber));
    assert.ok(html.includes("83.600.000 đ"));
    assert.ok(html.includes(quotation.auditFingerprint));

    // ----------------------------------------------------
    // BƯỚC 7: Luồng Phê Duyệt Cấp Quản Lý (Manager Approval Workflow)
    // ----------------------------------------------------
    const approvedQuotation = await QuotationService.approveQuotation(
      quotation.quotationNumber,
      "MANAGER",
      "Đã đối soát trần ngân sách 90tr, phê duyệt cấp thiết bị theo đúng đề xuất."
    );

    assert.strictEqual(approvedQuotation.status, "ISSUED", "Chuyển trạng thái sang ISSUED chính thức");
    assert.strictEqual(approvedQuotation.approvedBy, "MANAGER");

    // ----------------------------------------------------
    // BƯỚC 8: Audit Trail Service xác thực tính toàn vẹn chuỗi băm bất biến
    // ----------------------------------------------------
    const event1 = AuditTrailService.createAuditRecord({
      previousHash: AuditTrailService.GENESIS_HASH,
      action: "EXTRACT_REQUIREMENT",
      decision: "SUCCESS",
      inputSnapshot: { prompt: userPrompt },
    });

    const event2 = AuditTrailService.createAuditRecord({
      previousHash: event1.hash,
      action: "EVALUATE_POLICY",
      decision: policyResult.decision,
      inputSnapshot: { grandTotal: budgetAnalysis.grandTotal },
    });

    const event3 = AuditTrailService.createAuditRecord({
      previousHash: event2.hash,
      action: "APPROVE_QUOTATION",
      decision: "APPROVED",
      inputSnapshot: { quotationNumber: quotation.quotationNumber },
    });

    const chainIntegrity = AuditTrailService.verifyChain([event1, event2, event3]);
    assert.strictEqual(chainIntegrity.valid, true, "Toàn bộ chuỗi kiểm toán 3 block đạt tính toàn vẹn 100%");
    assert.strictEqual(chainIntegrity.verifiedCount, 3);
  });
});
