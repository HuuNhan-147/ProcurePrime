// frontend/src/components/procurement/QuotationModal.tsx
// ============================================
// QUOTATION MODAL — Xem trước & Xuất Báo Giá Thương Mại B2B Chuẩn Mực
// ============================================

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaFileInvoiceDollar,
  FaPrint,
  FaCheckCircle,
  FaHourglassHalf,
  FaShieldAlt,
  FaBuilding,
} from "react-icons/fa";

interface QuotationItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface QuotationDetail {
  quotationNumber: string;
  organizationSnapshot: {
    name: string;
    taxCode: string;
    address: string;
    phone: string;
  };
  items: QuotationItem[];
  subtotal: number;
  volumeDiscountPercent: number;
  volumeDiscountAmount: number;
  vatPercent: number;
  vatAmount: number;
  grandTotal: number;
  status: "ISSUED" | "DRAFT" | "ACCEPTED" | "REJECTED";
  validUntil: string;
  issuedAt: string;
  terms: string[];
  auditFingerprint: string;
}

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationNumber: string | null;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  quotationNumber,
}) => {
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !quotationNumber) return;

    const fetchQuotation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/quotations/${quotationNumber}`);
        const data = await res.json();
        if (data.success && data.data) {
          setQuotation(data.data);
        } else {
          setError(data.message || "Không thể tải chi tiết báo giá");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối tới máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [isOpen, quotationNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FaFileInvoiceDollar className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Báo Giá Thương Mại B2B</h3>
              <p className="text-xs text-slate-400 font-mono">
                Số hiệu: {quotationNumber || "Đang tải..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {loading && (
            <div className="py-12 text-center text-slate-500 font-medium">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2" />
              <p>Đang tải dữ liệu báo giá...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              ⚠️ {error}
            </div>
          )}

          {quotation && !loading && (
            <>
              {/* Status and Issue Date Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Trạng thái</div>
                  <div className="mt-0.5">
                    {quotation.status === "ISSUED" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                        <FaCheckCircle className="text-emerald-600" /> ĐÃ PHÁT HÀNH CHÍNH THỨC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                        <FaHourglassHalf className="text-amber-600" /> CHỜ PHÊ DUYỆT (DRAFT)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Thời hạn hiệu lực</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">
                    15 ngày kể từ {new Date(quotation.issuedAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 border-b pb-1.5">
                  <FaBuilding className="text-indigo-600" /> Doanh Nghiệp Nhận Báo Giá
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Đơn vị:</span>{" "}
                    <strong>{quotation.organizationSnapshot?.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Mã số thuế:</span>{" "}
                    <strong>{quotation.organizationSnapshot?.taxCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Địa chỉ:</span>{" "}
                    {quotation.organizationSnapshot?.address}
                  </div>
                  <div>
                    <span className="text-slate-500">Điện thoại:</span>{" "}
                    {quotation.organizationSnapshot?.phone}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Danh Mục Thiết Bị
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                      <tr>
                        <th className="p-2.5 text-center w-10">STT</th>
                        <th className="p-2.5">Thiết bị</th>
                        <th className="p-2.5 text-center w-14">SL</th>
                        <th className="p-2.5 text-right w-24">Đơn giá</th>
                        <th className="p-2.5 text-right w-28">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {quotation.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-medium text-slate-900">{item.productName}</td>
                          <td className="p-2.5 text-center">{item.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600">
                            {item.unitPrice.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {item.subtotal.toLocaleString("vi-VN")} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Cộng tiền hàng (Subtotal):</span>
                  <span className="font-semibold">{quotation.subtotal.toLocaleString("vi-VN")} đ</span>
                </div>
                {quotation.volumeDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Chiết khấu sỉ B2B ({quotation.volumeDiscountPercent}%):</span>
                    <span>- {quotation.volumeDiscountAmount.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Thuế GTGT VAT ({quotation.vatPercent}%):</span>
                  <span className="font-semibold">+ {quotation.vatAmount.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                  <span className="text-indigo-900">TỔNG THANH TOÁN:</span>
                  <span className="text-indigo-700 text-base font-extrabold">
                    {quotation.grandTotal.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              {/* Audit Seal */}
              <div className="flex items-center gap-2 p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-[11px] text-indigo-950 font-mono break-all">
                <FaShieldAlt className="text-indigo-600 text-sm flex-shrink-0" />
                <span>
                  <strong>SHA-256 HASH:</strong> {quotation.auditFingerprint}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>
          <a
            href={`http://localhost:5000/api/quotations/${quotationNumber}/html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <FaPrint /> Mở Bản In Trình Duyệt (HTML)
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuotationModal;

