import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../../i18n";
import { AccessibleDialog } from "../ui/PresentationAccess";
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
  useLocale();
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
          setError(data.message || uiMessage("quotation:unableToLoadQuotationDetails"));
        }
      } catch (err: any) {
        setError(err.message || uiMessage("quotation:unableToConnectToTheServer"));
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [isOpen, quotationNumber]);

  if (!isOpen) return null;

  return (
    <AccessibleDialog aria-label={tx("quotation:quotationDetails")} onClose={onClose} className="pp-dialog fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#254AD7] rounded-lg">
              <FaFileInvoiceDollar className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">{tx("quotation:b2bCommercialQuotation")}</h3>
              <p className="text-xs text-slate-400 font-mono">{tx("quotation:reference")}{" "}{uiText(quotationNumber || tx("quotation:loading"))}
              </p>
            </div>
          </div>
          <button aria-label={tx("quotation:close")} type="button"
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
              <p>{tx("quotation:loadingQuotation")}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              ⚠️ {uiText(error)}
            </div>
          )}

          {quotation && !loading && (
            <>
              {/* Status and Issue Date Bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{tx("quotation:status")}</div>
                  <div className="mt-0.5">
                    {quotation.status === "ISSUED" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                        <FaCheckCircle className="text-emerald-600" />{" "}{tx("quotation:issued")}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                        <FaHourglassHalf className="text-amber-600" />{" "}{tx("quotation:awaitingApprovalDraft")}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{tx("quotation:validity")}</div>
                  <div className="text-xs font-semibold text-slate-700 mt-0.5">{tx("quotation:15DaysFrom")}{" "}{uiText(new Date(quotation.issuedAt).toLocaleDateString(locale()))}
                  </div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 border-b pb-1.5">
                  <FaBuilding className="text-[#254AD7]" />{" "}{tx("quotation:quotationRecipient")}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">{tx("quotation:organisation")}</span>{" "}
                    <strong>{uiText(quotation.organizationSnapshot?.name)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{tx("quotation:taxId")}</span>{" "}
                    <strong>{uiText(quotation.organizationSnapshot?.taxCode)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">{tx("quotation:address")}</span>{" "}
                    {uiText(quotation.organizationSnapshot?.address)}
                  </div>
                  <div>
                    <span className="text-slate-500">{tx("quotation:phone")}</span>{" "}
                    {uiText(quotation.organizationSnapshot?.phone)}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">{tx("quotation:equipmentList")}</div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="pp-table-region" role="region" aria-label={tx("quotation:dataTable")} tabIndex={0}><table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                      <tr>
                        <th scope="col" className="p-2.5 text-center w-10">{tx("quotation:no")}</th>
                        <th scope="col" className="p-2.5">{tx("quotation:devices")}</th>
                        <th scope="col" className="p-2.5 text-center w-14">{tx("quotation:qty")}</th>
                        <th scope="col" className="p-2.5 text-right w-24">{tx("quotation:unitPrice")}</th>
                        <th scope="col" className="p-2.5 text-right w-28">{tx("quotation:lineTotal")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {quotation.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center text-slate-500">{uiText(idx + 1)}</td>
                          <td className="p-2.5 font-medium text-slate-900">{uiText(item.productName)}</td>
                          <td className="p-2.5 text-center">{uiText(item.quantity)}</td>
                          <td className="p-2.5 text-right text-slate-600">
                            {formatVND(item.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {formatVND(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">{tx("quotation:subtotal2")}</span>
                  <span className="font-semibold">{formatVND(quotation.subtotal)}</span>
                </div>
                {quotation.volumeDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{tx("quotation:b2bWholesaleDiscount")}{uiText(quotation.volumeDiscountPercent)}%):</span>
                    <span>- {formatVND(quotation.volumeDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">{tx("quotation:vat")}{uiText(quotation.vatPercent)}%):</span>
                  <span className="font-semibold">+ {formatVND(quotation.vatAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-bold text-slate-900">
                  <span className="text-indigo-900">{tx("quotation:totalPayment")}</span>
                  <span className="text-[#254AD7] text-base font-semibold">
                    {formatVND(quotation.grandTotal)}</span>
                </div>
              </div>

              {/* Audit Seal */}
              <div className="flex items-center gap-2 p-2.5 bg-[#edf1ff] border border-indigo-100 rounded-lg text-[11px] text-indigo-950 font-mono break-all">
                <FaShieldAlt className="text-[#254AD7] text-sm flex-shrink-0" />
                <span>
                  <strong>{tx("quotation:sha256Hash")}</strong> {uiText(quotation.auditFingerprint)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-200">
          <button type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >{tx("quotation:close")}</button>
          <a
            href={`http://localhost:5000/api/quotations/${quotationNumber}/html`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#254AD7] hover:bg-[#254AD7] rounded-lg transition-all"
          >
            <FaPrint />{" "}{tx("quotation:openPrintableDocumentHtml")}</a>
        </div>
      </div>
    </AccessibleDialog>
  );
};

export default QuotationModal;

