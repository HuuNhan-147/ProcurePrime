// backend/src/modules/quotation/QuotationService.js
// ============================================
// QUOTATION SERVICE — Lõi Sinh và Quản Lý Báo Giá Thương Mại B2B
// Tích hợp: BudgetValidationService + ProcurementPolicyEngine + AuditTrailService
// ============================================

import crypto from "node:crypto";
import { AppError } from "../../shared/errors/AppError.js";
import { BudgetValidationService } from "../procurement/BudgetValidationService.js";
import { ProcurementPolicyEngine } from "../governance/ProcurementPolicyEngine.js";
import { AuditTrailService } from "../governance/AuditTrailService.js";
import { POLICY_DECISION } from "../governance/PolicyContracts.js";
import Quotation from "../../../models/QuotationModel.js";

export class QuotationService {
  // Bộ nhớ in-memory cache để tra cứu nhanh hoặc khi môi trường kiểm thử không có MongoDB
  static _memoryQuotations = new Map();

  /**
   * Sinh số hiệu báo giá doanh nghiệp chuẩn: PP-YYYYMMDD-XXXX
   * Ví dụ: PP-20261101-9F2B
   */
  static generateQuotationNumber(date = new Date()) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `PP-${yyyy}${mm}${dd}-${randomHex}`;
  }

  /**
   * Tạo Bản Báo Giá Thương Mại B2B Hoàn Chỉnh
   *
   * @param {Object} params
   * @param {Array<Object>} params.items - Danh sách thiết bị và số lượng
   * @param {Object} params.organization - Thông tin pháp nhân doanh nghiệp
   * @param {number|null} params.maxBudget - Trần ngân sách phê duyệt (VNĐ)
   * @param {number|null} params.customDiscountPercent - Chiết khấu tùy chỉnh
   * @param {number} params.validDays - Số ngày có hiệu lực của báo giá (mặc định 15 ngày)
   * @param {Array<string>} params.customTerms - Điều khoản thương mại riêng
   * @returns {Promise<Object>} Chi tiết bản báo giá thương mại chính thức
   */
  static async createQuotation({
    items,
    organization = {
      name: "Doanh Nghiệp Mua Sắm B2B",
      taxCode: "0101234567",
      address: "Hà Nội, Việt Nam",
      phone: "0901234567",
      status: "ACTIVE",
    },
    maxBudget = null,
    customDiscountPercent = null,
    validDays = 15,
    customTerms = null,
  }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest("Danh sách thiết bị lập báo giá không được để trống", "ERR_EMPTY_ITEMS");
    }

    // 1. Tính toán chi tiết bảng giá (Subtotal, 5% B2B discount, 10% VAT, GrandTotal)
    const pricing = maxBudget !== null && maxBudget !== undefined
      ? BudgetValidationService.validateAndCalculate(items, maxBudget, customDiscountPercent)
      : BudgetValidationService.calculatePricing(items, customDiscountPercent);

    // 2. Thẩm định đa tầng qua Governance Policy Engine
    const policy = ProcurementPolicyEngine.evaluatePolicy({
      items,
      maxBudget: maxBudget !== null && maxBudget !== undefined ? Number(maxBudget) : null,
      currentTotal: pricing.grandTotal,
      organization,
    });

    // Nếu vi phạm chính sách cứng (ngân sách vượt trần, pháp nhân bị khóa), chặn đứng lập tức
    if (policy.decision === POLICY_DECISION.REJECTED_POLICY) {
      throw AppError.policyViolation(policy.reason, "BUDGET_OR_ORG_REJECTED", policy);
    }

    // 3. Khởi tạo mã báo giá và thời hạn hiệu lực
    const quotationNumber = this.generateQuotationNumber();
    const issuedAt = new Date();
    const validUntil = new Date(issuedAt.getTime() + validDays * 24 * 60 * 60 * 1000);

    // 4. Xác định trạng thái ban đầu của Báo giá theo thẩm quyền
    // - AUTO_APPROVED: Trạng thái ISSUED (Phát hành ngay)
    // - ESCALATE_TO_STAFF: Trạng thái DRAFT (Chờ cấp có thẩm quyền Manager / CFO phê duyệt trước khi phát hành)
    const status = policy.decision === POLICY_DECISION.AUTO_APPROVED ? "ISSUED" : "DRAFT";

    const defaultTerms = [
      `Báo giá có hiệu lực trong vòng ${validDays} ngày kể từ ngày phát hành (${issuedAt.toLocaleDateString("vi-VN")}).`,
      "Đơn giá đã bao gồm thuế Giá trị Gia tăng (VAT 10%) và chiết khấu khối lượng B2B.",
      "Miễn phí vận chuyển và bàn giao kỹ thuật tận nơi cho doanh nghiệp.",
      "Cam kết bảo hành chính hãng đổi mới trong 30 ngày đầu tiên nếu lỗi phần cứng.",
    ];

    const terms = Array.isArray(customTerms) && customTerms.length > 0 ? customTerms : defaultTerms;

    // 5. Đóng dấu chuỗi băm SHA-256 (Audit Snapshot bất biến)
    const auditRecord = AuditTrailService.createAuditRecord({
      actorType: "AI_AGENT",
      action: "CREATE_COMMERCIAL_QUOTATION",
      decision: policy.decision,
      reason: policy.reason,
      inputSnapshot: {
        quotationNumber,
        organizationName: organization.name,
        taxCode: organization.taxCode,
        itemsCount: items.length,
        grandTotal: pricing.grandTotal,
        policyAuthority: policy.authorityLevel,
        status,
      },
    });

    const quotationData = {
      quotationNumber,
      organizationSnapshot: {
        name: organization.name,
        taxCode: organization.taxCode,
        address: organization.address,
        phone: organization.phone,
      },
      items: pricing.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
      subtotal: pricing.subtotal,
      volumeDiscountPercent: pricing.discountPercent,
      volumeDiscountAmount: pricing.discountAmount,
      vatPercent: pricing.vatPercent,
      vatAmount: pricing.vatAmount,
      grandTotal: pricing.grandTotal,
      savingsAmount: pricing.discountAmount,
      status,
      policyEvaluation: {
        decision: policy.decision,
        classification: policy.classification,
        authorityLevel: policy.authorityLevel,
        requiresApproval: policy.requiresApproval,
        reason: policy.reason,
      },
      validUntil,
      issuedAt,
      terms,
      auditFingerprint: auditRecord.hash,
    };

    // Lưu vào in-memory cache
    this._memoryQuotations.set(quotationNumber, quotationData);

    // Lưu vào CSDL MongoDB nếu có kết nối
    try {
      if (Quotation && Quotation.db && Quotation.db.readyState === 1) {
        await Quotation.create({
          ...quotationData,
          organization: organization._id || null,
        });
      }
    } catch (dbErr) {
      // Nếu không có kết nối DB thực, dữ liệu đã được bảo đảm trong _memoryQuotations
      console.warn("⚠️ [QuotationService] Ghi DB MongoDB không khả dụng, lưu in-memory:", dbErr.message);
    }

    return quotationData;
  }

  /**
   * Tra cứu báo giá theo số hiệu (Quotation Number)
   */
  static async getQuotation(quotationNumber) {
    if (!quotationNumber || typeof quotationNumber !== "string") {
      throw AppError.badRequest("Số hiệu báo giá không hợp lệ", "ERR_INVALID_QUOTATION_NUMBER");
    }

    const trimmed = quotationNumber.trim().toUpperCase();

    // 1. Kiểm tra cache in-memory
    if (this._memoryQuotations.has(trimmed)) {
      return this._memoryQuotations.get(trimmed);
    }

    // 2. Tra cứu MongoDB
    try {
      if (Quotation && Quotation.db && Quotation.db.readyState === 1) {
        const found = await Quotation.findOne({ quotationNumber: trimmed }).lean();
        if (found) return found;
      }
    } catch (err) {
      console.warn("⚠️ [QuotationService] Tra cứu MongoDB thất bại:", err.message);
    }

    throw AppError.notFound(`Không tìm thấy báo giá với số hiệu: ${trimmed}`, "ERR_QUOTATION_NOT_FOUND");
  }

  /**
   * Cập nhật trạng thái phê duyệt báo giá (Dành cho Manager / CFO)
   */
  static async approveQuotation(quotationNumber, approverRole = "MANAGER", approverNote = "Đã duyệt báo giá") {
    const quotation = await this.getQuotation(quotationNumber);

    if (quotation.status === "ISSUED" || quotation.status === "ACCEPTED") {
      return quotation;
    }

    quotation.status = "ISSUED";
    quotation.approvedBy = approverRole;
    quotation.approvedAt = new Date();
    quotation.approverNote = approverNote;

    // Cập nhật lại in-memory
    this._memoryQuotations.set(quotation.quotationNumber, quotation);

    try {
      if (Quotation && Quotation.db && Quotation.db.readyState === 1) {
        await Quotation.updateOne(
          { quotationNumber: quotation.quotationNumber },
          { $set: { status: "ISSUED", approvedBy: approverRole, approvedAt: new Date() } }
        );
      }
    } catch (err) {
      console.warn("⚠️ [QuotationService] Cập nhật MongoDB thất bại:", err.message);
    }

    return quotation;
  }
}

