// backend/src/modules/governance/PolicyContracts.js
// ============================================
// POLICY CONTRACTS — Hằng số và Quy chuẩn Phân Quyền B2B
// Kế thừa và chuẩn hóa từ kiến trúc EDUREF_AI Multi-Layer Governance
// ============================================

export const POLICY_DECISION = Object.freeze({
  AUTO_APPROVED: 'AUTO_APPROVED',
  REJECTED_POLICY: 'REJECTED_POLICY',
  ASK_CLARIFICATION: 'ASK_CLARIFICATION',
  ESCALATE_TO_STAFF: 'ESCALATE_TO_STAFF',
});

export const POLICY_CLASSIFICATION = Object.freeze({
  ROUTINE: 'ROUTINE',
  ROUTINE_POLICY_DENY: 'ROUTINE_POLICY_DENY',
  UNKNOWN_FACT: 'UNKNOWN_FACT',
  OUTSIDE_POLICY: 'OUTSIDE_POLICY',
  BEYOND_AUTHORITY: 'BEYOND_AUTHORITY',
});

export const AUTHORITY_LEVEL = Object.freeze({
  SPECIALIST: 'SPECIALIST', // Nhân viên mua sắm / Chuyên viên
  MANAGER: 'MANAGER',       // Trưởng phòng Mua sắm (Procurement Manager)
  CFO: 'CFO',               // Giám đốc Tài chính (Chief Financial Officer)
});

export const POLICY_THRESHOLDS = Object.freeze({
  AUTO_APPROVAL_LIMIT: 50_000_000,   // <= 50 triệu VNĐ: Nhân viên tự động duyệt
  MANAGER_APPROVAL_LIMIT: 200_000_000, // <= 200 triệu VNĐ: Cần Trưởng phòng duyệt, trên 200tr: Cần CFO
});

export const POLICY_VERSION = 'PROCURE_PRIME_GOVERNANCE_V1.0.0';

