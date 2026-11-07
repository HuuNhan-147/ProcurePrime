// backend/src/modules/procurement/BudgetValidationService.js
// ============================================
// BUDGET VALIDATION SERVICE — Thẩm định Ngân sách Tất định (Strict Validation - No Fallback)
// Tích hợp: GovernancePolicyService cho phép cấu hình chiết khấu và VAT động từ Admin UI
// ============================================

import { AppError } from "../../shared/errors/AppError.js";
import { GovernancePolicyService } from "../governance/GovernancePolicyService.js";

export class BudgetValidationService {
  /**
   * Tính toán bảng giá mua sắm doanh nghiệp (Subtotal, B2B discount, VAT, GrandTotal)
   * Tuyệt đối không dùng '|| 0' để che giấu đơn giá hoặc số lượng bị thiếu!
   *
   * @param {Array<Object>} items - Danh sách các thiết bị: [{ productId, productName, unitPrice, quantity }]
   * @param {number|null} customDiscountPercent - Chiết khấu tùy chỉnh (nếu có phê duyệt riêng)
   * @returns {Object} Chi tiết tính toán bảng giá
   */
  static calculatePricing(items, customDiscountPercent = null) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest("Danh sách thiết bị không được để trống", "ERR_EMPTY_ITEMS");
    }

    let subtotal = 0;
    let totalQuantity = 0;
    const validatedItems = [];

    // Duyệt và kiểm tra nghiêm ngặt từng thiết bị
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const indexLabel = `Hạng mục thứ ${i + 1}`;

      if (!item || typeof item !== "object") {
        throw AppError.badRequest(`${indexLabel} không phải là đối tượng hợp lệ`, "ERR_INVALID_ITEM");
      }

      const name = typeof item.productName === "string" && item.productName.trim().length > 0
        ? item.productName.trim()
        : (item.name && typeof item.name === "string" ? item.name.trim() : null);

      if (!name) {
        throw AppError.badRequest(`${indexLabel} bị thiếu tên sản phẩm (productName).`, "ERR_MISSING_PRODUCT_NAME");
      }

      const rawPrice = item.unitPrice !== undefined ? item.unitPrice : item.price;
      if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
        throw AppError.badRequest(
          `${indexLabel} ("${name}") bị thiếu đơn giá (unitPrice).`,
          "ERR_INVALID_UNIT_PRICE"
        );
      }

      const unitPrice = Number(rawPrice);
      if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        throw AppError.badRequest(
          `${indexLabel} ("${name}") có đơn giá không hợp lệ: ${rawPrice}. Đơn giá phải là số dương (> 0).`,
          "ERR_INVALID_UNIT_PRICE"
        );
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw AppError.badRequest(
          `${indexLabel} ("${name}") có số lượng không hợp lệ: ${item.quantity}. Số lượng phải là số nguyên dương (> 0).`,
          "ERR_INVALID_QUANTITY"
        );
      }

      const itemSubtotal = unitPrice * quantity;
      subtotal += itemSubtotal;
      totalQuantity += quantity;

      validatedItems.push({
        productId: item.productId ? String(item.productId) : (item._id ? String(item._id) : `item_${i + 1}`),
        productName: name,
        unitPrice,
        quantity,
        subtotal: itemSubtotal,
      });
    }

    // Lấy chính sách Chiết khấu B2B Volume Discount từ Governance Policy
    const activePolicy = GovernancePolicyService.getCachedPolicySync();
    const rules = activePolicy?.pricingRules || {
      wholesaleThresholdQuantity: 5,
      wholesaleThresholdSubtotal: 50_000_000,
      wholesaleDiscountPercent: 5,
      vatPercent: 10,
    };

    let discountPercent = 0;
    if (customDiscountPercent !== null) {
      const p = Number(customDiscountPercent);
      if (Number.isFinite(p) && p >= 0 && p <= 50) {
        discountPercent = p;
      } else {
        throw AppError.badRequest(`Mức chiết khấu tùy chỉnh không hợp lệ: ${customDiscountPercent}%`, "ERR_INVALID_DISCOUNT");
      }
    } else if (
      totalQuantity >= (rules.wholesaleThresholdQuantity ?? 5) ||
      subtotal >= (rules.wholesaleThresholdSubtotal ?? 50_000_000)
    ) {
      discountPercent = rules.wholesaleDiscountPercent ?? 5; // B2B Volume Discount chuẩn
    }

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const amountAfterDiscount = subtotal - discountAmount;

    // Thuế GTGT VAT theo cấu hình quy chế
    const vatPercent = rules.vatPercent ?? 10;
    const vatAmount = Math.round((amountAfterDiscount * vatPercent) / 100);
    const grandTotal = amountAfterDiscount + vatAmount;

    return {
      subtotal,
      totalQuantity,
      discountPercent,
      discountAmount,
      amountAfterDiscount,
      vatPercent,
      vatAmount,
      grandTotal,
      items: validatedItems,
    };
  }

  /**
   * Tính toán và thẩm định ngân sách mua sắm doanh nghiệp B2B.
   * Tuyệt đối không dùng '|| 0' để che giấu đơn giá hoặc số lượng bị thiếu!
   *
   * @param {Array<Object>} items - Danh sách các thiết bị: [{ productId, productName, unitPrice, quantity }]
   * @param {number} maxBudget - Trần ngân sách phê duyệt (VNĐ)
   * @param {number} customDiscountPercent - Chiết khấu tùy chỉnh (nếu có phê duyệt riêng)
   * @returns {Object} Kết quả phân tích và tính toán ngân sách chi tiết
   */
  static validateAndCalculate(items, maxBudget, customDiscountPercent = null) {
    const pricing = this.calculatePricing(items, customDiscountPercent);

    const parsedMaxBudget = Number(maxBudget);
    if (!Number.isFinite(parsedMaxBudget) || parsedMaxBudget <= 0) {
      throw AppError.badRequest(
        `Trần ngân sách (Max Budget) không hợp lệ: "${maxBudget}". Phải là một số dương lớn hơn 0.`,
        "ERR_INVALID_MAX_BUDGET"
      );
    }

    // Kiểm tra trần ngân sách (Max Budget Check)
    const isExceeded = pricing.grandTotal > parsedMaxBudget;
    const variance = pricing.grandTotal - parsedMaxBudget;
    const variancePercent = Math.round((variance / parsedMaxBudget) * 10000) / 100;
    const utilizationPercent = Math.round((pricing.grandTotal / parsedMaxBudget) * 10000) / 100;

    const budgetSummary = {
      ...pricing,
      maxBudget: parsedMaxBudget,
      isExceeded,
      variance,
      variancePercent: isExceeded ? variancePercent : 0,
      utilizationPercent,
    };

    // Nếu vượt ngân sách, ném lỗi rõ ràng chứa chi tiết tài chính
    if (isExceeded) {
      throw AppError.budgetExceeded(
        `Tổng chi phí dự toán (${pricing.grandTotal.toLocaleString("vi-VN")} VNĐ) đã vượt quá trần ngân sách (${parsedMaxBudget.toLocaleString("vi-VN")} VNĐ) là ${variance.toLocaleString("vi-VN")} VNĐ (${variancePercent}%).`,
        budgetSummary
      );
    }

    return budgetSummary;
  }
}

export default BudgetValidationService;
