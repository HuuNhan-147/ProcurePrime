// frontend/src/types/procurement.ts
// ============================================
// PROCUREMENT DOMAIN CONTRACTS — Hợp đồng kiểu dữ liệu B2B
// ============================================

/**
 * Pháp nhân Doanh nghiệp
 */
export interface Organization {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  approvalLimit: number; // Hạn mức ngân sách được duyệt tự động
  tier: "STARTUP" | "SME" | "ENTERPRISE";
}

/**
 * Yêu cầu đặc tả kỹ thuật từ người dùng tự nhiên
 */
export interface SpecificationConstraint {
  key: string; // VD: 'ram', 'cpu', 'ssd'
  operator: "eq" | "gte" | "lte" | "contains";
  value: string | number;
  unit?: string;
}

/**
 * Hạng mục thu mua trong yêu cầu B2B
 */
export interface ProcurementItem {
  id?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  category?: string;
  specifications?: Record<string, string>;
  subtotal: number;
}

/**
 * Yêu cầu thu mua trọn gói (Procurement Request)
 */
export interface ProcurementRequest {
  id: string;
  organizationId: string;
  requestedBy: string; // UserId
  department: string; // VD: 'IT', 'HR', 'R&D', 'Sales'
  naturalLanguageQuery: string;
  maxBudget: number;
  items: ProcurementItem[];
  estimatedTotal: number;
  status: "DRAFT" | "ANALYZING" | "QUOTED" | "ESCALATED" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

/**
 * Báo giá Doanh nghiệp (Commercial Quotation)
 */
export interface Quotation {
  quotationNumber: string; // VD: 'QUO-202611-001'
  organization: {
    name: string;
    taxCode: string;
    address: string;
  };
  items: ProcurementItem[];
  subtotalPrice: number;
  volumeDiscountPercent: number; // VD: 5% cho đơn sỉ
  discountAmount: number;
  vatPercent: number; // VD: 10%
  vatAmount: number;
  grandTotal: number;
  validUntil: string; // Ngày hết hạn báo giá (thường 15 ngày)
  termsAndConditions: string[];
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "EXPIRED";
}

/**
 * Phán quyết từ Policy Engine (Kế thừa EDUREF_AI)
 */
export interface PolicyDecision {
  decision: "AUTO_APPROVED" | "ASK_CLARIFICATION" | "REJECTED_POLICY" | "ESCALATE_TO_STAFF";
  classification: "ROUTINE" | "UNKNOWN_FACT" | "ROUTINE_POLICY_DENY" | "OUTSIDE_POLICY" | "BEYOND_AUTHORITY";
  rule: string;
  reason: string;
  actionableQuestion?: string;
  targetRole?: "STAFF" | "MANAGER" | "CFO";
  evidenceFingerprint: string;
  timestamp: string;
}

