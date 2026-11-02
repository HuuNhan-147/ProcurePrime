import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: { type: String },
    itemsPrice: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 }, // Chiết khấu sỉ B2B Doanh nghiệp
    shippingPrice: { type: Number, default: 0 }, // Miễn phí giao hàng dự án B2B
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    vnpayTransactionId: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
