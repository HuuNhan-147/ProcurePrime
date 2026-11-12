import { tx, useLocale } from "../i18n";
import React from "react";
import { FiDollarSign } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate
import {
  updateOrderDeliveryStatus,
  updateOrderPaymentStatus,
  cancelOrder,
} from "../api/OrderApi";

const OrderActions = ({
  orderId,
  token,
  refresh,
}: {
  orderId: string;
  token: string;
  refresh: () => void;
}) => {
  useLocale();
  const navigate = useNavigate(); // <-- Khởi tạo navigate

  const handleUpdateDelivery = async () => {
    try {
      await updateOrderDeliveryStatus(token, orderId, true);
      alert(tx("adminOrders:deliveryStatusUpdated"));
      refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      await updateOrderPaymentStatus(token, orderId);
      alert(tx("adminOrders:paymentConfirmed"));
      refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm(tx("adminOrders:cancelThisOrder"))) {
      try {
        await cancelOrder(token, orderId);
        alert(tx("adminOrders:theOrderHasBeenCancelled"));
        navigate("/admin/orders"); // <-- chuyển hướng về trang quản lý đơn hàng
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center mb-4">
        <FiDollarSign className="text-[#254AD7] mr-2" />
        <h2 className="text-lg font-semibold">{tx("adminOrders:actions2")}</h2>
      </div>
      <div className="space-y-3">
        <button type="button"
          onClick={handleUpdateDelivery}
          className="w-full bg-[#254AD7] hover:bg-[#254AD7] text-white py-2 px-4 rounded transition"
        >{tx("adminOrders:updateStatus")}</button>
        <button type="button"
          onClick={handleUpdatePayment}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
        >{tx("adminOrders:confirmPayment")}</button>
        <button type="button"
          onClick={handleCancelOrder}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
        >{tx("adminOrders:cancelOrder")}</button>
      </div>
    </div>
  );
};

export default OrderActions;
