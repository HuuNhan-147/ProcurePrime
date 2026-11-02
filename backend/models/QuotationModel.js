// backend/models/QuotationModel.js
// ============================================
// QUOTATION MODEL — Bản Báo giá Doanh nghiệp (Commercial Quotation)
// ============================================

import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
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
      required: [true, "Số lượng là bắt buộc"],
      min: [1, "Số lượng tối thiểu là 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Đơn giá là bắt buộc"],
      min: [0, "Đơn giá không được âm"],
    },
    subtotal: {
      type: Number,
      required: [true, "Thành tiền là bắt buộc"],
      min: [0, "Thành tiền không được âm"],
    },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: [true, "Số hiệu báo giá là bắt buộc"],
      unique: true,
      trim: true,
    },
    procurementRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementRequest",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Doanh nghiệp nhận báo giá là bắt buộc"],
    },
    organizationSnapshot: {
      name: { type: String, required: true },
      taxCode: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: {
      type: [quotationItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Báo giá phải chứa ít nhất 1 mặt hàng thiết bị",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Tổng giá trị chưa thuế không được âm"],
    },
    volumeDiscountPercent: {
      type: Number,
      default: 0,
      min: [0, "Chiết khấu không được âm"],
      max: [50, "Chiết khấu tối đa là 50%"],
    },
    volumeDiscountAmount: {
      type: Number,
      default: 0,
      min: [0, "Số tiền chiết khấu không được âm"],
    },
    vatPercent: {
      type: Number,
      default: 10, // 10% thuế GTGT VAT chuẩn
      min: [0, "Thuế suất VAT không được âm"],
    },
    vatAmount: {
      type: Number,
      required: true,
      min: [0, "Tiền thuế VAT không được âm"],
    },
    grandTotal: {
      type: Number,
      required: [true, "Tổng thanh toán cuối cùng là bắt buộc"],
      min: [0, "Tổng thanh toán không được âm"],
    },
    validUntil: {
      type: Date,
      required: [true, "Thời hạn hiệu lực của báo giá là bắt buộc"],
    },
    terms: {
      type: [String],
      default: [
        "Báo giá có hiệu lực trong vòng 15 ngày kể từ ngày phát hành.",
        "Đơn giá đã bao gồm thuế Giá trị Gia tăng (VAT 10%).",
        "Miễn phí vận chuyển nội thành cho đơn hàng doanh nghiệp.",
        "Bảo hành chính hãng 12 - 24 tháng theo tiêu chuẩn nhà sản xuất.",
      ],
    },
    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "ACCEPTED", "EXPIRED", "REJECTED"],
      default: "DRAFT",
    },
    auditFingerprint: {
      type: String,
      required: [true, "Mã băm SHA-256 snapshot kiểm toán là bắt buộc"],
    },
  },
  {
    timestamps: true,
  }
);

quotationSchema.index({ organization: 1, status: 1 });

const Quotation = mongoose.model("Quotation", quotationSchema);
export default Quotation;
