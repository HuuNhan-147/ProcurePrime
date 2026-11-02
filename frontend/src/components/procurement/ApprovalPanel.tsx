// frontend/src/components/procurement/ApprovalPanel.tsx
// ============================================
// APPROVAL PANEL — Bảng Phê Duyệt Thẩm Quyền Dành Cho Manager & CFO
// ============================================

import React, { useState } from "react";
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
          text: `Đã phê duyệt báo giá ${quotationNumber} thành công! Trạng thái chuyển sang ISSUED.`,
        });
        if (onApprovalSuccess) onApprovalSuccess(quotationNumber);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setResultMsg({ type: "error", text: data.message || "Không thể phê duyệt báo giá" });
      }
    } catch (err: any) {
      setResultMsg({ type: "error", text: err.message || "Lỗi kết nối máy chủ" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-md">
              <FaUserCheck className="text-white text-base" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Thẩm Quyền Phê Duyệt Thu Mua</h3>
              <p className="text-[11px] text-slate-400 font-mono">Báo giá: {quotationNumber}</p>
            </div>
          </div>
          <button
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
              <strong>Yêu cầu xác thực thẩm quyền:</strong> Đơn hàng có tổng giá trị{" "}
              <strong>{grandTotal.toLocaleString("vi-VN")} đ</strong> vượt ngưỡng tự duyệt của nhân
              viên (&gt; 50 triệu VNĐ).
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cấp thẩm quyền phê duyệt:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApproverRole("MANAGER")}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  approverRole === "MANAGER"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Trưởng Phòng (Manager)
              </button>
              <button
                type="button"
                onClick={() => setApproverRole("CFO")}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                  approverRole === "CFO"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Giám Đốc Tài Chính (CFO)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú phê duyệt:</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              placeholder="Nhập ý kiến phê duyệt hoặc căn cứ giải trình..."
            />
          </div>

          {resultMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold ${
                resultMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {resultMsg.type === "success" ? "✓" : "⚠️"} {resultMsg.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleApprove}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
          >
            <FaCheck /> {submitting ? "Đang xử lý..." : "Xác Nhận Phê Duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPanel;

