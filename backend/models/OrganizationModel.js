// backend/models/OrganizationModel.js
// ============================================
// ORGANIZATION MODEL — Thực thể Pháp nhân Doanh nghiệp
// ============================================

import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên doanh nghiệp là bắt buộc"],
      trim: true,
    },
    taxCode: {
      type: String,
      required: [true, "Mã số thuế doanh nghiệp là bắt buộc"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Mã số thuế Việt Nam: 10 chữ số (doanh nghiệp độc lập) hoặc 13 chữ số (chi nhánh/đơn vị phụ thuộc)
          return /^\d{10}(-\d{3})?$/.test(v);
        },
        message: (props) => `Mã số thuế "${props.value}" không đúng định dạng chuẩn (10 chữ số hoặc 13 chữ số kèm gạch nối)!`,
      },
    },
    address: {
      type: String,
      required: [true, "Địa chỉ trụ sở doanh nghiệp là bắt buộc"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại doanh nghiệp là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    approvalLimit: {
      type: Number,
      required: [true, "Hạn mức duyệt ngân sách tự động là bắt buộc"],
      min: [0, "Hạn mức duyệt chi không được âm"],
      default: 50000000, // 50.000.000 VNĐ
    },
    tier: {
      type: String,
      enum: ["STARTUP", "SME", "ENTERPRISE"],
      default: "SME",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ name: "text" });

const Organization = mongoose.model("Organization", organizationSchema);
export default Organization;
