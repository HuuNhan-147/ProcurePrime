// modules/ai-agent/tools/actions/orderTools.js
import * as cartService from "../../../../services/CartService.js";
import * as orderService from "../../../../services/OrderService.js";

/**
 * Tạo Đơn hàng mua sắm doanh nghiệp B2B thông qua CartService.checkout
 */
export async function createOrder(args) {
  try {
    const { userId, token, paymentMethod = "BankTransfer" } = args;
    if (!userId || !token) throw new Error("Vui lòng đăng nhập");

    // Chuẩn hóa địa chỉ giao hàng
    let shippingAddress = args.shippingAddress || {};
    if (!shippingAddress.fullname && args.receiverName) shippingAddress.fullname = args.receiverName;
    if (!shippingAddress.phone && (args.phone || args.phoneNumber)) shippingAddress.phone = args.phone || args.phoneNumber;
    if (!shippingAddress.address && args.address) shippingAddress.address = args.address;
    if (!shippingAddress.city && args.city) shippingAddress.city = args.city;

    if (!shippingAddress.city && shippingAddress.address) {
      const parts = shippingAddress.address.split(",");
      if (parts.length > 1) {
        shippingAddress.city = parts[parts.length - 1].trim();
        shippingAddress.address = parts.slice(0, parts.length - 1).join(",").trim();
      } else {
        shippingAddress.city = "Chưa xác định";
      }
    }

    if (!shippingAddress.fullname || !shippingAddress.phone || !shippingAddress.address) {
      throw new Error(
        `Thiếu thông tin nhận hàng: ${!shippingAddress.fullname ? "Đại diện nhận hàng, " : ""}${!shippingAddress.phone ? "Số điện thoại, " : ""}${!shippingAddress.address ? "Địa chỉ trụ sở/văn phòng" : ""}`
      );
    }

    // Gọi CartService.checkout kèm theo thông tin Doanh nghiệp B2B
    const populatedOrder = await cartService.checkout(userId, {
      shippingAddress,
      paymentMethod,
      organization: args.organization || args.companyName || "",
      taxCode: args.taxCode || "",
      quotationNumber: args.quotationNumber || "",
      budgetCap: args.budgetCap || null,
      auditFingerprint: args.auditFingerprint || "",
    });

    return {
      success: true,
      message: "Tạo đơn hàng mua sắm doanh nghiệp B2B thành công",
      orderId: populatedOrder._id,
      orderCode: populatedOrder.orderCode,
      totalPrice: populatedOrder.payment?.totalPrice || 0,
      quotationNumber: populatedOrder.quotationNumber || "",
    };
  } catch (error) {
    console.error("❌ createOrder tool error:", error.message);
    throw error;
  }
}

/**
 * Lấy chi tiết đơn hàng thông qua OrderService
 */
export async function getOrderDetail({ userId, orderId, token }) {
  try {
    if (!userId || !token) throw new Error("Vui lòng đăng nhập");

    const order = await orderService.getOrderById(orderId, { _id: userId, isAdmin: false });
    return { success: true, order };
  } catch (error) {
    console.error("❌ getOrderDetail tool error:", error.message);
    throw error;
  }
}

/**
 * Lấy danh sách đơn hàng của người dùng thông qua OrderService
 */
export async function getUserOrders({ userId }) {
  try {
    if (!userId) return { success: false, message: "Thiếu userId" };

    const orders = await orderService.getUserOrders(userId);

    const data = orders.map((o) => ({
      id: o._id,
      orderCode: o.orderCode,
      totalPrice: o.payment?.totalPrice || 0,
      itemsCount: o.orderItems?.reduce((s, it) => s + (it.quantity || 1), 0) || 0,
      status: o.payment?.paymentStatus || (o.isDelivered ? "delivered" : "pending"),
      organization: o.organization || "",
      quotationNumber: o.quotationNumber || "",
      createdAt: o.createdAt,
    }));

    return {
      success: true,
      data,
      total: data.length,
      message: `Bạn có ${data.length} đơn hàng mua sắm doanh nghiệp`,
    };
  } catch (error) {
    console.error("❌ getUserOrders tool error:", error.message);
    return { success: false, message: "Không thể lấy danh sách đơn hàng" };
  }
}

/**
 * Hủy đơn hàng thông qua OrderService
 */
export async function cancelOrder({ userId, orderIdentifier, token }) {
  try {
    if (!userId || !token) throw new Error("Vui lòng đăng nhập");

    await orderService.deleteOrder(orderIdentifier, { _id: userId, isAdmin: false });
    return { success: true, message: "Đã hủy đơn hàng thành công" };
  } catch (error) {
    console.error("❌ cancelOrder tool error:", error.message);
    return { success: false, message: error.message || "Lỗi khi hủy đơn hàng" };
  }
}
