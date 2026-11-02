// backend/models/ProcurementRequestModel.js
// ============================================
// PROCUREMENT REQUEST MODEL — Yêu cầu Thu mua Doanh nghiệp
// ============================================

import mongoose from "mongoose";

const procurementItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Mã sản phẩm là bắt buộc"],
    },
    productName: {
      type: String,
      required: [true, "Tên sản phẩm là bắt buộc"],
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng sản phẩm là bắt buộc"],
      min: [1, "Số lượng phải lớn hơn hoặc bằng 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Đơn giá là bắt buộc"],
      min: [0, "Đơn giá không được âm"],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Tổng giá trị không được âm"],
    },
    matchedSpecifications: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { _id: false }
);

const procurementRequestSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Doanh nghiệp yêu cầu là bắt buộc"],
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo yêu cầu là bắt buộc"],
    },
    department: {
      type: String,
      required: [true, "Phòng ban thu mua là bắt buộc"],
      trim: true,
    },
    naturalLanguageQuery: {
      type: String,
      required: [true, "Nội dung yêu cầu tự nhiên là bắt buộc"],
      trim: true,
    },
    maxBudget: {
      type: Number,
      required: [true, "Trần ngân sách (Max Budget) là bắt buộc"],
      min: [1000, "Ngân sách tối thiểu phải từ 1.000 VNĐ"],
    },
    items: [procurementItemSchema],
    estimatedTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["DRAFT", "ANALYZING", "QUOTED", "ESCALATED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    escalationInfo: {
      targetRole: { type: String, enum: ["STAFF", "MANAGER", "CFO", "SALES_DIR"] },
      reason: { type: String },
      actionableQuestion: { type: String },
      escalatedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

procurementRequestSchema.index({ organization: 1, status: 1 });
procurementRequestSchema.index({ requestedBy: 1 });

const ProcurementRequest = mongoose.model("ProcurementRequest", procurementRequestSchema);
export default ProcurementRequest;

