import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../i18n";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getOrders, cancelOrder, createPaymentLink } from "../api/OrderApi";
import { Link, useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ShoppingBag, CreditCard, XCircle } from "lucide-react";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullname: string;
  phone: string;
  address: string;
  city: string;
}

interface Order {
  _id: string;
  orderCode: string;
  createdAt: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
}

const ListOrder: React.FC = () => {
  useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError(uiMessage("orders:sessionExpired"));
          setLoading(false);
          return;
        }

        const response = await getOrders(token);
        setOrders(response.orders || []);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        setError(uiMessage("orders:noOrdersFound"));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handlePayment = async (orderId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(tx("orders:pleaseSignInToPay"));
        return;
      }

      const paymentLink = await createPaymentLink(token, orderId);
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Lỗi khi tạo link thanh toán:", error);
      alert(tx("orders:unableToCreatePaymentLink"));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(tx("orders:cancelThisOrder"))) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await cancelOrder(token, orderId);
      const response = await getOrders(token);
      setOrders(response.orders || []);
      alert(tx("orders:orderCancelledSuccessfully"));
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert(tx("orders:unableToCancelTheOrder"));
    }
  };

  const getStatusBadge = (isPaid: boolean, isDelivered: boolean) => {
    if (isDelivered) {
      return (
        <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
          <CheckCircle size={14} />{" "}{tx("orders:delivered")}</span>
      );
    }
    if (isPaid) {
      return (
        <span className="flex items-center gap-1 bg-[#edf1ff] text-[#254AD7] text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
          <Truck size={14} />{" "}{tx("orders:inTransit")}</span>
      );
    }
    return (
      <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-200">
        <Clock size={14} />{" "}{tx("orders:awaitingPayment")}</span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !order.isPaid && !order.isDelivered;
    if (activeTab === "shipping") return order.isPaid && !order.isDelivered;
    if (activeTab === "completed") return order.isDelivered;
    return true;
  });

  const tabs = [
    { id: "all", label: uiMessage("orders:all") },
    { id: "pending", label: uiMessage("orders:awaitingPayment") },
    { id: "shipping", label: uiMessage("orders:delivery") },
    { id: "completed", label: uiMessage("orders:completed") },
  ];

  if (loading) {
    return (
      <div className="pp-screen pp-orders flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pp-screen pp-orders min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-gray-600 text-lg mb-6">{uiText(error)}</p>
        {!user && (
          <Link
            to="/login"
            className="px-6 py-2 bg-[#254AD7] text-white rounded-lg hover:bg-[#254AD7] transition"
          >{tx("orders:signInNow")}</Link>
        )}
      </div>
    );
  }

  return (
    <div className="pp-screen pp-orders min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-[#254AD7]" />{" "}{tx("orders:myOrders")}</h1>
            <Link to="/products" className="text-[#254AD7] hover:underline font-medium">{tx("orders:continueShopping")}</Link>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg border border-gray-100 p-1 mb-8 overflow-x-auto">
          <div className="pp-order-tabs flex space-x-1 min-w-max">
            {tabs.map((tab) => (
              <button type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={` px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#edf1ff] text-[#254AD7]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }  `}
              >
                {uiText(tab.label)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-6">{tx("orders:noOrdersInThisSection")}</p>
                <Link
                    to="/products"
                    className="inline-flex items-center px-6 py-3 bg-[#254AD7] text-white rounded-lg hover:bg-[#254AD7] transition font-medium"
                >{tx("orders:shopNow")}</Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg border border-gray-100 overflow-hidden transition- duration-300"
              >
                {/* Order Header */}
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#edf1ff] p-2 rounded-lg">
                        <Package className="text-[#254AD7] w-5 h-5"/>
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">
                        #{uiText(order.orderCode)}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">{tx("orders:orderDate")}{" "}{uiText(new Date(order.createdAt).toLocaleDateString(locale(), {hour: '2-digit', minute:'2-digit'}))}
                        </p>
                    </div>
                  </div>
                  <div>{uiText(getStatusBadge(order.isPaid, order.isDelivered))}</div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {order.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 py-2"
                      >
                        <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={item.image || "/placeholder-product.jpg"}
                            alt={uiText(item.productName)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "/placeholder-product.jpg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {uiText(item.productName)}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{tx("orders:message")}{uiText(item.quantity)}
                          </p>
                        </div>
                        <div className="text-right">
                            <span className="block text-sm font-semibold text-gray-900">
                                {formatVND(item.price * item.quantity)}</span>
                            {/* <span className="block text-xs text-gray-400 line-through">200.000đ</span> */}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-gray-200 my-4"></div>

                  {/* Summary & Actions */}
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                     <div className="text-sm text-gray-600 space-y-1 w-full md:w-auto">
                        <p><span className="font-medium text-gray-700">{tx("orders:recipient")}</span> {uiText(order.shippingAddress.fullname)}</p>
                        <p><span className="font-medium text-gray-700">{tx("orders:payment")}</span> {uiText(order.paymentMethod === "VNPay" ? "VNPay" : "COD")}</p>
                     </div>

                     <div className="w-full md:w-auto flex flex-col items-end gap-4">
                        <div className="flex items-center gap-2">
                             <span className="text-gray-600">{tx("orders:total")}</span>
                             <span className="text-xl font-bold text-[#254AD7]">{formatVND(order.totalPrice || 0)}</span>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {!order.isPaid && !order.isDelivered && (
                            <>
                                <button type="button"
                                onClick={() => handleCancelOrder(order._id)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                                >
                                <XCircle size={16}/>{" "}{tx("orders:cancelOrder")}</button>
                                <button type="button"
                                onClick={() => handlePayment(order._id)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[#254AD7] text-white rounded-lg hover:bg-[#254AD7] transition text-sm font-medium"
                                >
                                <CreditCard size={16}/>{" "}{tx("orders:pay")}</button>
                            </>
                            )}
                            {order.isPaid && !order.isDelivered && (
                                <button type="button" disabled className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">{tx("orders:processing")}</button>
                            )}
                            {order.isDelivered && (
                                 <button type="button" disabled className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm font-medium cursor-default">{tx("orders:completed")}</button>
                            )}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ListOrder;
