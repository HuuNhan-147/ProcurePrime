import React from "react";
import { Link } from "react-router-dom";

interface MainNavProps {
  onViewProducts: () => void;
  isAdmin?: boolean;
}

const MainNav: React.FC<MainNavProps> = ({ onViewProducts, isAdmin = false }) => {
  return (
    <nav className="hidden lg:flex items-center space-x-6 whitespace-nowrap flex-shrink-0">
      <Link
        to={isAdmin ? "/admin" : "/"}
        className="text-sm text-slate-300 hover:text-white font-medium transition flex items-center gap-1.5 whitespace-nowrap"
        title={isAdmin ? "Về Bảng Điều Khiển Admin" : "Trang chủ"}
      >
        <span>Trang chủ</span>
        {isAdmin && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/80 text-white font-bold tracking-wider uppercase">
            Admin
          </span>
        )}
      </Link>

      <button
        onClick={onViewProducts}
        className="text-sm text-slate-300 hover:text-white font-medium transition whitespace-nowrap"
      >
        Danh mục thiết bị
      </button>

      <Link
        to="/workspace"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap border border-indigo-400/30"
        title="Không gian Thu Mua Doanh Nghiệp Tự Hành"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Procurement Workstation</span>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-200 font-mono font-bold uppercase">
          AI
        </span>
      </Link>
    </nav>
  );
};

export default MainNav;
