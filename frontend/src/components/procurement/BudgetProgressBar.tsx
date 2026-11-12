import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../../i18n";
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
  title = uiMessage("quotation:enterpriseBudgetUtilisation"),
}) => {
  useLocale();
  if (!maxBudget || maxBudget <= 0) return null;

  const percent = Math.min(Math.round((currentTotal / maxBudget) * 100), 100);
  const isOverBudget = currentTotal > maxBudget;
  const isNearLimit = !isOverBudget && percent >= 80;

  let barColor = "bg-emerald-500";
  let statusBadge = (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
      <FaCheckCircle className="text-emerald-600 text-xs" />{" "}{tx("quotation:withinLimit")}{uiText(percent)}%)
    </span>
  );

  if (isOverBudget) {
    barColor = "bg-rose-500";
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">
        <FaExclamationTriangle className="text-rose-600 text-xs" />{" "}{tx("quotation:overBudget")}{uiText((currentTotal - maxBudget).toLocaleString(locale()))}{" "}{tx("quotation:message2")}</span>
    );
  } else if (isNearLimit) {
    barColor = "bg-amber-500";
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
        <FaExclamationTriangle className="text-amber-600 text-xs" />{" "}{tx("quotation:nearLimit")}{uiText(percent)}%)
      </span>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 my-2.5 text-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-600 uppercase tracking-wide">
          <FaShieldAlt className="text-[#254AD7] text-sm" />
          <span>{uiText(title)}</span>
        </div>
        {uiText(statusBadge)}
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={` h-2.5 rounded-full transition-all duration-500 ${barColor}  `}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2 text-xs font-semibold">
        <span className="text-slate-600">{tx("quotation:subtotal")}{" "}<strong className="text-slate-900">{formatVND(currentTotal)}</strong>
        </span>
        <span className="text-slate-600">{tx("quotation:approvedBudgetLimit")}{" "}<strong className="text-[#254AD7]">{formatVND(maxBudget)}</strong>
        </span>
      </div>
    </div>
  );
};

export default BudgetProgressBar;

