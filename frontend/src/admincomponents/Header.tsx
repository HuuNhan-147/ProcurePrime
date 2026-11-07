import React, { useState } from "react";
import {
  LogOut,
  ShieldCheck,
  Edit,
  X,
  Home,
  Package,
  List,
  Users,
  ShoppingCart,
  Key,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Sparkles,
  Layers,
  Bot,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../api/UserApi";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      logout();
      navigate("/login");
    }
  };

  const handleToggleProfile = () => {
    setShowProfile(!showProfile);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!token) return;
      await updateUserProfile(profileData, token);
      alert("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      alert("Cập nhật thông tin thất bại.");
    }
  };

  const navItems = [
    { path: "/admin", name: "Tổng quan", icon: <Home size={19} />, badge: "Live" },
    { path: "/admin/products", name: "Sản phẩm", icon: <Package size={19} /> },
    { path: "/admin/categories", name: "Danh mục", icon: <Layers size={19} /> },
    { path: "/admin/orders", name: "Đơn hàng", icon: <ShoppingCart size={19} /> },
    { path: "/admin/users", name: "Khách hàng", icon: <Users size={19} /> },
    { path: "/admin/workspace", name: "AI Copilot Mua Sắm", icon: <Bot size={19} />, badge: "AI" },
    { path: "/admin/policies", name: "Quy chế & Ngân sách", icon: <SlidersHorizontal size={19} /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? "w-20" : "w-64"
      } bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out border-r border-slate-800/80 select-none`}
    >
      {/* Branding Header */}
      <div
        className={`h-16 flex items-center ${
          isCollapsed ? "justify-center px-0" : "justify-between px-4"
        } border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md transition-all`}
      >
        <Link
          to="/admin"
          className="flex items-center gap-3 overflow-hidden group"
          title="Trang quản trị ProcurePrime B2B"
        >
          <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck size={20} className="text-indigo-400" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Procure<span className="text-indigo-400">Prime</span> <span className="text-xs px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">ENTERPRISE</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium -mt-0.5">B2B Admin Console</span>
            </div>
          )}
        </Link>

        {onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Thu gọn thanh menu"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {!isCollapsed && (
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu Quản Trị
          </p>
        )}
        {navItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={`group relative flex items-center ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto rounded-xl p-0"
                  : "px-3.5 py-2.5 rounded-xl"
              } transition-all duration-200 font-medium text-sm ${
                isActive
                  ? isCollapsed
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <span
                className={`transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-indigo-400"
                }`}
              >
                {item.icon}
              </span>

              {!isCollapsed && (
                <>
                  <span className="ml-3 truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <ChevronRight size={16} className="ml-auto opacity-70" />
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Quick link to storefront */}
        <div className="pt-4 mt-4 border-t border-slate-800/60">
          <Link
            to="/?view=storefront"
            target="_blank"
            className={`group flex items-center ${
              isCollapsed
                ? "justify-center w-11 h-11 mx-auto rounded-xl p-0"
                : "px-3.5 py-2.5 rounded-xl"
            } text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/20 border border-transparent hover:border-emerald-800/30 transition-all text-sm font-medium`}
            title={isCollapsed ? "Xem cửa hàng người dùng" : undefined}
          >
            <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && (
              <>
                <span className="ml-3 truncate">Xem Cửa Hàng</span>
                <span className="ml-auto text-xs text-slate-400">↗</span>
              </>
            )}
          </Link>
        </div>
      </nav>

      {/* User Section Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/70">
        {user ? (
          <div className="relative">
            <button
              onClick={handleToggleProfile}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center p-0" : "p-2"
              } rounded-xl hover:bg-slate-800/80 transition-colors group text-left`}
              title={isCollapsed ? `${user.name} (${user.email})` : undefined}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20 border border-indigo-400/30">
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>

              {!isCollapsed && (
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {user.name || "Quản trị viên"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {user.email}
                  </p>
                </div>
              )}
            </button>

            {/* Profile Popover */}
            {showProfile && (
              <div
                className={`absolute bottom-full ${
                  isCollapsed ? "left-16" : "left-0"
                } mb-3 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200 ring-1 ring-black/5 animate-in slide-in-from-bottom-2 fade-in duration-200`}
              >
                <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base">{user.name}</h3>
                    <p className="text-xs text-indigo-100 opacity-90 truncate max-w-[200px]">
                      {user.email}
                    </p>
                    <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                      Super Administrator
                    </span>
                  </div>
                  <button
                    onClick={() => setShowProfile(false)}
                    className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 bg-white text-slate-800">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Tên hiển thị
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex-1 px-3 py-2 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 px-3 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition shadow-sm"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          navigate("/change-password");
                        }}
                        className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition"
                      >
                        <Key size={15} className="mr-2.5 text-slate-400" />
                        Đổi mật khẩu tài khoản
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition"
                      >
                        <Edit size={15} className="mr-2.5 text-slate-400" />
                        Chỉnh sửa thông tin
                      </button>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <LogOut size={15} className="mr-2.5 text-rose-500" />
                        Đăng xuất hệ thống
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium text-xs shadow-md"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
