// backend/tests/agent.test.js
// ============================================
// AGENT TEST SUITE — Kiểm chứng Phase 3: AI Agent & Requirement Extraction
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { RequirementExtractionEngine } from "../src/modules/ai-agent/extractor/RequirementExtractionEngine.js";
import { ToolRegistry } from "../modules/ai-agent/tools/ToolRegistry.js";
import { PromptEngine } from "../modules/ai-agent/core/PromptEngine.js";
import { AppError } from "../src/shared/errors/AppError.js";

describe("🤖 ProcurePrime Phase 3: AI Agent & Extraction Tests", () => {
  describe("1. RequirementExtractionEngine (Bóc tách văn bản tự nhiên)", () => {
    test("Bóc tách đầy đủ đơn hàng combo phức tạp của doanh nghiệp", () => {
      const query =
        "Công ty TNHH Giải Pháp AI cần trang bị cho 5 nhân viên: 5 laptop văn phòng RAM tối thiểu 16GB, 5 bộ chuột phím. Tổng ngân sách tối đa 90 triệu, cần xuất hóa đơn VAT.";
      const result = RequirementExtractionEngine.extract(query);

      assert.strictEqual(result.needsClarification, false, "Đơn hàng đầy đủ không cần làm rõ");
      assert.strictEqual(result.maxBudget, 90000000, "Trần ngân sách phải là 90 triệu VNĐ");
      assert.strictEqual(result.requireVAT, true, "Phải nhận diện yêu cầu xuất VAT");
      assert.ok(result.companyName.includes("Công ty TNHH Giải Pháp AI"), "Phải nhận diện tên công ty");

      // Kiểm tra items bóc tách
      assert.strictEqual(result.items.length, 2, "Phải nhận diện 2 nhóm thiết bị");
      const laptopItem = result.items.find((i) => i.category === "laptop");
      const mouseItem = result.items.find((i) => i.category === "accessory");

      assert.ok(laptopItem, "Phải có nhóm laptop");
      assert.strictEqual(laptopItem.quantity, 5, "Số lượng laptop phải là 5");
      assert.strictEqual(laptopItem.specifications.minRamGb, 16, "RAM tối thiểu phải là 16GB");

      assert.ok(mouseItem, "Phải có nhóm phụ kiện chuột phím");
      assert.strictEqual(mouseItem.quantity, 5, "Số lượng chuột phím phải là 5");
    });

    test("Phát hiện yêu cầu thiếu ngân sách trần và thiếu số lượng", () => {
      const incompleteQuery = "Công ty tôi cần mua laptop văn phòng cấu hình tốt.";
      const result = RequirementExtractionEngine.extract(incompleteQuery);

      assert.strictEqual(result.needsClarification, true, "Phải kích hoạt cờ needsClarification");
      assert.ok(result.missingFields.includes("max_budget"), "Phải nhận diện thiếu ngân sách");
      assert.ok(result.missingFields.includes("quantity_laptop"), "Phải nhận diện thiếu số lượng laptop");
      assert.ok(result.clarificationQuestions.length >= 2, "Phải sinh ra các câu hỏi gợi ý làm rõ");
    });

    test("Fail-Fast: Ném lỗi ngay khi văn bản yêu cầu rỗng", () => {
      assert.throws(
        () => {
          RequirementExtractionEngine.extract("");
        },
        (err) => {
          assert.ok(err instanceof AppError);
          assert.strictEqual(err.errorCode, "ERR_EMPTY_QUERY");
          return true;
        }
      );
    });
  });

  describe("2. ToolRegistry Input Validation (Chặn đứng truyền thiếu tham số)", () => {
    test("Thẩm định thành công khi truyền đủ tham số bắt buộc cho search_products", () => {
      const tool = ToolRegistry.getTool("search_products");
      assert.ok(tool, "Tool search_products phải tồn tại");

      assert.doesNotThrow(() => {
        ToolRegistry.validateToolArgs(tool, { keyword: "laptop dell" });
      });
    });

    test("Fail-Fast: Ném lỗi ngay khi thiếu tham số bắt buộc (keyword) của search_products", () => {
      const tool = ToolRegistry.getTool("search_products");

      assert.throws(() => {
        ToolRegistry.validateToolArgs(tool, {});
      }, /Thiếu tham số bắt buộc "keyword"/);

      assert.throws(() => {
        ToolRegistry.validateToolArgs(tool, { keyword: "   " });
      }, /Thiếu tham số bắt buộc "keyword"/);
    });

    test("Fail-Fast: Ném lỗi ngay khi thiếu mảng items của bulk_add_to_cart", () => {
      const tool = ToolRegistry.getTool("bulk_add_to_cart");
      assert.ok(tool, "Tool bulk_add_to_cart phải tồn tại");

      assert.throws(() => {
        ToolRegistry.validateToolArgs(tool, {});
      }, /Thiếu tham số bắt buộc "items"/);
    });
  });

  describe("3. PromptEngine B2B (Định danh tác tử & Phân tầng)", () => {
    test("Sinh System Instruction chứa đúng danh tính ProcurePrime và AgentX Prime", () => {
      const instruction = PromptEngine.buildSystemInstruction(["CART", "PRODUCT"]);

      assert.ok(instruction.includes("ProcurePrime"), "Phải chứa tên tác tử ProcurePrime");
      assert.ok(instruction.includes("AgentX Prime"), "Phải chứa tên đội thi AgentX Prime");
      assert.ok(instruction.includes("bulk_add_to_cart"), "Phải hướng dẫn sử dụng bulk_add_to_cart");
      assert.ok(instruction.includes("Báo giá"), "Phải chứa quy chuẩn Báo giá Doanh nghiệp");
    });
  });
});

