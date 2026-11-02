// backend/src/modules/cart/ProcurementCartService.js
// ============================================
// PROCUREMENT CART SERVICE — Dịch vụ Giỏ hàng Thu mua B2B (Strict Inventory & Pricing)
// ============================================

import Cart from "../../../models/CartModel.js";
import CartItem from "../../../models/CartItemModel.js";
import Product from "../../../models/ProductModel.js";
import { AppError } from "../../shared/errors/AppError.js";

export class ProcurementCartService {
  /**
   * Thêm nhiều thiết bị vào giỏ hàng doanh nghiệp B2B với kiểm tra tồn kho & đơn giá nghiêm ngặt
   *
   * @param {string} userId - ID người dùng
   * @param {Array<{ productId: string, quantity: number }>} items - Danh sách cần thêm
   * @returns {Promise<Object>} Giỏ hàng B2B sau khi cập nhật
   */
  static async addBulkToCart(userId, items) {
    if (!userId) {
      throw AppError.unauthorized("Bạn cần đăng nhập để thao tác giỏ hàng doanh nghiệp");
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest("Danh sách thiết bị thêm hàng loạt không được để trống", "ERR_EMPTY_ITEMS");
    }

    // 1. Tìm hoặc khởi tạo Cart cho user
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, cartItems: [] });
    }

    const processedItems = [];

    // 2. Thẩm định nghiêm ngặt từng sản phẩm
    for (let i = 0; i < items.length; i++) {
      const { productId, quantity } = items[i];
      const indexLabel = `Hạng mục ${i + 1}`;

      if (!productId || typeof productId !== "string") {
        throw AppError.badRequest(`${indexLabel} bị thiếu mã productId hợp lệ`, "ERR_MISSING_PRODUCT_ID");
      }

      const validQty = Number(quantity);
      if (!Number.isInteger(validQty) || validQty <= 0) {
        throw AppError.badRequest(`${indexLabel} có số lượng không hợp lệ: ${quantity}`, "ERR_INVALID_QUANTITY");
      }

      // Tra cứu sản phẩm trong CSDL
      const product = await Product.findById(productId);
      if (!product) {
        throw AppError.notFound(`Không tìm thấy sản phẩm với ID: "${productId}" trong kho hàng`, "ERR_PRODUCT_NOT_FOUND");
      }

      // Kiểm tra đơn giá
      if (typeof product.price !== "number" || isNaN(product.price) || product.price < 0) {
        throw AppError.internal(`Sản phẩm "${product.name}" [ID: ${productId}] không có đơn giá hợp lệ`, "ERR_INVALID_PRICE");
      }

      // Kiểm tra tồn kho (Strict Stock Check)
      if (typeof product.countInStock !== "number" || isNaN(product.countInStock) || product.countInStock < validQty) {
        throw AppError.badRequest(
          `Kho không đủ số lượng cho sản phẩm "${product.name}". Số lượng trong kho: ${product.countInStock ?? 0}, số lượng yêu cầu: ${validQty}.`,
          "ERR_INSUFFICIENT_STOCK"
        );
      }

      // Thêm hoặc cập nhật CartItem
      let cartItem = await CartItem.findOne({ cart: cart._id, product: product._id });
      if (cartItem) {
        const newTotalQty = cartItem.quantity + validQty;
        if (newTotalQty > product.countInStock) {
          throw AppError.badRequest(
            `Tổng số lượng sau khi thêm (${newTotalQty}) vượt quá tồn kho hiện tại (${product.countInStock}) của sản phẩm "${product.name}".`,
            "ERR_STOCK_EXCEEDED_AFTER_ADD"
          );
        }
        cartItem.quantity = newTotalQty;
        await cartItem.save();
      } else {
        cartItem = await CartItem.create({
          cart: cart._id,
          product: product._id,
          quantity: validQty,
        });
        cart.cartItems.push(cartItem._id);
      }

      processedItems.push({
        productId: product._id,
        productName: product.name,
        unitPrice: product.price,
        quantity: validQty,
        subtotal: product.price * validQty,
      });
    }

    await cart.save();

    // 3. Populate và định dạng kết quả giỏ hàng hoàn chỉnh
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "cartItems",
      populate: { path: "product", select: "name price image countInStock" },
    });

    const validCartItems = (populatedCart.cartItems || []).filter((item) => item && item.product);
    const itemsPrice = validCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalItemCount = validCartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      success: true,
      cartId: cart._id,
      itemCount: totalItemCount,
      itemsPrice,
      items: validCartItems.map((item) => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
        image: item.product.image || null,
        countInStock: item.product.countInStock,
      })),
    };
  }
}

export default ProcurementCartService;

