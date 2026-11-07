// backend/src/modules/governance/ProcurementPolicyEngine.js
// ============================================
// PROCUREMENT POLICY ENGINE — Lõi Thẩm Định Quyền Hạn & Ngân Sách Độc Lập
// Thiết kế Deterministic Policy Engine theo chuẩn 4 Decisions & 5 Classifications
// Tích hợp: GovernancePolicyService hỗ trợ điều chỉnh ngưỡng động từ Admin UI
// ============================================

import { AppError } from '../../shared/errors/AppError.js';
import {
  POLICY_DECISION,
  POLICY_CLASSIFICATION,
  AUTHORITY_LEVEL,
  POLICY_THRESHOLDS,
  POLICY_VERSION,
} from './PolicyContracts.js';
import { GovernancePolicyService } from './GovernancePolicyService.js';

export class ProcurementPolicyEngine {
  /**
   * Thẩm định chính sách mua sắm đa tầng (Multi-Layer Governance Evaluation)
   * @param {Object} params
   * @param {Array} params.items - Danh sách thiết bị/sản phẩm yêu cầu
   * @param {number|null} params.maxBudget - Trần ngân sách tối đa
   * @param {number} params.currentTotal - Tổng giá trị đơn hàng tính toán
   * @param {Object|null} params.organization - Thông tin pháp nhân doanh nghiệp
   * @param {Object|null} params.customThresholds - Ngưỡng tùy biến (nếu truyền riêng)
   * @returns {Object} Kết quả thẩm định chính sách minh bạch
   */
  static evaluatePolicy({
    items,
    maxBudget = null,
    currentTotal,
    organization = null,
    customThresholds = null,
  }) {
    // 0. Fail-Fast input validation
    if (!Array.isArray(items)) {
      throw AppError.validationError('items bắt buộc phải là một mảng danh sách thiết bị');
    }
    if (currentTotal === null || currentTotal === undefined || typeof currentTotal !== 'number' || isNaN(currentTotal) || currentTotal < 0) {
      throw AppError.validationError('currentTotal bắt buộc phải là một số không âm hợp lệ');
    }

    const timestamp = new Date().toISOString();

    // 1. Tầng 1: Kiểm tra Dữ kiện Pháp lý & Thông số (UNKNOWN_FACT -> ASK_CLARIFICATION)
    if (items.length === 0) {
      return {
        policyVersion: POLICY_VERSION,
        decision: POLICY_DECISION.ASK_CLARIFICATION,
        classification: POLICY_CLASSIFICATION.UNKNOWN_FACT,
        authorityLevel: AUTHORITY_LEVEL.SPECIALIST,
        requiresApproval: false,
        reason: 'Danh sách thiết bị thu mua đang trống.',
        actionableQuestion: 'Quý doanh nghiệp cần trang bị những thiết bị hoặc danh mục nào?',
        timestamp,
      };
    }

    for (const item of items) {
      if (item.quantity === null || item.quantity === undefined || item.quantity <= 0) {
        return {
          policyVersion: POLICY_VERSION,
          decision: POLICY_DECISION.ASK_CLARIFICATION,
          classification: POLICY_CLASSIFICATION.UNKNOWN_FACT,
          authorityLevel: AUTHORITY_LEVEL.SPECIALIST,
          requiresApproval: false,
          reason: `Thiết bị '${item.name || 'chưa rõ'}' chưa có số lượng hợp lệ.`,
          actionableQuestion: `Quý doanh nghiệp dự kiến mua số lượng bao nhiêu chiếc cho '${item.name || 'thiết bị này'}'?`,
          timestamp,
        };
      }
    }

    // 2. Tầng 2: Kiểm tra Tư cách Doanh nghiệp & Trần Ngân sách (ROUTINE_POLICY_DENY -> REJECTED_POLICY)
    if (organization !== null && organization !== undefined) {
      if (organization.status === 'SUSPENDED') {
        return {
          policyVersion: POLICY_VERSION,
          decision: POLICY_DECISION.REJECTED_POLICY,
          classification: POLICY_CLASSIFICATION.ROUTINE_POLICY_DENY,
          authorityLevel: AUTHORITY_LEVEL.SPECIALIST,
          requiresApproval: false,
          reason: `Pháp nhân '${organization.name || 'Doanh nghiệp'}' đang ở trạng thái TẠM KHÓA (SUSPENDED). Nghiêm cấm phát sinh giao dịch mua sắm mới.`,
          actionableQuestion: 'Vui lòng liên hệ ban quản trị để kích hoạt lại tài khoản pháp nhân trước khi tạo đơn.',
          timestamp,
        };
      }
    }

    if (maxBudget !== null && maxBudget !== undefined) {
      if (typeof maxBudget !== 'number' || maxBudget <= 0) {
        throw AppError.validationError('maxBudget nếu có bắt buộc phải là số dương lớn hơn 0');
      }

      if (currentTotal > maxBudget) {
        const exceeded = currentTotal - maxBudget;
        return {
          policyVersion: POLICY_VERSION,
          decision: POLICY_DECISION.REJECTED_POLICY,
          classification: POLICY_CLASSIFICATION.ROUTINE_POLICY_DENY,
          authorityLevel: AUTHORITY_LEVEL.SPECIALIST,
          requiresApproval: false,
          reason: `Tổng giá trị đơn hàng (${currentTotal.toLocaleString('vi-VN')} VNĐ) vượt quá trần ngân sách cho phép (${maxBudget.toLocaleString('vi-VN')} VNĐ). Vượt ${exceeded.toLocaleString('vi-VN')} VNĐ.`,
          actionableQuestion: 'Vui lòng giảm số lượng hoặc chọn phân khúc thiết bị tối ưu hơn để bảo đảm không vượt ngân sách trần.',
          timestamp,
        };
      }
    }

    // 3. Tầng 3: Kiểm tra Thẩm quyền Phê duyệt theo Ngưỡng Động (BEYOND_AUTHORITY -> ESCALATE_TO_STAFF)
    const activePolicy = GovernancePolicyService.getCachedPolicySync();
    const autoApprovalLimit = customThresholds?.autoApprovalLimit ?? activePolicy?.thresholds?.autoApprovalLimit ?? POLICY_THRESHOLDS.AUTO_APPROVAL_LIMIT;
    const managerApprovalLimit = customThresholds?.managerApprovalLimit ?? activePolicy?.thresholds?.managerApprovalLimit ?? POLICY_THRESHOLDS.MANAGER_APPROVAL_LIMIT;

    // Cấp cao nhất: Vượt managerApprovalLimit -> Trình Giám đốc Tài chính CFO
    if (currentTotal > managerApprovalLimit) {
      return {
        policyVersion: POLICY_VERSION,
        decision: POLICY_DECISION.ESCALATE_TO_STAFF,
        classification: POLICY_CLASSIFICATION.BEYOND_AUTHORITY,
        authorityLevel: AUTHORITY_LEVEL.CFO,
        requiresApproval: true,
        reason: `Giá trị đơn hàng (${currentTotal.toLocaleString('vi-VN')} VNĐ) vượt hạn mức phân quyền thông thường (> ${managerApprovalLimit.toLocaleString('vi-VN')} VNĐ). Bắt buộc phải có sự phê duyệt từ Giám đốc Tài chính (CFO).`,
        actionableQuestion: 'Hệ thống đã chuẩn bị phiếu đề xuất mua sắm. Bạn có muốn gửi thông báo phê duyệt tới CFO không?',
        timestamp,
      };
    }

    // Cấp trung: Từ autoApprovalLimit đến managerApprovalLimit -> Trình Trưởng phòng Mua sắm (Procurement Manager)
    if (currentTotal > autoApprovalLimit) {
      return {
        policyVersion: POLICY_VERSION,
        decision: POLICY_DECISION.ESCALATE_TO_STAFF,
        classification: POLICY_CLASSIFICATION.BEYOND_AUTHORITY,
        authorityLevel: AUTHORITY_LEVEL.MANAGER,
        requiresApproval: true,
        reason: `Giá trị đơn hàng (${currentTotal.toLocaleString('vi-VN')} VNĐ) vượt hạn mức tự duyệt của nhân viên (> ${autoApprovalLimit.toLocaleString('vi-VN')} VNĐ). Cần có xác nhận phê duyệt từ Trưởng phòng Mua sắm (Procurement Manager).`,
        actionableQuestion: 'Hệ thống đã lập giỏ hàng. Bạn có muốn gửi yêu cầu phê duyệt tới Trưởng phòng Mua sắm không?',
        timestamp,
      };
    }

    // 4. Tầng 4: Yêu cầu chuẩn quy chuẩn (ROUTINE -> AUTO_APPROVED)
    return {
      policyVersion: POLICY_VERSION,
      decision: POLICY_DECISION.AUTO_APPROVED,
      classification: POLICY_CLASSIFICATION.ROUTINE,
      authorityLevel: AUTHORITY_LEVEL.SPECIALIST,
      requiresApproval: false,
      reason: `Đơn hàng nằm trong trần ngân sách và thuộc hạn mức tự động phê duyệt (<= ${autoApprovalLimit.toLocaleString('vi-VN')} VNĐ).`,
      actionableQuestion: null,
      timestamp,
    };
  }
}

export default ProcurementPolicyEngine;
