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
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
        Tóm Tắt Ngân Sách Thu Mua
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Tạm tính thiết bị:</span>
          <span className="text-slate-900 font-semibold">{itemsPrice.toLocaleString("vi-VN")} ₫</span>
        </div>

        {discountPrice > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Chiết khấu sỉ B2B (5%):</span>
            <span>-{discountPrice.toLocaleString("vi-VN")} ₫</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-slate-500">Giao hàng dự án & On-site:</span>
          <span className="text-emerald-700 font-medium">
            {shippingPrice === 0 ? "Miễn phí toàn quốc" : `${shippingPrice.toLocaleString("vi-VN")} ₫`}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Thuế GTGT VAT (10%):</span>
          <span className="text-slate-900 font-semibold">{taxPrice.toLocaleString("vi-VN")} ₫</span>
        </div>

        <div className="border-t border-slate-200 pt-3 mt-3">
          <div className="flex justify-between font-bold text-base">
            <span className="text-slate-900">Tổng thanh toán:</span>
            <span className="text-indigo-600">
              {totalPrice.toLocaleString("vi-VN")} ₫
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            * Đã bao gồm hóa đơn điện tử VAT hợp lệ cho doanh nghiệp
          </span>
        </div>
      </div>

      <button
        onClick={onBuyNow}
        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
      >
        Lập Đơn Hàng Mua Sắm (Purchase Order)
      </button>
    </div>
  );
};

export default CartSummary;
