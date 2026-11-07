// backend/tests/governance.test.js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { GovernancePolicyService, TENANT_PRESETS } from "../src/modules/governance/GovernancePolicyService.js";
import { ProcurementPolicyEngine } from "../src/modules/governance/ProcurementPolicyEngine.js";

describe("🛡️ ProcurePrime Phase 6: Dynamic Governance Policy Tests", () => {
  test("1. getCachedPolicySync() trả về snapshot mặc định 50M / 200M an toàn", () => {
    const policy = GovernancePolicyService.getCachedPolicySync();
    assert.ok(policy);
    assert.equal(policy.thresholds.autoApprovalLimit, 50_000_000);
    assert.equal(policy.thresholds.managerApprovalLimit, 200_000_000);
    assert.equal(policy.pricingRules.wholesaleDiscountPercent, 5);
  });

  test("2. simulatePolicy() phân tầng chính xác theo giá trị đơn hàng", () => {
    // Test Case 1: Đơn 40M <= 50M -> TIER_1_AUTO (AUTO_APPROVED)
    const sim1 = GovernancePolicyService.simulatePolicy({ totalAmount: 40_000_000 });
    assert.equal(sim1.decision, "AUTO_APPROVED");
    assert.equal(sim1.authorityLevel, "SPECIALIST");
    assert.equal(sim1.resultingStatus, "ISSUED");

    // Test Case 2: Đơn 120M (50M - 200M) -> TIER_2_MANAGER (ESCALATE_TO_STAFF)
    const sim2 = GovernancePolicyService.simulatePolicy({ totalAmount: 120_000_000 });
    assert.equal(sim2.decision, "ESCALATE_TO_STAFF");
    assert.equal(sim2.authorityLevel, "MANAGER");
    assert.equal(sim2.resultingStatus, "DRAFT");

    // Test Case 3: Đơn 250M > 200M -> TIER_3_CFO (ESCALATE_TO_STAFF)
    const sim3 = GovernancePolicyService.simulatePolicy({ totalAmount: 250_000_000 });
    assert.equal(sim3.decision, "ESCALATE_TO_STAFF");
    assert.equal(sim3.authorityLevel, "CFO");
    assert.equal(sim3.resultingStatus, "DRAFT");

    // Test Case 4: Đơn vượt trần ngân sách -> REJECTED_POLICY
    const sim4 = GovernancePolicyService.simulatePolicy({ totalAmount: 90_000_000, maxBudget: 80_000_000 });
    assert.equal(sim4.decision, "REJECTED_POLICY");
    assert.equal(sim4.resultingStatus, "REJECTED");
  });

  test("3. simulatePolicy() với ngưỡng tùy biến (VD: nâng lên 60M) phản hồi đúng", () => {
    const customPolicy = {
      thresholds: {
        autoApprovalLimit: 60_000_000, // Nâng lên 60M
        managerApprovalLimit: 200_000_000,
      },
    };

    // Đơn 55M trước đây phải trình Manager, nay với ngưỡng 60M tự động AUTO_APPROVED!
    const sim = GovernancePolicyService.simulatePolicy({
      totalAmount: 55_000_000,
      customPolicy,
    });
    assert.equal(sim.decision, "AUTO_APPROVED");
    assert.equal(sim.resultingStatus, "ISSUED");
  });

  test("4. ProcurementPolicyEngine tích hợp ngưỡng động customThresholds", () => {
    const items = [{ name: "Dell Precision 3660", quantity: 2 }];
    const evalResult = ProcurementPolicyEngine.evaluatePolicy({
      items,
      currentTotal: 55_000_000,
      customThresholds: {
        autoApprovalLimit: 60_000_000,
        managerApprovalLimit: 200_000_000,
      },
    });

    assert.equal(evalResult.decision, "AUTO_APPROVED");
    assert.equal(evalResult.authorityLevel, "SPECIALIST");
  });

  test("5. evaluateDynamicRules (Kế thừa Midesk) thẩm định chuẩn xác điều kiện & toán tử", () => {
    const rules = [
      {
        id: "r1",
        name: "Kiểm soát chiết khấu dự án",
        matchType: "ALL",
        isActive: true,
        conditions: [{ field: "discountPercent", operator: ">", value: 10 }],
        actions: [{ actionType: "REQUIRE_APPROVAL", target: "LINE_MANAGER", message: "Chiết khấu vượt 10% cần duyệt" }],
      },
    ];

    // Case khớp: Chiết khấu 12% > 10%
    const match = GovernancePolicyService.evaluateDynamicRules({ discountPercent: 12 }, rules);
    assert.ok(match);
    assert.equal(match.matchedRule.id, "r1");
    assert.equal(match.actions[0].actionType, "REQUIRE_APPROVAL");

    // Case không khớp: Chiết khấu 8% <= 10%
    const noMatch = GovernancePolicyService.evaluateDynamicRules({ discountPercent: 8 }, rules);
    assert.equal(noMatch, null);
  });

  test("6. Multi-Tenant: Cùng đơn 45M chiết khấu 8%, Tenant A tự duyệt nhưng Tenant B chặn lại", () => {
    const orderRequest = {
      totalAmount: 45_000_000,
      discountPercent: 8,
      quoteValidityDays: 10,
    };

    // Tenant A (TechCorp): Auto 60M, CK tối đa 10% (ở đây 8% < 10%) -> Tự động duyệt!
    const simA = GovernancePolicyService.simulatePolicy({
      ...orderRequest,
      tenantId: "tenant_techcorp",
    });
    assert.equal(simA.decision, "AUTO_APPROVED");
    assert.equal(simA.resultingStatus, "ISSUED");

    // Tenant B (SteelCorp): Auto chỉ 20M (< 45M) VÀ CK tối đa chỉ 3% (< 8%) -> Chặn lại chuyển duyệt!
    const simB = GovernancePolicyService.simulatePolicy({
      ...orderRequest,
      tenantId: "tenant_steelcorp",
    });
    assert.equal(simB.decision, "ESCALATE_TO_STAFF");
    assert.equal(simB.resultingStatus, "DRAFT");
    assert.ok(simB.reason.includes("SteelCorp") || simB.authorityLevel === "CFO" || simB.authorityLevel === "MANAGER");
  });
});
