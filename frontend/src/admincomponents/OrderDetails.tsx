import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetails } from "../api/OrderApi";
import OrderMainInfo from "./OrderMainInfo";
import OrderCustomerInfo from "./OrderCustomerInfo";
import OrderActions from "./OrderActions";
import { ArrowLeft, Clock, ShoppingCart, Loader2, AlertCircle } from "lucide-react";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token") || "";

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrderDetails(token, id || "");
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id, fetchOrder]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="font-bold text-sm">{error}</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  if (!order) return <div className="text-center py-12 text-slate-500">Không tìm thấy đơn hàng</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            title="Quay lại danh sách đơn hàng"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Chi Tiết Đơn Hàng
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Thông tin giao dịch, khách hàng và danh mục sản phẩm đặt mua
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Mã đơn:</span>
          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 text-sm">
            {order.orderCode || order._id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderMainInfo order={order} />
        </div>
        <div className="space-y-6">
          <OrderCustomerInfo order={order} />
          <OrderActions orderId={id || ""} token={token} refresh={fetchOrder} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
