// frontend/src/components/procurement/BudgetProgressBar.tsx
// ============================================
// BUDGET PROGRESS BAR — Trực quan hóa tiêu hao Ngân sách Trần Doanh nghiệp
// ============================================

import React from "react";
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

interface BudgetProgressBarProps {
  currentTotal: number;
  maxBudget: number;
  title?: string;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  currentTotal,
  maxBudget,
  title = "Tiến độ Tiêu hao Ngân sách Doanh nghiệp",
}) => {
  if (!maxBudget || maxBudget <= 0) return null;

  const percent = Math.min(Math.round((currentTotal / maxBudget) * 100), 100);
  const isOverBudget = currentTotal > maxBudget;
  const isNearLimit = !isOverBudget && percent >= 80;

  let barColor = "bg-emerald-500";
  let statusBadge = (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
      <FaCheckCircle className="text-emerald-600 text-xs" /> Trong hạn mức ({percent}%)
    </span>
  );

  if (isOverBudget) {
    barColor = "bg-rose-500";
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">
        <FaExclamationTriangle className="text-rose-600 text-xs" /> Vượt trần ngân sách ({(currentTotal - maxBudget).toLocaleString("vi-VN")} đ)
      </span>
    );
  } else if (isNearLimit) {
    barColor = "bg-amber-500";
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
        <FaExclamationTriangle className="text-amber-600 text-xs" /> Gần chạm trần ({percent}%)
      </span>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-2.5 text-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-600 uppercase tracking-wide">
          <FaShieldAlt className="text-indigo-600 text-sm" />
          <span>{title}</span>
        </div>
        {statusBadge}
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs font-semibold">
        <span className="text-slate-600">
          Tạm tính: <strong className="text-slate-900">{currentTotal.toLocaleString("vi-VN")} đ</strong>
        </span>
        <span className="text-slate-600">
          Trần phê duyệt: <strong className="text-indigo-700">{maxBudget.toLocaleString("vi-VN")} đ</strong>
        </span>
      </div>
    </div>
  );
};

export default BudgetProgressBar;

