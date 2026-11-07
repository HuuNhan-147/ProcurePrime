// backend/models/GovernancePolicyModel.js
import mongoose from "mongoose";

const ruleConditionSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      required: true,
      enum: [">=", "<=", ">", "<", "==", "!=", "contains"],
      default: ">=",
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const ruleActionSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      enum: ["AUTO_APPROVE", "REQUIRE_APPROVAL", "REQUIRE_3_BIDS", "TAG_CAPEX", "HARD_REJECT"],
      default: "REQUIRE_APPROVAL",
    },
    target: {
      type: String,
      default: "", // 'LINE_MANAGER', 'PROCUREMENT_DIRECTOR', 'CFO'
    },
    message: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const dynamicRuleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `rule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    matchType: {
      type: String,
      enum: ["ALL", "ANY"],
      default: "ALL",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    conditions: [ruleConditionSchema],
    actions: [ruleActionSchema],
  },
  { _id: false }
);

const governancePolicySchema = new mongoose.Schema(
  {
    policyKey: {
      type: String,
      required: true,
      default: "DEFAULT_PROCUREMENT_POLICY",
      trim: true,
    },
    tenantId: {
      type: String,
      required: true,
      default: "default_tenant",
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      default: "Quy Chế Mua Sắm & Báo Giá Doanh Nghiệp Chuẩn",
      trim: true,
    },
    description: {
      type: String,
      default: "Quy định hạn mức tự động phê duyệt, chiết khấu dự án B2B và phân cấp thẩm quyền",
    },
    version: {
      type: String,
      required: true,
      default: "1.0.0",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Decision Table mặc định 3 tầng
    thresholds: {
      autoApprovalLimit: {
        type: Number,
        required: true,
        default: 50_000_000, // 50 triệu ₫
        min: 0,
      },
      managerApprovalLimit: {
        type: Number,
        required: true,
        default: 200_000_000, // 200 triệu ₫
        min: 0,
      },
    },
    // Chính sách chiết khấu, hạn báo giá & thuế
    pricingRules: {
      wholesaleThresholdQuantity: {
        type: Number,
        default: 5,
        min: 1,
      },
      wholesaleThresholdSubtotal: {
        type: Number,
        default: 50_000_000,
        min: 0,
      },
      wholesaleDiscountPercent: {
        type: Number,
        default: 5,
        min: 0,
        max: 50,
      },
      vatPercent: {
        type: Number,
        default: 10,
        min: 0,
        max: 30,
      },
      quotationValidityDays: {
        type: Number,
        default: 15,
        min: 1,
        max: 90,
      },
    },
    // Mảng các luật động tùy biến (Kế thừa mô hình Midesk)
    rules: [dynamicRuleSchema],
    auditHistory: [
      {
        updatedBy: { type: String, default: "Hệ thống" },
        updatedAt: { type: Date, default: Date.now },
        changeReason: { type: String, default: "Khởi tạo chính sách ban đầu" },
        diffSummary: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index kép đảm bảo tra cứu nhanh theo tenantId và isActive
governancePolicySchema.index({ tenantId: 1, isActive: 1 });

const GovernancePolicy = mongoose.model("GovernancePolicy", governancePolicySchema);
export default GovernancePolicy;
