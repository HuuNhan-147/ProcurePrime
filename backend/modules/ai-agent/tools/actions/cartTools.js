// modules/ai-agent/tools/actions/cartTools.js
// ============================================
// CART TOOLS — Công cụ thao tác giỏ hàng B2B (Fail-Fast, Strict Validation)
// ============================================

import * as cartService from "../../../../services/CartService.js";
import redisChatService from "../../../../services/redisChatService.js";
import { AppError } from "../../../../src/shared/errors/AppError.js";

/**
 * Thẩm định số lượng sản phẩm nghiêm ngặt, văng lỗi ngay nếu không hợp lệ
 */
function assertValidQuantity(quantity) {
  const num = Number(quantity);
  if (!Number.isInteger(num) || num <= 0) {
    throw AppError.badRequest(`Số lượng sản phẩm không hợp lệ: "${quantity}". Số lượng phải là số nguyên dương (> 0).`, "ERR_INVALID_QUANTITY");
  }
  return num;
}

/**
 * Thẩm định item trong giỏ hàng có đầy đủ thông tin sản phẩm và giá
 */
function assertValidCartItem(item) {
  if (!item || !item.product) {
    throw AppError.internal("Dữ liệu sản phẩm trong giỏ hàng bị thiếu hoặc đã bị xóa khỏi hệ thống.", "ERR_CORRUPTED_CART_ITEM");
  }

  const p = item.product;
  const productId = p._id ? String(p._id) : String(p);
  const name = typeof p.name === "string" && p.name.trim().length > 0 ? p.name.trim() : null;
  const price = typeof p.price === "number" && !isNaN(p.price) && p.price >= 0 ? p.price : null;

  if (name === null) {
    throw AppError.internal(`Sản phẩm [ID: ${productId}] bị thiếu tên trong CSDL.`, "ERR_PRODUCT_NAME_MISSING");
  }
  if (price === null) {
    throw AppError.internal(`Sản phẩm "${name}" [ID: ${productId}] không có giá niêm yết hợp lệ.`, "ERR_PRODUCT_PRICE_INVALID");
  }

  return {
    id: productId,
    name,
    price,
    quantity: item.quantity,
    image: p.image || null,
  };
}

/**
 * Thêm sản phẩm vào giỏ hàng qua CartService
 */
export async function addToCart({ userId, productId, quantity = 1, token }) {
  if (!userId || typeof userId !== "string") {
    throw AppError.unauthorized("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
  }
  if (!token || typeof token !== "string") {
    throw AppError.unauthorized("Thiếu token xác thực phiên làm việc");
  }
  if (!productId || typeof productId !== "string" || productId.trim().length === 0) {
    throw AppError.badRequest("Thiếu thông tin productId của sản phẩm cần thêm", "ERR_MISSING_PRODUCT_ID");
  }

  const validQty = assertValidQuantity(quantity);
  const formattedCart = await cartService.addToCart(userId, productId.trim(), validQty);

  if (!formattedCart || !formattedCart.cart || !Array.isArray(formattedCart.cart.cartItems)) {
    throw AppError.internal("Không nhận được dữ liệu giỏ hàng sau khi thêm sản phẩm");
  }

  const verifiedItems = formattedCart.cart.cartItems.map(assertValidCartItem);
  const itemCount = verifiedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    success: true,
    message: `Đã thêm sản phẩm vào giỏ hàng thành công`,
    cart: {
      itemCount,
      total: formattedCart.totalPrice,
      items: verifiedItems,
    },
  };
}

/**
 * Thêm hàng loạt sản phẩm vào giỏ hàng doanh nghiệp B2B (Bulk Procurement)
 * Nguyên tắc: Kiểm tra từng item, nếu có item nào lỗi giá hoặc thiếu ID thì văng lỗi ngay!
 */
export async function bulkAddToCart({ userId, items, token }) {
  if (!userId || typeof userId !== "string") {
    throw AppError.unauthorized("Bạn cần đăng nhập để thao tác giỏ hàng doanh nghiệp");
  }
  if (!token || typeof token !== "string") {
    throw AppError.unauthorized("Thiếu token xác thực phiên làm việc");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw AppError.badRequest("Danh sách thiết bị thêm hàng loạt không được để trống", "ERR_EMPTY_ITEMS_ARRAY");
  }

  // Validate từng item trong mảng trước khi thực hiện bất kỳ lệnh ghi nào (Fail-fast)
  const validatedItems = items.map((item, idx) => {
    if (!item || typeof item !== "object") {
      throw AppError.badRequest(`Hạng mục thứ ${idx + 1} trong danh sách không phải là một object hợp lệ.`, "ERR_INVALID_ITEM_FORMAT");
    }
    if (!item.productId || typeof item.productId !== "string" || item.productId.trim().length === 0) {
      throw AppError.badRequest(`Hạng mục thứ ${idx + 1} bị thiếu productId.`, "ERR_MISSING_PRODUCT_ID");
    }
    const validQty = assertValidQuantity(item.quantity);
    return {
      productId: item.productId.trim(),
      quantity: validQty,
    };
  });

  // Tiến hành thêm tuần tự
  let lastCart = null;
  for (const item of validatedItems) {
    lastCart = await cartService.addToCart(userId, item.productId, item.quantity);
  }

  const cartData = lastCart ? lastCart : await cartService.getCart(userId);
  if (!cartData || !cartData.cart || !Array.isArray(cartData.cart.cartItems)) {
    throw AppError.internal("Không thể truy xuất dữ liệu giỏ hàng sau khi gom danh sách thiết bị");
  }

  const verifiedItems = cartData.cart.cartItems.map(assertValidCartItem);
  const itemCount = verifiedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    success: true,
    message: `Đã gom thành công ${validatedItems.length} hạng mục thiết bị vào giỏ hàng B2B`,
    cart: {
      itemCount,
      total: cartData.totalPrice,
      items: verifiedItems,
    },
  };
}

