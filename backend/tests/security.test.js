// backend/tests/security.test.js
// ============================================
// SECURITY & OPTIMIZATION TEST SUITE
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import { escapeRegex, isValidObjectId } from "../utils/securityUtils.js";
import { securityHeaders, createRateLimiter } from "../middleware/securityMiddleware.js";

describe("🛡️ ProcurePrime Security & Optimization Tests", () => {
  describe("1. Security Utilities (ReDoS & Injection Shield)", () => {
    test("escapeRegex() thoát tất cả ký tự đặc biệt", () => {
      const malicious = "laptop.*+?^${}()|[]\\test";
      const escaped = escapeRegex(malicious);
      assert.strictEqual(escaped, "laptop\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test");
      // Đảm bảo tạo RegExp an toàn không ném lỗi
      assert.doesNotThrow(() => new RegExp(escaped, "i"));
    });

    test("escapeRegex() xử lý chuỗi rỗng và tham số không hợp lệ an toàn", () => {
      assert.strictEqual(escapeRegex(""), "");
      assert.strictEqual(escapeRegex(null), "");
      assert.strictEqual(escapeRegex(undefined), "");
      assert.strictEqual(escapeRegex(123), "");
    });

    test("isValidObjectId() nhận diện đúng chuẩn MongoDB ObjectId", () => {
      assert.strictEqual(isValidObjectId("507f1f77bcf86cd799439011"), true);
      assert.strictEqual(isValidObjectId("invalid-id"), false);
      assert.strictEqual(isValidObjectId("507f1f77bcf86cd79943901"), false); // 23 chars
      assert.strictEqual(isValidObjectId(null), false);
    });
  });

  describe("2. Security Headers Middleware", () => {
    test("Thiết lập đúng các header bảo vệ OWASP và ẩn X-Powered-By", () => {
      const headers = {};
      const req = {};
      const res = {
        setHeader(name, val) {
          headers[name] = val;
        },
        removeHeader(name) {
          delete headers[name];
        },
      };

      headers["X-Powered-By"] = "Express";
      let nextCalled = false;
      securityHeaders(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(headers["X-Content-Type-Options"], "nosniff");
      assert.strictEqual(headers["X-Frame-Options"], "SAMEORIGIN");
      assert.strictEqual(headers["X-XSS-Protection"], "1; mode=block");
      assert.strictEqual(headers["Strict-Transport-Security"], "max-age=31536000; includeSubDomains");
      assert.strictEqual(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
      assert.strictEqual(headers["X-Powered-By"], undefined);
    });
  });

  describe("3. Native Rate Limiter (Brute-Force & DoS Shield)", () => {
    test("Cho phép request trong ngưỡng và chặn khi vượt ngưỡng với HTTP 429", () => {
      const limiter = createRateLimiter({ windowMs: 1000, max: 3, message: "Too many requests" });
      const req = { headers: {}, socket: { remoteAddress: "192.168.1.100" }, baseUrl: "/test" };
      const resHeaders = {};
      let responseStatus = null;
      let responseBody = null;

      const res = {
        setHeader(name, val) {
          resHeaders[name] = val;
        },
        status(code) {
          responseStatus = code;
          return {
            json(body) {
              responseBody = body;
            },
          };
        },
      };

      let passCount = 0;
      // 3 request đầu tiên phải qua
      for (let i = 0; i < 3; i++) {
        limiter(req, res, () => {
          passCount++;
        });
      }
      assert.strictEqual(passCount, 3);
      assert.strictEqual(resHeaders["X-RateLimit-Remaining"], 0);

      // Request thứ 4 phải bị chặn với 429
      let blockedPassed = false;
      limiter(req, res, () => {
        blockedPassed = true;
      });
      assert.strictEqual(blockedPassed, false);
      assert.strictEqual(responseStatus, 429);
      assert.strictEqual(responseBody?.errorCode, "ERR_RATE_LIMIT_EXCEEDED");
    });
  });
});
