import { tx, uiMessage, uiText, useLocale, locale, formatVND, localizedNode } from "../i18n";
import "../components/ui/enterprise.css";
import "./../components/ui/admin.css";
import { usePresentationFocus } from "../components/ui/PresentationAccess";
﻿import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PublicNotifications from "../components/ui/PublicNotifications";
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
import LanguageToggle from "../components/ui/LanguageToggle";
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
  useLocale();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notificationRef = usePresentationFocus<HTMLDivElement>(showNotifications, () => setShowNotifications(false), false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => { setIsCompact(media.matches); if (!media.matches) setMobileOpen(false); };
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => { setMobileOpen(false); setShowNotifications(false); }, [location.pathname]);

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
        message: data.message || uiMessage("admin:newOrderFallback"),
        time: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);

      toast.info(
        <div>
          <p className="font-bold text-[#254AD7] flex items-center gap-1.5">
            <Sparkles size={16} />{" "}{localizedNode("admin:newOrder")}</p>
          <p className="text-xs text-slate-600">{localizedNode("admin:orderReference")}{" "}<strong>{uiText(data.orderCode)}</strong>
          </p>
          <p className="text-xs text-emerald-600 font-semibold">
            {uiText(data.totalPrice?.toLocaleString(locale()))} VND
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
    if (p === "/admin") return tx("admin:overview");
    if (p.includes("/admin/products")) return tx("admin:productManagement");
    if (p.includes("/admin/add-product")) return tx("admin:addProduct");
    if (p.includes("/admin/categories")) return tx("admin:categoryManagement");
    if (p.includes("/admin/orders")) return tx("admin:orderManagement");
    if (p.includes("/admin/users")) return tx("admin:customerManagement");
    if (p.includes("/admin/workspace")) return tx("admin:aiProcurementCopilot");
    if (p.includes("/admin/policies")) return tx("admin:procurementPoliciesSpendingLimits");
    return tx("admin:systemAdministration");
  };

  return (
    <><PublicNotifications />
    <div className="pp-screen pp-admin min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col" data-collapsed={isCollapsed}>

      {/* Sidebar Cố Định Trái */}
      {isCompact && mobileOpen && <button type="button" tabIndex={-1} className="pp-admin-backdrop" aria-label={tx("admin:closeAdminNavigation")} onClick={() => setMobileOpen(false)} />}
      <AdminHeader
        isCollapsed={isCompact ? false : isCollapsed}
        isCompact={isCompact}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapse={() => isCompact ? setMobileOpen(false) : setIsCollapsed(!isCollapsed)}
      />

      {/* Vùng Làm Việc Chính (Content Wrapper) */}
      <div
        className="pp-admin-shell" inert={isCompact && mobileOpen}
      >
        {/* Topbar Cao Cấp */}
        <header className="pp-admin-topbar sticky top-0 z-40 h-16 bg-white/80 border-b border-slate-200/80 px-6 flex items-center justify-between">
          {/* Trái: Nút toggle + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button type="button"
              aria-label={tx("admin:adminNavigation")} aria-controls="pp-admin-sidebar" aria-expanded={isCompact ? mobileOpen : !isCollapsed}
              onClick={() => isCompact ? setMobileOpen(!mobileOpen) : setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={tx("admin:toggleNavigation")}
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">{tx("admin:admin")}</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-800 font-semibold tracking-tight">
                {uiText(getPageTitle())}
              </span>
            </div>
          </div>

          {/* Phải: Trạng thái, Thông báo, Profile */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            {/* Live System Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{tx("admin:adminWorkspace")}</span>
            </div>

            {/* Notification Bell */}
            <div ref={notificationRef} className="relative">
              <button aria-label={tx("admin:orderNotifications")} type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-600 hover:text-[#254AD7] hover:bg-[#edf1ff] transition-colors"
                aria-expanded={showNotifications} aria-controls="pp-admin-notifications" title={tx("admin:orderNotifications")}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {uiText(unreadCount > 9 ? "9+" : unreadCount)}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div id="pp-admin-notifications" role="region" aria-label={tx("admin:orderNotifications")} className="pp-admin-notifications absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-lg border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in- duration-200">
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Bell size={16} className="text-indigo-400" />{" "}{tx("admin:orderNotifications")}</h4>
                      <p className="text-[11px] text-slate-400">{tx("admin:realTimeUpdatesViaSocketIo")}</p>
                    </div>
                    {unreadCount > 0 && (
                      <button type="button"
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-300 hover:text-white font-medium hover:underline"
                      >{tx("admin:markAsRead")}</button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-300" />{tx("admin:noNewOrderNotifications")}</div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={` p-3.5 hover:bg-slate-50 transition-colors ${
                            !item.read ? "bg-[#edf1ff]" : ""
                          }  `}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-slate-800">{tx("admin:orderReference")}{" "}<span className="font-mono text-[#254AD7]">{uiText(item.orderCode)}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock size={11} />
                              {uiText(new Date(item.time).toLocaleTimeString(locale(), {
                                hour: "2-digit",
                                minute: "2-digit",
                              }))}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{uiText(item.message)}</p>
                          {item.totalPrice ? (
                            <p className="text-xs font-bold text-emerald-600 mt-1">
                              {formatVND(item.totalPrice)}
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
                      className="text-xs font-semibold text-[#254AD7] hover:text-[#254AD7]"
                    >{tx("admin:viewAllOrders")}</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-lg bg-[#254AD7] text-white flex items-center justify-center font-bold text-xs">
                {uiText(user?.name?.charAt(0).toUpperCase() || "A")}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-none">
                  {uiText(user?.name || tx("admin:admin"))}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-1">{tx("admin:administrator")}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Khung Nội Dung Chính - Full Width Tràn Viền */}
        <main id="pp-admin-content" className="pp-admin-main flex-1 w-full p-4 sm:p-6 lg:p-8">
          {uiText(children)}
        </main>
      </div>
    </div></>
  );
};

export default AdminLayout;
