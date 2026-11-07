import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  LogOut,
  User,
} from "lucide-react";
import AdminHeader from "../admincomponents/Header";
import { useAuth } from "../context/AuthContext";

interface NotificationItem {
  id: string;
  orderCode: string;
  totalPrice?: number;
  message: string;
  time: Date;
  read: boolean;
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Connected to backend Socket.IO on Admin App!");
    });

    socket.on("new_order", (data) => {
      const newNotif: NotificationItem = {
        id: `${Date.now()}_${Math.random()}`,
        orderCode: data.orderCode || "N/A",
        totalPrice: data.totalPrice || 0,
        message: data.message || "Có một đơn hàng mới vừa được đặt!",
        time: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);

      toast.info(
        <div>
          <p className="font-bold text-indigo-600 flex items-center gap-1.5">
            <Sparkles size={16} /> Đơn hàng mới!
          </p>
          <p className="text-xs text-slate-600">
            Mã đơn: <strong>{data.orderCode}</strong>
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            {data.totalPrice?.toLocaleString("vi-VN")} VND
          </p>
        </div>,
        { position: "top-right", autoClose: 8000 }
      );
      window.dispatchEvent(new Event("admin_new_order_received"));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Tính toán Breadcrumb tiêu đề trang
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === "/admin") return "Bảng Điều Khiển Tổng Quan";
    if (p.includes("/admin/products")) return "Quản Lý Sản Phẩm";
    if (p.includes("/admin/add-product")) return "Thêm Mới Sản Phẩm";
    if (p.includes("/admin/categories")) return "Quản Lý Danh Mục";
    if (p.includes("/admin/orders")) return "Quản Lý Đơn Hàng";
    if (p.includes("/admin/users")) return "Quản Lý Khách Hàng";
    if (p.includes("/admin/workspace")) return "AI Procurement Copilot";
    if (p.includes("/admin/policies")) return "Quản Trị Quy Chế & Hạn Mức Mua Sắm B2B";
    return "Quản Trị Hệ Thống";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <ToastContainer />

      {/* Sidebar Cố Định Trái */}
      <AdminHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Vùng Làm Việc Chính (Content Wrapper) */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Topbar Cao Cấp */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shadow-xs">
          {/* Trái: Nút toggle + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Đóng / mở thanh menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">Admin</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-800 font-semibold tracking-tight">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Phải: Trạng thái, Thông báo, Profile */}
          <div className="flex items-center gap-3">
            {/* Live System Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Hệ thống trực tuyến</span>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors"
                title="Thông báo đơn hàng"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Bell size={16} className="text-indigo-400" /> Thông báo đơn hàng
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Cập nhật thời gian thực từ Socket.IO
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-300 hover:text-white font-medium hover:underline"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-300" />
                        Chưa có thông báo đơn hàng mới nào
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors ${
                            !item.read ? "bg-indigo-50/30" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-800">
                              Mã đơn: <span className="font-mono text-indigo-600">{item.orderCode}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(item.time).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                          {item.totalPrice ? (
                            <p className="text-xs font-bold text-emerald-600 mt-1">
                              ₫{item.totalPrice.toLocaleString("vi-VN")}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <Link
                      to="/admin/orders"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      Xem toàn bộ danh sách đơn hàng →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Khung Nội Dung Chính - Full Width Tràn Viền */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
