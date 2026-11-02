// backend/tests/domain.test.js
// ============================================
// DOMAIN TEST SUITE — Kiểm chứng Phase 2: Core Business Domain & Fail-Fast
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { BudgetValidationService } from "../src/modules/procurement/BudgetValidationService.js";
import { SpecificationMatchingService } from "../src/modules/procurement/SpecificationMatchingService.js";
import { AppError } from "../src/shared/errors/AppError.js";
import Organization from "../models/OrganizationModel.js";
import ProcurementRequest from "../models/ProcurementRequestModel.js";
import Quotation from "../models/QuotationModel.js";

describe("🏢 ProcurePrime Phase 2: Core Business Domain Tests", () => {
  describe("1. BudgetValidationService (Kiểm toán ngân sách & Loại bỏ phòng vệ '||')", () => {
    test("Tính toán chuẩn xác: Subtotal, Chiết khấu B2B 5%, VAT 10% và GrandTotal", () => {
      const items = [
        { productId: "p1", productName: "Laptop Dell Vostro 3520", unitPrice: 15000000, quantity: 5 },
        { productId: "p2", productName: "Bộ chuột phím Logitech MK240", unitPrice: 500000, quantity: 5 },
      ];
      // Subtotal = 5 * 15tr + 5 * 500k = 75tr + 2.5tr = 77.5tr
      // Chiết khấu sỉ 5% = 3.875.000 VNĐ
      // Sau chiết khấu = 73.625.000 VNĐ
      // VAT 10% = 7.362.500 VNĐ
      // GrandTotal = 80.987.500 VNĐ
      const maxBudget = 90000000; // 90 triệu VNĐ

      const result = BudgetValidationService.validateAndCalculate(items, maxBudget);

      assert.strictEqual(result.subtotal, 77500000);
      assert.strictEqual(result.discountPercent, 5);
      assert.strictEqual(result.discountAmount, 3875000);
      assert.strictEqual(result.amountAfterDiscount, 73625000);
      assert.strictEqual(result.vatPercent, 10);
      assert.strictEqual(result.vatAmount, 7362500);
      assert.strictEqual(result.grandTotal, 80987500);
      assert.strictEqual(result.isExceeded, false);
      assert.ok(result.grandTotal <= maxBudget, "Tổng chi phí phải nằm trong ngân sách");
    });

    test("Ném lỗi ERR_BUDGET_CAP_EXCEEDED khi tổng tiền vượt trần ngân sách", () => {
      const items = [
        { productId: "p1", productName: "Laptop Gaming Dell G15", unitPrice: 25000000, quantity: 4 }, // 100tr
      ];
      const tightBudget = 90000000; // Ngân sách chỉ 90 triệu

      assert.throws(
        () => {
          BudgetValidationService.validateAndCalculate(items, tightBudget);
        },
        (err) => {
          assert.ok(err instanceof AppError);
          assert.strictEqual(err.errorCode, "ERR_BUDGET_CAP_EXCEEDED");
          assert.strictEqual(err.statusCode, 422);
          assert.ok(err.details.variance > 0, "Phải báo cáo số tiền vượt");
          return true;
        }
      );
    });

    test("Fail-Fast: Ném lỗi ngay khi thiếu đơn giá (Không dùng '|| 0' để che giấu)", () => {
      const itemsWithMissingPrice = [
        { productId: "p1", productName: "Laptop Không Giá", unitPrice: null, quantity: 2 },
      ];

      assert.throws(
        () => {
          BudgetValidationService.validateAndCalculate(itemsWithMissingPrice, 50000000);
        },
        (err) => {
          assert.ok(err instanceof AppError);
          assert.strictEqual(err.errorCode, "ERR_INVALID_UNIT_PRICE");
          assert.strictEqual(err.statusCode, 400);
          return true;
        }
      );
    });

    test("Fail-Fast: Ném lỗi ngay khi số lượng <= 0", () => {
      const itemsWithInvalidQty = [
        { productId: "p1", productName: "Laptop Văn Phòng", unitPrice: 15000000, quantity: 0 },
      ];

      assert.throws(
        () => {
          BudgetValidationService.validateAndCalculate(itemsWithInvalidQty, 50000000);
        },
        (err) => {
          assert.ok(err instanceof AppError);
          assert.strictEqual(err.errorCode, "ERR_INVALID_QUANTITY");
          return true;
        }
      );
    });
  });

  describe("2. SpecificationMatchingService (So khớp cấu hình kỹ thuật)", () => {
    test("Bóc tách chuẩn xác thông số từ câu lệnh tự nhiên", () => {
      const query = "Cần 5 laptop văn phòng RAM tối thiểu 16GB, ổ cứng SSD 512GB, chạy chip Core i7";
      const specs = SpecificationMatchingService.extractSpecsFromText(query);

      assert.strictEqual(specs.minRamGb, 16);
      assert.strictEqual(specs.minStorageGb, 512);
      assert.strictEqual(specs.cpuFamily, "CORE I7");
    });

    test("Đánh giá sản phẩm đạt yêu cầu cấu hình", () => {
      const product = {
        _id: "prod_001",
        name: "Dell Latitude 5530 16GB RAM 512GB SSD Core i7",
        description: "Laptop doanh nghiệp hiệu năng cao",
        specifications: [
          { key: "RAM", value: "16GB DDR4" },
          { key: "Ổ cứng", value: "512GB SSD NVMe" },
        ],
      };

      const matchResult = SpecificationMatchingService.matchProductSpecs(product, {
        minRamGb: 16,
        cpuFamily: "CORE I7",
      });

      assert.strictEqual(matchResult.isMatched, true);
      assert.strictEqual(matchResult.matchScore, 100);
      assert.ok(matchResult.matchedSpecs.ram);
      assert.ok(matchResult.matchedSpecs.cpu);
    });

    test("Phát hiện sản phẩm không đủ cấu hình RAM", () => {
      const lowSpecProduct = {
        _id: "prod_002",
        name: "Asus Vivobook 8GB RAM Core i3",
        description: "Laptop giá rẻ học sinh sinh viên",
        specifications: [{ key: "RAM", value: "8GB DDR4" }],
      };

      const matchResult = SpecificationMatchingService.matchProductSpecs(lowSpecProduct, {
        minRamGb: 16,
      });

      assert.strictEqual(matchResult.isMatched, false);
      assert.ok(matchResult.failedSpecs.length > 0);
      assert.ok(matchResult.matchScore < 100);
    });
  });

  describe("3. Domain Model Schemas (Cấu trúc dữ liệu B2B)", () => {
    test("OrganizationModel định nghĩa đúng các trường bắt buộc và validate taxCode", () => {
      assert.ok(Organization.schema.path("taxCode"));
      assert.ok(Organization.schema.path("approvalLimit"));
      assert.ok(Organization.schema.path("tier"));
    });

    test("ProcureRequestModel định nghĩa đúng maxBudget và items", () => {
      assert.ok(ProcurementRequest.schema.path("maxBudget"));
      assert.ok(ProcurementRequest.schema.path("naturalLanguageQuery"));
      assert.ok(ProcurementRequest.schema.path("items"));
    });

    test("QuotationModel định nghĩa đúng các trường thuế, chiết khấu và auditFingerprint", () => {
      assert.ok(Quotation.schema.path("quotationNumber"));
      assert.ok(Quotation.schema.path("volumeDiscountPercent"));
      assert.ok(Quotation.schema.path("vatAmount"));
      assert.ok(Quotation.schema.path("auditFingerprint"));
    });
  });
});

