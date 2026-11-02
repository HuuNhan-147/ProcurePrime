// backend/tests/foundation.test.js
// ============================================
// FOUNDATION TEST SUITE — Kiểm chứng tầng nền tảng Phase 1
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { validateEnv } from "../src/config/envValidator.js";
import { AppError } from "../src/shared/errors/AppError.js";
import { logger } from "../src/shared/logger.js";
import { sendSuccess, sendError } from "../src/shared/helpers/responseHelper.js";

describe("🏛️ ProcurePrime Phase 1: Foundation Tests", () => {
  test("1. validateEnv() thẩm định đúng các biến môi trường bắt buộc", () => {
    // Đảm bảo có các biến giả định nếu chạy local test
    process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/procureprime_test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_123456";

    const config = validateEnv();
    assert.ok(config, "Cấu hình trả về phải là một object");
    assert.strictEqual(typeof config.PORT, "number", "PORT phải là kiểu number");
    assert.ok(config.MONGO_URI.length > 0, "MONGO_URI không được rỗng");
    assert.ok(config.JWT_SECRET.length > 0, "JWT_SECRET không được rỗng");
  });

  test("2. AppError khởi tạo đúng mã lỗi, status code và operational flag", () => {
    const err = AppError.budgetExceeded("Vượt trần ngân sách", { maxBudget: 90000000, current: 95000000 });
    assert.strictEqual(err.statusCode, 422);
    assert.strictEqual(err.errorCode, "ERR_BUDGET_CAP_EXCEEDED");
    assert.strictEqual(err.isOperational, true);
    assert.strictEqual(err.details.maxBudget, 90000000);

    const policyErr = AppError.policyViolation("Không đủ quyền duyệt đơn", "UNAUTHORIZED_APPROVER");
    assert.strictEqual(policyErr.statusCode, 422);
    assert.strictEqual(policyErr.errorCode, "ERR_POLICY_UNAUTHORIZED_APPROVER");

    const notFoundErr = AppError.notFound("Không tìm thấy sản phẩm");
    assert.strictEqual(notFoundErr.statusCode, 404);
    assert.strictEqual(notFoundErr.errorCode, "ERR_NOT_FOUND");
  });

  test("3. Logger ghi log các cấp độ mà không ném lỗi", () => {
    assert.doesNotThrow(() => {
      logger.debug("Kiểm tra debug", "TestRunner");
      logger.info("Kiểm tra info", "TestRunner", { testId: "FND-01" });
      logger.warn("Cảnh báo thử nghiệm", "TestRunner");
      logger.error("Lỗi giả lập", "TestRunner", new Error("Lỗi test"));
    });
  });

  test("4. responseHelper chuẩn hóa đúng format API response", () => {
    // Mock response object
    let capturedStatus = null;
    let capturedJson = null;
    const mockRes = {
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(payload) {
        capturedJson = payload;
        return this;
      },
    };

    // Test sendSuccess
    sendSuccess(mockRes, { quoteId: "Q1001", total: 85000000 }, "Tạo báo giá thành công", 200, { page: 1 });
    assert.strictEqual(capturedStatus, 200);
    assert.strictEqual(capturedJson.success, true);
    assert.strictEqual(capturedJson.data.quoteId, "Q1001");
    assert.strictEqual(capturedJson.meta.page, 1);

    // Test sendError
    sendError(mockRes, "Sản phẩm hết hàng", 400, "ERR_OUT_OF_STOCK");
    assert.strictEqual(capturedStatus, 400);
    assert.strictEqual(capturedJson.success, false);
    assert.strictEqual(capturedJson.error.code, "ERR_OUT_OF_STOCK");
  });
});

