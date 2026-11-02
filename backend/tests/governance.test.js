// backend/tests/governance.test.js
// ============================================
// GOVERNANCE TEST SUITE — Kiểm chứng Phase 4: Governance & Policy Shield
// Kế thừa và chuẩn hóa từ kiến trúc Multi-Layer Governance EDUREF_AI
// ============================================

import assert from "node:assert/strict";
import { test, describe } from "node:test";
import {
  POLICY_DECISION,
  POLICY_CLASSIFICATION,
  AUTHORITY_LEVEL,
  POLICY_THRESHOLDS,
} from "../src/modules/governance/PolicyContracts.js";
import { ProcurementPolicyEngine } from "../src/modules/governance/ProcurementPolicyEngine.js";
import { AuditTrailService } from "../src/modules/governance/AuditTrailService.js";
import { ToolRegistry } from "../modules/ai-agent/tools/ToolRegistry.js";
import { AppError } from "../src/shared/errors/AppError.js";

describe("🛡️ ProcurePrime Phase 4: Governance & Policy Shield Tests", () => {
  describe("1. ProcurementPolicyEngine (Deterministic Multi-Layer Policy)", () => {
    test("ROUTINE -> AUTO_APPROVED: Đơn hàng <= 50 triệu và nằm trong ngân sách trần", () => {
      const items = [{ name: "Máy in HP LaserJet", quantity: 5 }];
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items,
        maxBudget: 60_000_000,
        currentTotal: 35_000_000,
        organization: { name: "Công ty ABC", status: "ACTIVE" },
      });

      assert.strictEqual(result.decision, POLICY_DECISION.AUTO_APPROVED);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.ROUTINE);
      assert.strictEqual(result.authorityLevel, AUTHORITY_LEVEL.SPECIALIST);
      assert.strictEqual(result.requiresApproval, false);
      assert.strictEqual(result.actionableQuestion, null);
    });

    test("ROUTINE_POLICY_DENY -> REJECTED_POLICY: Chặn đứng lập tức khi vượt trần ngân sách", () => {
      const items = [{ name: "Laptop Dell Vostro", quantity: 10 }];
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items,
        maxBudget: 150_000_000,
        currentTotal: 180_000_000, // Vượt 30 triệu
      });

      assert.strictEqual(result.decision, POLICY_DECISION.REJECTED_POLICY);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.ROUTINE_POLICY_DENY);
      assert.ok(result.reason.includes("vượt quá trần ngân sách cho phép"));
      assert.ok(result.actionableQuestion.includes("Vui lòng giảm số lượng hoặc chọn phân khúc thiết bị tối ưu hơn"));
    });

    test("ROUTINE_POLICY_DENY -> REJECTED_POLICY: Chặn đứng khi tài khoản doanh nghiệp bị SUSPENDED", () => {
      const items = [{ name: "Bàn phím cơ", quantity: 2 }];
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items,
        maxBudget: 10_000_000,
        currentTotal: 3_000_000,
        organization: { name: "Doanh nghiệp Vi Phạm", status: "SUSPENDED" },
      });

      assert.strictEqual(result.decision, POLICY_DECISION.REJECTED_POLICY);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.ROUTINE_POLICY_DENY);
      assert.ok(result.reason.includes("TẠM KHÓA (SUSPENDED)"));
    });

    test("UNKNOWN_FACT -> ASK_CLARIFICATION: Hỏi lại khi danh sách thiết bị rỗng", () => {
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items: [],
        currentTotal: 0,
      });

      assert.strictEqual(result.decision, POLICY_DECISION.ASK_CLARIFICATION);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.UNKNOWN_FACT);
      assert.ok(result.actionableQuestion.includes("Quý doanh nghiệp cần trang bị những thiết bị hoặc danh mục nào?"));
    });

    test("UNKNOWN_FACT -> ASK_CLARIFICATION: Hỏi lại khi thiết bị chưa có số lượng cụ thể", () => {
      const items = [
        { name: "Màn hình Dell 24 inch", quantity: null },
      ];
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items,
        currentTotal: 0,
      });

      assert.strictEqual(result.decision, POLICY_DECISION.ASK_CLARIFICATION);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.UNKNOWN_FACT);
      assert.ok(result.reason.includes("chưa có số lượng hợp lệ"));
    });

    test("BEYOND_AUTHORITY -> ESCALATE_TO_STAFF (MANAGER): Đơn hàng 50M - 200M cần Trưởng phòng duyệt", () => {
      const items = [{ name: "Máy trạm Workstation", quantity: 4 }];
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items,
        maxBudget: 200_000_000,
        currentTotal: 120_000_000, // Nằm giữa 50M và 200M
      });

      assert.strictEqual(result.decision, POLICY_DECISION.ESCALATE_TO_STAFF);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.BEYOND_AUTHORITY);
      assert.strictEqual(result.authorityLevel, AUTHORITY_LEVEL.MANAGER);
      assert.strictEqual(result.requiresApproval, true);
      assert.ok(result.reason.includes("Trưởng phòng Mua sắm (Procurement Manager)"));
    });

    test("BEYOND_AUTHORITY -> ESCALATE_TO_STAFF (CFO): Đơn hàng > 200M cần Giám đốc Tài chính duyệt", () => {
      const items = [{ name: "Hệ thống Server Doanh Nghiệp", quantity: 2 }];
      const result = ProcurementPolicyEngine.evaluatePolicy({
        items,
        maxBudget: 500_000_000,
        currentTotal: 350_000_000, // Lớn hơn 200M
      });

      assert.strictEqual(result.decision, POLICY_DECISION.ESCALATE_TO_STAFF);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.BEYOND_AUTHORITY);
      assert.strictEqual(result.authorityLevel, AUTHORITY_LEVEL.CFO);
      assert.strictEqual(result.requiresApproval, true);
      assert.ok(result.reason.includes("Giám đốc Tài chính (CFO)"));
    });

    test("Fail-Fast: Ném lỗi ngay khi truyền tham số sai kiểu dữ liệu (không phòng vệ ||)", () => {
      assert.throws(
        () => ProcurementPolicyEngine.evaluatePolicy({ items: "invalid", currentTotal: 100 }),
        (err) => err instanceof AppError && err.statusCode === 422
      );
      assert.throws(
        () => ProcurementPolicyEngine.evaluatePolicy({ items: [], currentTotal: -500 }),
        (err) => err instanceof AppError && err.statusCode === 422
      );
    });
  });

  describe("2. AuditTrailService (Tính Toàn Vẹn Chuỗi Băm SHA-256)", () => {
    test("canonicalStringify đồng nhất kết quả bất kể thứ tự thuộc tính của JSON", () => {
      const objA = { z: 1, a: "test", m: { y: 2, b: 3 } };
      const objB = { a: "test", m: { b: 3, y: 2 }, z: 1 };

      const strA = AuditTrailService.canonicalStringify(objA);
      const strB = AuditTrailService.canonicalStringify(objB);

      assert.strictEqual(strA, strB);
      assert.strictEqual(strA, '{"a":"test","m":{"b":3,"y":2},"z":1}');
    });

    test("calculateHash sinh mã băm SHA-256 64 ký tự hex nhất quán", () => {
      const payload = {
        previousHash: AuditTrailService.GENESIS_HASH,
        actorType: "AI_AGENT",
        action: "TEST_ACTION",
        decision: "AUTO_APPROVED",
        reason: "Hợp lệ",
        inputSnapshot: { key: "value" },
        timestamp: "2026-11-01T15:00:00.000Z",
      };

      const hash1 = AuditTrailService.calculateHash(payload);
      const hash2 = AuditTrailService.calculateHash(payload);

      assert.strictEqual(hash1.length, 64);
      assert.strictEqual(hash1, hash2);
    });

    test("createAuditRecord tạo bản ghi kiểm toán gắn previousHash và hash mới", () => {
      const record = AuditTrailService.createAuditRecord({
        actorType: "AI_AGENT",
        action: "POLICY_CHECK",
        decision: "AUTO_APPROVED",
        reason: "Trong hạn mức",
        inputSnapshot: { total: 20_000_000 },
      });

      assert.strictEqual(record.previousHash, AuditTrailService.GENESIS_HASH);
      assert.strictEqual(typeof record.hash, "string");
      assert.strictEqual(record.hash.length, 64);
    });

    test("verifyChain xác thực chuỗi hash nối tiếp thành công khi nguyên vẹn", () => {
      const rec1 = AuditTrailService.createAuditRecord({
        previousHash: AuditTrailService.GENESIS_HASH,
        action: "ACTION_1",
        decision: "AUTO_APPROVED",
        timestamp: "2026-11-01T15:01:00.000Z",
      });

      const rec2 = AuditTrailService.createAuditRecord({
        previousHash: rec1.hash,
        action: "ACTION_2",
        decision: "ESCALATE_TO_STAFF",
        timestamp: "2026-11-01T15:02:00.000Z",
      });

      const chain = [rec1, rec2];
      const result = AuditTrailService.verifyChain(chain);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.verifiedCount, 2);
    });

    test("verifyChain phát hiện ngay lập tức dữ liệu bị giả mạo / can thiệp trái phép", () => {
      const rec1 = AuditTrailService.createAuditRecord({
        previousHash: AuditTrailService.GENESIS_HASH,
        action: "ACTION_1",
        decision: "AUTO_APPROVED",
        timestamp: "2026-11-01T15:01:00.000Z",
      });

      const rec2 = AuditTrailService.createAuditRecord({
        previousHash: rec1.hash,
        action: "ACTION_2",
        decision: "ESCALATE_TO_STAFF",
        timestamp: "2026-11-01T15:02:00.000Z",
      });

      // Kẻ gian cố tình sửa decision của rec1 từ AUTO_APPROVED thành REJECTED_POLICY
      const tamperedChain = [
        { ...rec1, decision: "REJECTED_POLICY" },
        rec2,
      ];

      const result = AuditTrailService.verifyChain(tamperedChain);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.brokenIndex, 0);
      assert.ok(result.reason.includes("Phát hiện giả mạo dữ liệu"));
    });
  });

  describe("3. ToolRegistry evaluate_procurement_policy Integration", () => {
    test("Tool evaluate_procurement_policy thực thi và trả về auditFingerprint", async () => {
      const tool = ToolRegistry.getTool("evaluate_procurement_policy");
      assert.ok(tool, "Tool evaluate_procurement_policy phải tồn tại trong ToolRegistry");

      const params = {
        items: [{ name: "Laptop ASUS Vivobook", quantity: 3 }],
        maxBudget: 60_000_000,
        currentTotal: 45_000_000,
      };

      const result = await ToolRegistry.executeTool("evaluate_procurement_policy", params);

      assert.strictEqual(result.decision, POLICY_DECISION.AUTO_APPROVED);
      assert.strictEqual(result.classification, POLICY_CLASSIFICATION.ROUTINE);
      assert.ok(typeof result.auditFingerprint === "string" && result.auditFingerprint.length === 64);
    });
  });
});

