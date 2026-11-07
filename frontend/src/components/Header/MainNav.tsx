import React from "react";
import { Link } from "react-router-dom";
import { Bot, SlidersHorizontal, ShieldCheck } from "lucide-react";

interface MainNavProps {
  onViewProducts: () => void;
  isAdmin?: boolean;
}

const MainNav: React.FC<MainNavProps> = ({ onViewProducts, isAdmin = false }) => {
  return (
    <nav className="hidden lg:flex items-center space-x-6 whitespace-nowrap flex-shrink-0">
      <Link
        to="/"
        className="text-sm text-slate-300 hover:text-white font-medium transition flex items-center gap-1.5 whitespace-nowrap"
        title="Trang chủ Cổng Doanh Nghiệp"
      >
        <span>Trang chủ</span>
      </Link>

      <button
        onClick={onViewProducts}
        className="text-sm text-slate-300 hover:text-white font-medium transition whitespace-nowrap"
      >
        Danh mục thiết bị B2B
      </button>

      <Link
        to="/cart"
        className="text-sm text-slate-300 hover:text-white font-medium transition whitespace-nowrap"
        title="Xem danh mục thiết bị yêu cầu báo giá"
      >
        Bảng RFQ
      </Link>

      {/* DÀNH CHO NHÂN VIÊN & QUẢN TRỊ VIÊN: TRUY CẬP TRỰC TIẾP AI COPILOT & QUY CHẾ */}
      {isAdmin ? (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <Link
            to="/admin/workspace"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap border border-indigo-400/30"
            title="Mở AI Procurement Copilot dành cho Nhân viên Kinh doanh & Thu mua"
          >
            <Bot size={13} className="text-indigo-200" />
            <span>AI Copilot</span>
            <span className="text-[9px] px-1 rounded bg-indigo-950 text-indigo-300 font-mono font-bold">
              STAFF
            </span>
          </Link>

          <Link
            to="/admin/policies"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700"
            title="Quản trị Quy chế Mua sắm & Ngân sách"
          >
            <SlidersHorizontal size={12} className="text-slate-400" />
            <span>Quy chế</span>
          </Link>
        </div>
      ) : null}
    </nav>
  );
};

export default MainNav;
