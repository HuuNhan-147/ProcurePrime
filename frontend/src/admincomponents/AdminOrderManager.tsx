import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAllOrders,
  updateOrderPaymentStatus,
  updateOrderDeliveryStatus,
  cancelOrder,
  searchOrders,
  searchOrdersByUserName,
} from "../api/OrderApi";
import {
  Search,
  ShoppingCart,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Filter,
  AlertCircle,
} from "lucide-react";
import AdminPagination from "./AdminPagination";

interface Order {
  _id: string;
  orderCode: string;
  user: { name: string; email: string };
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

const AdminOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<"orderCode" | "userName">(
    "orderCode"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "unpaid" | "delivered" | "processing"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset về trang 1 khi đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) return;
        const data = await getAllOrders(token);
        setOrders(data || []);
      } catch (err) {
        console.error("Lỗi khi load đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [getToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) return;

        if (searchQuery.trim()) {
          if (searchType === "orderCode") {
            const results = await searchOrders(token, searchQuery);
            setOrders(results.orders || []);
          } else {
            const results = await searchOrdersByUserName(token, searchQuery);
            setOrders(results.orders || []);
          }
        } else {
          const data = await getAllOrders(token);
          setOrders(data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tìm kiếm đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, searchType, getToken]);

  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string, orderCode: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa/hủy đơn hàng "${orderCode || orderId}"?`
      )
    )
      return;
    try {
      const token = getToken();
      if (!token) return;
      await cancelOrder(token, orderId);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Đã xóa đơn hàng thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa đơn hàng:", err);
      alert("Không thể xóa đơn hàng. Vui lòng thử lại!");
    }
  };

  const handleUpdatePaid = async (orderId: string) => {
    try {
      const token = getToken();
      if (!token) return;
      await updateOrderPaymentStatus(token, orderId);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, isPaid: true } : o))
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật thanh toán:", err);
    }
  };

  const handleUpdateDelivered = async (orderId: string) => {
    try {
      const token = getToken();
      if (!token) return;
      await updateOrderDeliveryStatus(token, orderId, true);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, isDelivered: true } : o))
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật giao hàng:", err);
    }
  };

  // Lọc theo Tab trạng thái
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "paid") return order.isPaid;
    if (statusFilter === "unpaid") return !order.isPaid;
    if (statusFilter === "delivered") return order.isDelivered;
    if (statusFilter === "processing") return !order.isDelivered;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi, xác thực thanh toán và điều phối quy trình vận chuyển
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs">
            Tổng cộng: {orders.length} đơn
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
          {[
            { id: "all", label: "Tất cả đơn", count: orders.length },
            {
              id: "unpaid",
              label: "Chờ thanh toán",
              count: orders.filter((o) => !o.isPaid).length,
            },
            {
              id: "paid",
              label: "Đã thanh toán",
              count: orders.filter((o) => o.isPaid).length,
            },
            {
              id: "processing",
              label: "Đang giao",
              count: orders.filter((o) => !o.isDelivered).length,
            },
            {
              id: "delivered",
              label: "Đã hoàn thành",
              count: orders.filter((o) => o.isDelivered).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  statusFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar with Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setSearchType("orderCode")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                searchType === "orderCode"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Mã đơn hàng
            </button>
            <button
              onClick={() => setSearchType("userName")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                searchType === "userName"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tên khách hàng
            </button>
          </div>

          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={`Tìm kiếm theo ${
                searchType === "orderCode"
                  ? "mã đơn hàng (ví dụ: DH123...)"
                  : "tên người đặt..."
              }`}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">
              Đang tải danh sách đơn hàng...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="inline-flex p-3.5 bg-slate-100 rounded-2xl text-slate-400 mb-2">
              <ShoppingCart size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">
              Không có đơn hàng nào
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Không tìm thấy đơn hàng nào khớp với điều kiện lọc hiện tại.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Mã Đơn Hàng</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Ngày Đặt</th>
                  <th className="py-3.5 px-4">Tổng Tiền</th>
                  <th className="py-3.5 px-4">Thanh Toán</th>
                  <th className="py-3.5 px-4">Vận Chuyển</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((order) => {
                  const total =
                    (order as any).payment?.totalPrice ||
                    order.totalPrice ||
                    0;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Mã đơn */}
                      <td className="py-3.5 px-6">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50/70 px-2 py-1 rounded-lg border border-indigo-100/80">
                          {order.orderCode || order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.user?.name || "Khách vãng lai"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                          {order.user?.email}
                        </div>
                      </td>

                      {/* Ngày đặt */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        ₫{total.toLocaleString("vi-VN")}
                      </td>

                      {/* Trạng thái Thanh toán */}
                      <td className="py-3.5 px-4">
                        {order.isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            Đã thanh toán
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdatePaid(order._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors shadow-2xs"
                            title="Xác nhận khách đã thanh toán"
                          >
                            <CreditCard size={12} />
                            Đánh dấu đã nộp
                          </button>
                        )}
                      </td>

                      {/* Trạng thái Giao hàng */}
                      <td className="py-3.5 px-4">
                        {order.isDelivered ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Truck size={13} className="text-indigo-600" />
                            Đã giao hàng
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdateDelivered(order._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
                            title="Xác nhận hàng đã được giao thành công"
                          >
                            <Truck size={12} />
                            Đánh dấu đã giao
                          </button>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewDetails(order._id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                            title="Xem chi tiết hóa đơn"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() =>
                              handleCancelOrder(order._id, order.orderCode)
                            }
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

            {/* Pagination Footer */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={filteredOrders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPageOptions={[10, 20, 50, 100]}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrderManager;