/**
 * Thêm sản phẩm từ danh sách vừa xem theo index
 */
export async function addFromLastViewed({ userId, index = 1, quantity = 1, token, sessionId }) {
  if (!userId || !token) {
    throw AppError.unauthorized("Bạn cần đăng nhập để thêm vào giỏ hàng");
  }

  const validQty = assertValidQuantity(quantity);
  const meta = await redisChatService.getSessionMeta(userId, sessionId);
  const lastViewed = meta?.lastViewedProducts;

  if (!Array.isArray(lastViewed) || lastViewed.length === 0) {
    throw AppError.badRequest("Chưa có danh sách sản phẩm vừa xem. Bạn vui lòng tìm kiếm sản phẩm trước nhé!", "ERR_EMPTY_LAST_VIEWED");
  }

  const parsedIndex = Number(index);
  if (!Number.isInteger(parsedIndex) || parsedIndex < 1 || parsedIndex > lastViewed.length) {
    throw AppError.badRequest(`Vị trí sản phẩm thứ ${index} không hợp lệ. Danh sách chỉ có ${lastViewed.length} sản phẩm.`, "ERR_INDEX_OUT_OF_BOUNDS");
  }

  const targetProduct = lastViewed[parsedIndex - 1];
  if (!targetProduct || !targetProduct.id) {
    throw AppError.badRequest(`Không tìm thấy mã sản phẩm tại vị trí thứ ${index} trong danh sách vừa xem.`, "ERR_TARGET_NOT_FOUND");
  }

  return await addToCart({
    userId,
    productId: targetProduct.id,
    quantity: validQty,
    token,
  });
}

/**
 * Lấy thông tin giỏ hàng qua CartService
 */
export async function getCart({ userId, token }) {
  if (!userId || !token) {
    throw AppError.unauthorized("Bạn cần đăng nhập để xem giỏ hàng");
  }

  const cartData = await cartService.getCart(userId);
  if (!cartData || !cartData.cart || !Array.isArray(cartData.cart.cartItems) || cartData.cart.cartItems.length === 0) {
    return {
      success: true,
      message: "Giỏ hàng của bạn đang trống",
      cart: { items: [], total: 0, itemCount: 0 },
    };
  }

  const verifiedItems = cartData.cart.cartItems.map(assertValidCartItem);
  const itemCount = verifiedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    success: true,
    message: `Giỏ hàng có ${verifiedItems.length} sản phẩm`,
    cart: {
      itemCount,
      itemsPrice: cartData.itemsPrice,
      shippingPrice: cartData.shippingPrice,
      taxPrice: cartData.taxPrice,
      total: cartData.totalPrice,
      items: verifiedItems,
    },
  };
}

/**
 * Xóa sản phẩm khỏi giỏ hàng qua CartService
 */
export async function removeFromCart({ userId, productId, token }) {
  if (!userId || !token) throw AppError.unauthorized("Bạn cần đăng nhập để thao tác");
  if (!productId || typeof productId !== "string") throw AppError.badRequest("Thiếu productId cần xóa");

  const result = await cartService.removeFromCart(userId, productId.trim());
  return {
    success: true,
    message: "Đã xóa sản phẩm khỏi giỏ hàng",
    cart: result,
  };
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ qua CartService
 */
export async function updateCart({ userId, productId, quantity, token }) {
  if (!userId || !token) throw AppError.unauthorized("Bạn cần đăng nhập để thao tác");
  if (!productId || typeof productId !== "string") throw AppError.badRequest("Thiếu productId");

  const validQty = assertValidQuantity(quantity);
  const result = await cartService.updateCartItem(userId, productId.trim(), validQty);

  return {
    success: true,
    message: "Đã cập nhật số lượng thành công",
    cart: result,
  };
}

/**
 * Lấy số lượng item trong giỏ qua CartService
 */
export async function getCartCount({ userId, token }) {
  if (!userId || !token) return { success: true, count: 0 };
  const count = await cartService.getCartItemCount(userId);
  return { success: true, count: typeof count === "number" && !isNaN(count) ? count : 0 };
}
