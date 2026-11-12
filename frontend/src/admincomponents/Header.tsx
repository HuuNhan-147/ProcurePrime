import { tx, uiMessage, uiText, useLocale } from "../i18n";
import { usePresentationFocus } from "../components/ui/PresentationAccess";
import ProcurePrimeWordmark from "../components/brand/ProcurePrimeWordmark";
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
  isCompact?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  isCompact = false,
  mobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
}) => {
  useLocale();
  const sidebarRef = usePresentationFocus<HTMLElement>(isCompact && mobileOpen, () => onCloseMobile?.());
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
    if (window.confirm(tx("admin:areYouSureYouWantToSign"))) {
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
      alert(tx("admin:detailsUpdatedSuccessfully"));
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      alert(tx("admin:unableToUpdateDetails"));
    }
  };

  const navItems = [
    { path: "/admin", name: uiMessage("admin:overview"), icon: <Home size={19} />, badge: "Live" },
    { path: "/admin/products", name: uiMessage("admin:products"), icon: <Package size={19} /> },
    { path: "/admin/categories", name: uiMessage("admin:categories"), icon: <Layers size={19} /> },
    { path: "/admin/orders", name: uiMessage("admin:orders"), icon: <ShoppingCart size={19} /> },
    { path: "/admin/users", name: uiMessage("admin:customers"), icon: <Users size={19} /> },
    { path: "/admin/workspace", name: uiMessage("admin:procurementCopilot"), icon: <Bot size={19} />, badge: "AI" },
    { path: "/admin/policies", name: uiMessage("admin:policiesBudgets"), icon: <SlidersHorizontal size={19} /> },
  ];

  return (
    <aside ref={sidebarRef} id="pp-admin-sidebar" data-mobile-open={mobileOpen} inert={isCompact && !mobileOpen} role={isCompact && mobileOpen ? "dialog" : undefined} aria-modal={isCompact && mobileOpen ? true : undefined} aria-label={tx("admin:adminNavigation2")}
      className={`pp-admin-sidebar  fixed left-0 top-0 h-full ${
        isCollapsed ? "w-20" : "w-64"
      } bg-slate-900 text-slate-300 flex flex-col z-50 transition-all duration-300 ease-in-out border-r border-slate-800/80 select-none `}
    >
      {/* Branding Header */}
      <div
        className={` h-16 flex items-center ${
          isCollapsed ? "justify-center px-0" : "justify-between px-4"
        } border-b border-slate-800/80 bg-slate-950/60 transition-all `}
      >
        <Link
          to="/admin"
          className="flex items-center gap-3 overflow-hidden group"
          title={tx("admin:procureprimeB2bAdministration")}
        >
          {isCollapsed ? <span aria-label={tx("admin:procureprime")} className="text-xl text-white">{tx("admin:p")}</span> : <ProcurePrimeWordmark />}
        </Link>

        {onToggleCollapse && !isCollapsed && (
          <button aria-label={tx("admin:collapseNavigation")} type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={tx("admin:collapseNavigation")}
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <button type="button" className="pp-admin-mobile-close" onClick={onCloseMobile}>{tx("admin:closeMenu")}</button>
      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {!isCollapsed && (
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{tx("admin:adminMenu")}</p>
        )}
        {navItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              aria-current={isActive ? "page" : undefined}
              to={item.path}
              title={uiText(isCollapsed ? item.name : undefined)}
              className={` group relative flex items-center ${
                isCollapsed
                  ? "justify-center w-11 h-11 mx-auto rounded-lg p-0"
                  : "px-3.5 py-2.5 rounded-lg"
              } transition-all duration-200 font-medium text-sm ${
                isActive
                  ? isCollapsed
                    ? "bg-[#254AD7] text-white ring-2 ring-indigo-400/50"
                    : "bg-[#254AD7] text-white"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }  `}
            >
              <span
                className={` transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-indigo-400"
                }  `}
              >
                {uiText(item.icon)}
              </span>

              {!isCollapsed && (
                <>
                  <span className="ml-3 min-w-0 flex-1 whitespace-normal break-words">{uiText(item.name)}</span>
                  {item.badge && (
                    <span className="ml-auto shrink-0 whitespace-nowrap text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                      {uiText(item.badge)}
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
            className={` group flex items-center ${
              isCollapsed
                ? "justify-center w-11 h-11 mx-auto rounded-lg p-0"
                : "px-3.5 py-2.5 rounded-lg"
            } text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/20 border border-transparent hover:border-emerald-800/30 transition-all text-sm font-medium `}
            title={uiText(isCollapsed ? tx("admin:viewPublicStore") : undefined)}
          >
            <ExternalLink size={18} className="transition-transform" />
            {!isCollapsed && (
              <>
                <span className="ml-3 truncate">{tx("admin:viewStore")}</span>
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
            <button aria-label={uiText(isCollapsed ? tx("admin:valueValue", { v0: (user.name), v1: (user.email) }) : undefined)} type="button"
              onClick={handleToggleProfile}
              className={` w-full flex items-center ${
                isCollapsed ? "justify-center p-0" : "p-2"
              } rounded-lg hover:bg-slate-800/80 transition-colors group text-left `}
              title={uiText(isCollapsed ? tx("admin:valueValue", { v0: (user.name), v1: (user.email) }) : undefined)}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-lg bg-[#254AD7] text-white flex items-center justify-center font-bold text-sm border border-indigo-400/30">
                  {uiText(user.name?.charAt(0).toUpperCase() || "A")}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>

              {!isCollapsed && (
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {uiText(user.name || tx("admin:administrator2"))}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {uiText(user.email)}
                  </p>
                </div>
              )}
            </button>

            {/* Profile Popover */}
            {showProfile && (
              <div
                className={` absolute bottom-full ${
                  isCollapsed ? "left-16" : "left-0"
                } mb-3 w-72 pp-admin-profile bg-white rounded-lg overflow-hidden z-50 border border-slate-200 ring-1 ring-black/5 animate-in slide-in- fade-in duration-200 `}
              >
                <div className="bg-[#254AD7] p-4 text-white flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base">{uiText(user.name)}</h3>
                    <p className="text-xs text-indigo-100 opacity-90 truncate max-w-[200px]">
                      {uiText(user.email)}
                    </p>
                    <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">{tx("admin:superAdministrator")}</span>
                  </div>
                  <button aria-label={tx("admin:close")} type="button"
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
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tx("admin:displayName")}</label>
                        <input aria-label={tx("admin:displayName")}
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tx("admin:phoneNumber")}</label>
                        <input aria-label={tx("admin:phoneNumber")}
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 px-3 py-2 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
                        >{tx("admin:cancel")}</button>
                        <button type="button"
                          onClick={handleSaveProfile}
                          className="flex-1 px-3 py-2 text-xs text-white bg-[#254AD7] hover:bg-[#254AD7] rounded-lg font-medium transition"
                        >{tx("admin:saveChanges")}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <button type="button"
                        onClick={() => {
                          setShowProfile(false);
                          navigate("/change-password");
                        }}
                        className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#edf1ff] hover:text-[#254AD7] rounded-lg transition"
                      >
                        <Key size={15} className="mr-2.5 text-slate-400" />{tx("admin:changeAccountPassword")}</button>
                      <button type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#edf1ff] hover:text-[#254AD7] rounded-lg transition"
                      >
                        <Edit size={15} className="mr-2.5 text-slate-400" />{tx("admin:editDetails")}</button>
                      <div className="h-px bg-slate-100 my-2"></div>
                      <button type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <LogOut size={15} className="mr-2.5 text-rose-500" />{tx("admin:signOut")}</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center w-full px-3 py-2 bg-[#254AD7] hover:bg-[#254AD7] text-white rounded-lg transition font-medium text-xs"
          >{tx("admin:signIn")}</Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
