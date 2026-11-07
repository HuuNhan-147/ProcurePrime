// backend/src/modules/governance/GovernancePolicyService.js
// ============================================
// GOVERNANCE POLICY SERVICE — Quản Lý Quy Chế & Ngưỡng Phân Quyền Động
// Tích hợp: Multi-Tenant Partition, Dynamic Condition Evaluator (Kế thừa Midesk),
// In-Memory Cache, Fail-Safe Fallback, Hot-Reload và Audit Trail
// ============================================

import GovernancePolicy from "../../../models/GovernancePolicyModel.js";
import { AppError } from "../../shared/errors/AppError.js";

// Bộ thiết lập mẫu mặc định cho từng Doanh Nghiệp (Multi-Tenant Presets)
export const TENANT_PRESETS = Object.freeze({
  default_tenant: {
    policyKey: "DEFAULT_PROCUREMENT_POLICY",
    tenantId: "default_tenant",
    name: "Quy Chế Mua Sắm & Báo Giá Chuẩn Doanh Nghiệp",
    version: "1.0.0",
    isActive: true,
    thresholds: {
      autoApprovalLimit: 50_000_000,
      managerApprovalLimit: 200_000_000,
    },
    pricingRules: {
      wholesaleThresholdQuantity: 5,
      wholesaleThresholdSubtotal: 50_000_000,
      wholesaleDiscountPercent: 5,
      vatPercent: 10,
      quotationValidityDays: 15,
    },
    rules: [],
    auditHistory: [],
  },
  tenant_techcorp: {
    policyKey: "POLICY_TECHCORP_SAAS",
    tenantId: "tenant_techcorp",
    name: "Chính Sách Bán Hàng & Báo Giá TechCorp (SaaS B2B)",
    version: "1.0.0",
    isActive: true,
    thresholds: {
      autoApprovalLimit: 60_000_000,
      managerApprovalLimit: 250_000_000,
    },
    pricingRules: {
      wholesaleThresholdQuantity: 3,
      wholesaleThresholdSubtotal: 40_000_000,
      wholesaleDiscountPercent: 15, // Cho phép sales giảm giá tới 15%
      vatPercent: 10,
      quotationValidityDays: 30, // Báo giá hiệu lực 30 ngày
    },
    rules: [
      {
        id: "rule_techcorp_discount",
        name: "Thẩm quyền chiết khấu cao (> 10%)",
        description: "Chiết khấu trên 10% bắt buộc Trưởng phòng Kinh doanh phê duyệt",
        matchType: "ALL",
        isActive: true,
        conditions: [{ field: "discountPercent", operator: ">", value: 10 }],
        actions: [{ actionType: "REQUIRE_APPROVAL", target: "LINE_MANAGER", message: "Chiết khấu vượt 10% cần Trưởng phòng Sales phê duyệt" }],
      },
      {
        id: "rule_techcorp_validity",
        name: "Bảo lưu báo giá dài ngày (> 20 ngày)",
        description: "Báo giá hiệu lực trên 20 ngày cần xác nhận quỹ cam kết",
        matchType: "ALL",
        isActive: true,
        conditions: [{ field: "quoteValidityDays", operator: ">", value: 20 }],
        actions: [{ actionType: "REQUIRE_APPROVAL", target: "LINE_MANAGER", message: "Báo giá dài ngày yêu cầu phê duyệt thời hạn" }],
      },
    ],
    auditHistory: [],
  },
  tenant_steelcorp: {
    policyKey: "POLICY_STEELCORP_HEAVY",
    tenantId: "tenant_steelcorp",
    name: "Quy Chế Thu Mua Vật Tư & Thiết Bị SteelCorp (Biên Lãi Mỏng)",
    version: "1.0.0",
    isActive: true,
    thresholds: {
      autoApprovalLimit: 20_000_000, // Hạn chế tự duyệt
      managerApprovalLimit: 100_000_000,
    },
    pricingRules: {
      wholesaleThresholdQuantity: 10,
      wholesaleThresholdSubtotal: 100_000_000,
      wholesaleDiscountPercent: 3, // Chỉ cho giảm tối đa 3%
      vatPercent: 10,
      quotationValidityDays: 7, // Giá biến động, chỉ giữ 7 ngày
    },
    rules: [
      {
        id: "rule_steelcorp_strict_discount",
        name: "Kiểm soát chiết khấu nghiêm ngặt (> 3%)",
        description: "Bất kỳ mức chiết khấu nào trên 3% đều cần Giám đốc Tài chính duyệt",
        matchType: "ALL",
        isActive: true,
        conditions: [{ field: "discountPercent", operator: ">", value: 3 }],
        actions: [{ actionType: "REQUIRE_APPROVAL", target: "CFO", message: "Biên lợi nhuận mỏng, chiết khấu > 3% cần CFO duyệt trực tiếp" }],
      },
      {
        id: "rule_steelcorp_3bids",
        name: "Quy tắc 3 Báo giá cạnh tranh (Rule of 3 Bids)",
        description: "Đơn hàng trên 100 triệu bắt buộc phải có 3 báo giá cạnh tranh",
        matchType: "ALL",
        isActive: true,
        conditions: [{ field: "totalAmount", operator: ">=", value: 100_000_000 }],
        actions: [{ actionType: "REQUIRE_3_BIDS", target: "PROCUREMENT_DIRECTOR", message: "Bắt buộc đối chiếu tối thiểu 3 báo giá cạnh tranh trước khi ký PO" }],
      },
    ],
    auditHistory: [],
  },
});

