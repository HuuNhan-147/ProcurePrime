import { tx, uiText, useLocale, locale, formatVND } from "../i18n";
import React from "react";

interface CartSummaryProps {
  itemsPrice: number;
  discountPrice?: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  onBuyNow: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  itemsPrice,
  discountPrice = 0,
  shippingPrice,
  taxPrice,
  totalPrice,
  onBuyNow,
}) => {
  useLocale();
  return (
    <div className="pp-cart-summary pp-surface bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{tx("cart:procurementBudgetSummary")}</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">{tx("cart:equipmentSubtotal")}</span>
          <span className="text-slate-900 font-semibold">{formatVND(itemsPrice)}</span>
        </div>

        {discountPrice > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>{tx("cart:b2bWholesaleDiscount5")}</span>
            <span>-{formatVND(discountPrice)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-500">{tx("cart:projectDeliveryOnSiteService")}</span>
          <span className="text-emerald-700 font-medium">
            {uiText(shippingPrice === 0 ? tx("cart:freeNationwide") : tx("cart:value", { v0: (shippingPrice.toLocaleString(locale())) }))}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">{tx("cart:vat10")}</span>
          <span className="text-slate-900 font-semibold">{formatVND(taxPrice)}</span>
        </div>

        <div className="border-t border-slate-200 pt-3 mt-3">
          <div className="flex justify-between font-bold text-base">
            <span className="text-slate-900">{tx("cart:totalPayment")}</span>
            <span className="text-[#254AD7]">
              {formatVND(totalPrice)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">{tx("cart:includesAValidElectronicVatInvoiceFor")}</span>
        </div>
      </div>

      <button type="button"
        onClick={onBuyNow}
        className="w-full mt-6 bg-[#254AD7] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#254AD7] transition"
      >{tx("cart:createPurchaseOrderPo")}</button>
    </div>
  );
};

export default CartSummary;
