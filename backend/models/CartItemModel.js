import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

// Tối ưu tra cứu item trong giỏ
cartItemSchema.index({ cart: 1, product: 1 });

const CartItem = mongoose.model("CartItem", cartItemSchema);
export default CartItem;