export const DEFAULT_POLICY_SNAPSHOT = TENANT_PRESETS.default_tenant;

export class GovernancePolicyService {
  // In-Memory RAM Cache theo từng Tenant
  static _cacheMap = new Map();
  static CACHE_TTL_MS = 60_000; // 60 giây cache RAM

  /**
   * Lấy cấu hình Policy đồng bộ từ Cache RAM (Fallback an toàn)
   */
  static getCachedPolicySync(tenantId = "default_tenant") {
    const cached = this._cacheMap.get(tenantId);
    if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }
    return TENANT_PRESETS[tenantId] || DEFAULT_POLICY_SNAPSHOT;
  }

  /**
   * Lấy Policy đang hiệu lực của một Tenant từ Database hoặc Cache
   */
  static async getActivePolicy(tenantId = "default_tenant") {
    const now = Date.now();
    const cached = this._cacheMap.get(tenantId);
    if (cached && now - cached.fetchedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      let policyDoc = await GovernancePolicy.findOne({
        $or: [{ tenantId }, { policyKey: tenantId === "default_tenant" ? "DEFAULT_PROCUREMENT_POLICY" : "" }],
        isActive: true,
      }).lean();

      if (!policyDoc) {
        // Tự động khởi tạo theo preset mẫu của tenant tương ứng
        const preset = TENANT_PRESETS[tenantId] || {
          ...DEFAULT_POLICY_SNAPSHOT,
          tenantId,
          policyKey: `POLICY_${tenantId.toUpperCase()}`,
        };

        try {
          const newDoc = await GovernancePolicy.create({
            ...preset,
            auditHistory: [
              {
                updatedBy: "Hệ thống Khởi tạo",
                updatedAt: new Date(),
                changeReason: `Khởi tạo quy chế mẫu cho ${preset.name}`,
                diffSummary: { initialized: true },
              },
            ],
          });
          policyDoc = newDoc.toObject();
        } catch (seedErr) {
          console.warn(`⚠️ Không thể seed policy cho tenant [${tenantId}] vào MongoDB:`, seedErr.message);
          policyDoc = { ...preset };
        }
      }

      this._cacheMap.set(tenantId, { data: policyDoc, fetchedAt: now });
      return policyDoc;
    } catch (err) {
      console.warn(`⚠️ Lỗi truy vấn GovernancePolicy từ DB cho tenant [${tenantId}]:`, err.message);
      return this.getCachedPolicySync(tenantId);
    }
  }

  /**
   * Cập nhật quy chế mua sắm và bộ luật động từ Admin UI
   */
  static async updatePolicy({
    tenantId = "default_tenant",
    rules,
    thresholds,
    pricingRules,
    name,
    description,
    changeReason,
    updatedBy = "Quản Trị Viên",
  }) {
    if (!changeReason || typeof changeReason !== "string" || changeReason.trim().length < 5) {
      throw AppError.validationError("Bắt buộc phải nhập lý do điều chỉnh quy chế (tối thiểu 5 ký tự) để phục vụ kiểm toán nội bộ.");
    }

    // 1. Kiểm tra tính hợp lệ của các ngưỡng ngân sách
    if (thresholds) {
      const autoLimit = Number(thresholds.autoApprovalLimit);
      const managerLimit = Number(thresholds.managerApprovalLimit);

      if (isNaN(autoLimit) || autoLimit < 0) {
        throw AppError.validationError("Hạn mức tự duyệt (autoApprovalLimit) phải là số không âm.");
      }
      if (isNaN(managerLimit) || managerLimit <= autoLimit) {
        throw AppError.validationError(
          `Hạn mức Trưởng phòng duyệt (${managerLimit.toLocaleString("vi-VN")} ₫) phải lớn hơn hạn mức tự động duyệt (${autoLimit.toLocaleString("vi-VN")} ₫).`
        );
      }
    }

    // 2. Tìm hoặc khởi tạo bản ghi của Tenant
    let currentDoc = await GovernancePolicy.findOne({
      $or: [{ tenantId }, { policyKey: tenantId === "default_tenant" ? "DEFAULT_PROCUREMENT_POLICY" : "" }],
      isActive: true,
    });

    if (!currentDoc) {
      const preset = TENANT_PRESETS[tenantId] || DEFAULT_POLICY_SNAPSHOT;
      currentDoc = new GovernancePolicy({ ...preset, tenantId });
    }

    const previousSnapshot = {
      thresholds: { ...currentDoc.thresholds },
      pricingRules: { ...currentDoc.pricingRules },
      rulesCount: currentDoc.rules?.length || 0,
    };

    // 3. Áp dụng các thay đổi
    if (name) currentDoc.name = name.trim();
    if (description) currentDoc.description = description.trim();

    if (thresholds) {
      if (thresholds.autoApprovalLimit !== undefined) {
        currentDoc.thresholds.autoApprovalLimit = Number(thresholds.autoApprovalLimit);
      }
      if (thresholds.managerApprovalLimit !== undefined) {
        currentDoc.thresholds.managerApprovalLimit = Number(thresholds.managerApprovalLimit);
      }
    }

    if (pricingRules) {
      if (pricingRules.wholesaleDiscountPercent !== undefined) {
        currentDoc.pricingRules.wholesaleDiscountPercent = Number(pricingRules.wholesaleDiscountPercent);
      }
      if (pricingRules.vatPercent !== undefined) {
        currentDoc.pricingRules.vatPercent = Number(pricingRules.vatPercent);
      }
      if (pricingRules.quotationValidityDays !== undefined) {
        currentDoc.pricingRules.quotationValidityDays = Number(pricingRules.quotationValidityDays);
      }
      if (pricingRules.wholesaleThresholdQuantity !== undefined) {
        currentDoc.pricingRules.wholesaleThresholdQuantity = Number(pricingRules.wholesaleThresholdQuantity);
      }
      if (pricingRules.wholesaleThresholdSubtotal !== undefined) {
        currentDoc.pricingRules.wholesaleThresholdSubtotal = Number(pricingRules.wholesaleThresholdSubtotal);
      }
    }

    // 4. Cập nhật mảng luật động (Dynamic Rules từ UI Midesk-style)
    if (Array.isArray(rules)) {
      currentDoc.rules = rules.map((r, idx) => ({
        id: r.id || `rule_${Date.now()}_${idx}`,
        name: r.name || `Quy tắc ${idx + 1}`,
        description: r.description || "",
        matchType: r.matchType === "ANY" ? "ANY" : "ALL",
        isActive: r.isActive !== false,
        conditions: Array.isArray(r.conditions) ? r.conditions : [],
        actions: Array.isArray(r.actions) ? r.actions : [],
      }));
    }

    // Tăng version (1.0.0 -> 1.1.0)
    const versionParts = (currentDoc.version || "1.0.0").split(".");
    const minorVersion = Number(versionParts[1] || 0) + 1;
    currentDoc.version = `1.${minorVersion}.0`;

    // 5. Ghi lịch sử kiểm toán bất biến
    currentDoc.auditHistory.unshift({
      updatedBy,
      updatedAt: new Date(),
      changeReason: changeReason.trim(),
      diffSummary: {
        previous: previousSnapshot,
        current: {
          thresholds: currentDoc.thresholds,
          pricingRules: currentDoc.pricingRules,
          rulesCount: currentDoc.rules.length,
        },
      },
    });

    await currentDoc.save();

    // 6. Cập nhật In-Memory Cache tức thì
    const policyObj = currentDoc.toObject();
    this._cacheMap.set(tenantId, { data: policyObj, fetchedAt: Date.now() });

    console.log(`✅ [GovernancePolicyService] Đã cập nhật quy chế cho [${tenantId}] thành công (v${currentDoc.version}) bởi ${updatedBy}.`);
    return policyObj;
  }

  /**
   * Đánh giá danh sách Dynamic Rules kế thừa mô hình Midesk (Điều kiện - Toán tử - Giá trị)
   */
  static evaluateDynamicRules(context, rules) {
    if (!Array.isArray(rules) || rules.length === 0) return null;

    for (const rule of rules) {
      if (!rule.isActive || !Array.isArray(rule.conditions) || rule.conditions.length === 0) continue;

      const evalCondition = (cond) => {
        const actualVal = context[cond.field];
        if (actualVal === undefined || actualVal === null) return false;

        const targetVal = cond.value;
        switch (cond.operator) {
          case ">=":
            return Number(actualVal) >= Number(targetVal);
          case "<=":
            return Number(actualVal) <= Number(targetVal);
          case ">":
            return Number(actualVal) > Number(targetVal);
          case "<":
            return Number(actualVal) < Number(targetVal);
          case "==":
            return String(actualVal).trim().toLowerCase() === String(targetVal).trim().toLowerCase();
          case "!=":
            return String(actualVal).trim().toLowerCase() !== String(targetVal).trim().toLowerCase();
          case "contains":
            return String(actualVal).toLowerCase().includes(String(targetVal).toLowerCase());
          default:
            return false;
        }
      };

      const isMatched = rule.matchType === "ANY"
        ? rule.conditions.some(evalCondition)
        : rule.conditions.every(evalCondition);

      if (isMatched) {
        return {
          matchedRule: rule,
          actions: rule.actions || [],
        };
      }
    }

    return null;
  }

  /**
   * Chạy giả lập kiểm thử quy chế (Simulator Sandbox - KHÔNG lưu DB)
   * Hỗ trợ thẩm định cả Dynamic Rules (Midesk) và Decision Table Tiers (3 nấc)
   */
  static simulatePolicy({
    totalAmount,
    maxBudget = null,
    quantity = 1,
    discountPercent = 0,
    quoteValidityDays = 15,
    customPolicy = null,
    tenantId = "default_tenant",
  }) {
    const policy = customPolicy || this.getCachedPolicySync(tenantId);
    const currentTotal = Number(totalAmount) || 0;
    const parsedBudget = maxBudget !== null && maxBudget !== undefined ? Number(maxBudget) : null;
    const currentDiscount = Number(discountPercent) || 0;
    const currentValidity = Number(quoteValidityDays) || 15;

    // 1. Kiểm tra trần ngân sách (Hard Stop)
    if (parsedBudget !== null && parsedBudget > 0 && currentTotal > parsedBudget) {
      const exceeded = currentTotal - parsedBudget;
      return {
        matchedTier: "BUDGET_OVERRUN",
        decision: "REJECTED_POLICY",
        authorityLevel: "SPECIALIST",
        requiresApproval: false,
        resultingStatus: "REJECTED",
        reason: `Tổng chi phí (${currentTotal.toLocaleString("vi-VN")} ₫) vượt trần ngân sách (${parsedBudget.toLocaleString("vi-VN")} ₫). Vượt ${exceeded.toLocaleString("vi-VN")} ₫.`,
      };
    }

    // 2. Thẩm định qua Dynamic Rule Engine (Midesk-style)
    const context = {
      totalAmount: currentTotal,
      discountPercent: currentDiscount,
      quoteValidityDays: currentValidity,
      quantity: Number(quantity) || 1,
    };

    const dynamicMatch = this.evaluateDynamicRules(context, policy.rules);
    if (dynamicMatch) {
      const blockingAction = dynamicMatch.actions.find(
        (a) => a.actionType === "REQUIRE_APPROVAL" || a.actionType === "REQUIRE_3_BIDS" || a.actionType === "HARD_REJECT"
      );

      if (blockingAction) {
        if (blockingAction.actionType === "HARD_REJECT") {
          return {
            matchedTier: `DYNAMIC_RULE: ${dynamicMatch.matchedRule.name}`,
            decision: "REJECTED_POLICY",
            authorityLevel: "SPECIALIST",
            requiresApproval: false,
            resultingStatus: "REJECTED",
            reason: `Vi phạm quy tắc [${dynamicMatch.matchedRule.name}]: ${blockingAction.message || "Đơn hàng bị từ chối theo chính sách."}`,
            dynamicActions: dynamicMatch.actions,
          };
        }

        return {
          matchedTier: `DYNAMIC_RULE: ${dynamicMatch.matchedRule.name}`,
          decision: "ESCALATE_TO_STAFF",
          authorityLevel: blockingAction.target || "MANAGER",
          requiresApproval: true,
          resultingStatus: "DRAFT",
          reason: `Khớp quy tắc [${dynamicMatch.matchedRule.name}]: ${blockingAction.message || "Yêu cầu thực hiện hành động chính sách quy định."}`,
          dynamicActions: dynamicMatch.actions,
        };
      }
    }

    // 3. Fallback Thẩm định bậc thang (Decision Table Tiers)
    const { autoApprovalLimit, managerApprovalLimit } = policy.thresholds;

    if (currentTotal <= autoApprovalLimit) {
      return {
        matchedTier: "TIER_1_AUTO",
        decision: "AUTO_APPROVED",
        authorityLevel: "SPECIALIST",
        requiresApproval: false,
        resultingStatus: "ISSUED",
        reason: `Đơn hàng (${currentTotal.toLocaleString("vi-VN")} ₫) nằm dưới ngưỡng tự động duyệt (<= ${autoApprovalLimit.toLocaleString("vi-VN")} ₫). Báo giá có hiệu lực ngay lập tức.`,
      };
    }

    if (currentTotal <= managerApprovalLimit) {
      return {
        matchedTier: "TIER_2_MANAGER",
        decision: "ESCALATE_TO_STAFF",
        authorityLevel: "MANAGER",
        requiresApproval: true,
        resultingStatus: "DRAFT",
        reason: `Đơn hàng (${currentTotal.toLocaleString("vi-VN")} ₫) nằm trong khoảng từ ${autoApprovalLimit.toLocaleString("vi-VN")} ₫ đến ${managerApprovalLimit.toLocaleString("vi-VN")} ₫. Cần Trưởng phòng Mua sắm (Procurement Manager) phê duyệt.`,
      };
    }

    return {
      matchedTier: "TIER_3_CFO",
      decision: "ESCALATE_TO_STAFF",
      authorityLevel: "CFO",
      requiresApproval: true,
      resultingStatus: "DRAFT",
      reason: `Đơn hàng (${currentTotal.toLocaleString("vi-VN")} ₫) vượt hạn mức phân quyền thông thường (> ${managerApprovalLimit.toLocaleString("vi-VN")} ₫). Bắt buộc phải có phê duyệt từ Giám đốc Tài chính (CFO).`,
    };
  }
}

export default GovernancePolicyService;
