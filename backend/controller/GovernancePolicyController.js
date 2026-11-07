// backend/controller/GovernancePolicyController.js
import { GovernancePolicyService } from "../src/modules/governance/GovernancePolicyService.js";
import { sendSuccess } from "../src/shared/helpers/responseHelper.js";

/**
 * Lấy cấu hình Quy chế Mua sắm đang hiệu lực (Hỗ trợ Multi-Tenant)
 */
export const getActivePolicy = async (req, res, next) => {
  try {
    const tenantId = req.query.tenantId || "default_tenant";
    const policy = await GovernancePolicyService.getActivePolicy(tenantId);
    return sendSuccess(res, policy, `Lấy thông tin quy chế mua sắm thành công cho [${tenantId}]`);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật Quy chế Mua sắm & Bộ luật động (Dành cho Admin / Quản lý)
 */
export const updatePolicy = async (req, res, next) => {
  try {
    const { tenantId = "default_tenant", rules, thresholds, pricingRules, name, description, changeReason } = req.body;
    const updatedBy = req.user?.name || "Quản Trị Viên";

    const updated = await GovernancePolicyService.updatePolicy({
      tenantId,
      rules,
      thresholds,
      pricingRules,
      name,
      description,
      changeReason,
      updatedBy,
    });

    return sendSuccess(res, updated, `Cập nhật quy chế mua sắm thành công cho [${tenantId}]`);
  } catch (error) {
    next(error);
  }
};

/**
 * Chạy mô phỏng kiểm thử quy chế (Sandbox Simulator)
 * Hỗ trợ kiểm thử cả Dynamic Rules (Midesk) và Decision Table Tiers
 */
export const simulatePolicy = async (req, res, next) => {
  try {
    const {
      tenantId = "default_tenant",
      totalAmount,
      maxBudget,
      quantity,
      discountPercent,
      quoteValidityDays,
      customPolicy,
    } = req.body;

    const result = GovernancePolicyService.simulatePolicy({
      tenantId,
      totalAmount,
      maxBudget,
      quantity,
      discountPercent,
      quoteValidityDays,
      customPolicy,
    });

    return sendSuccess(res, result, "Mô phỏng thẩm định quy chế thành công");
  } catch (error) {
    next(error);
  }
};
