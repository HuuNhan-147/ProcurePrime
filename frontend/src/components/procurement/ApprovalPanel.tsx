import { tx, uiMessage, uiText, useLocale, formatVND } from "../../i18n";
// frontend/src/components/procurement/ApprovalPanel.tsx
// ============================================
// APPROVAL PANEL — Bảng Phê Duyệt Thẩm Quyền Dành Cho Manager & CFO
// ============================================

import React, { useState } from "react";
import { AccessibleDialog } from "../ui/PresentationAccess";
import {
  FaUserCheck,
  FaTimes,
  FaCheck,
  FaBan,
  FaShieldAlt,
  FaExclamationCircle,
} from "react-icons/fa";

interface ApprovalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  quotationNumber: string | null;
  grandTotal?: number;
  authorityLevel?: "MANAGER" | "CFO" | "SPECIALIST";
  onApprovalSuccess?: (quotationNumber: string) => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  isOpen,
  onClose,
  quotationNumber,
  grandTotal = 0,
  authorityLevel = "MANAGER",
  onApprovalSuccess,
}) => {
  useLocale();
  const [approverRole, setApproverRole] = useState<"MANAGER" | "CFO">(
    authorityLevel === "CFO" ? "CFO" : "MANAGER"
  );
  const [note, setNote] = useState("Đã đối soát ngân sách và phê duyệt đề xuất.");
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  if (!isOpen || !quotationNumber) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    setResultMsg(null);
    try {
      const res = await fetch(`http://localhost:5000/api/quotations/${quotationNumber}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverRole,
          approverNote: note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMsg({
          type: "success",
          text: uiMessage("quotation:approvalSuccess", {v0: quotationNumber}),
        });
        if (onApprovalSuccess) onApprovalSuccess(quotationNumber);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setResultMsg({ type: "error", text: data.message || uiMessage("quotation:approvalFailed") });
      }
    } catch (err: any) {
      setResultMsg({ type: "error", text: err.message || uiMessage("quotation:connectionFailed") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccessibleDialog onClose={onClose} aria-label={tx("quotation:procurementApprovalAuthority")} className="pp-dialog pp-approval-dialog">
      <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-md">
              <FaUserCheck className="text-white text-base" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">{tx("quotation:procurementApprovalAuthority")}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{tx("quotation:quotation")}{" "}{uiText(quotationNumber)}</p>
            </div>
          </div>
          <button aria-label={tx("quotation:close")} type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs text-slate-800">
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <FaExclamationCircle className="text-amber-600 text-sm flex-shrink-0 mt-0.5" />
            <div>
              <strong>{tx("quotation:approvalAuthorityVerificationRequired")}</strong>{" "}{tx("quotation:thisOrderHasATotalValueOf")}{" "}
              <strong>{formatVND(grandTotal)}</strong>{" "}{tx("quotation:andExceedsTheStaffSelfApprovalLimit")}</div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">{tx("quotation:approvalAuthority")}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApproverRole("MANAGER")}
                className={` py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  approverRole === "MANAGER"
                    ? "bg-[#edf1ff] border-indigo-600 text-[#254AD7] ring-2 ring-indigo-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }  `}
              >{tx("quotation:lineManager")}</button>
              <button
                type="button"
                onClick={() => setApproverRole("CFO")}
                className={` py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  approverRole === "CFO"
                    ? "bg-[#edf1ff] border-indigo-600 text-[#254AD7] ring-2 ring-indigo-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }  `}
              >{tx("quotation:chiefFinancialOfficerCfo")}</button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">{tx("quotation:approvalNotes")}</label>
            <textarea aria-label={tx("quotation:approvalNotes2")}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              placeholder={tx("quotation:enterApprovalCommentsOrSupportingReasons")}
            />
          </div>

          {resultMsg && (
            <div
              className={` p-3 rounded-lg text-xs font-semibold ${
                resultMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }  `}
            >
              {uiText(resultMsg.type === "success" ? "✓" : "⚠️")} {uiText(resultMsg.text)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
          >{tx("quotation:cancel")}</button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
          >
            <FaCheck /> {uiText(submitting ? tx("quotation:processing") : tx("quotation:confirmApproval"))}
          </button>
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default ApprovalPanel;

