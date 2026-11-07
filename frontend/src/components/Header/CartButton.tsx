import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useCart } from "../../context/CartContext";

interface CartButtonProps {
  token: string;
}

const CartButton: React.FC<CartButtonProps> = ({ token }) => {
  const { getCartItemCount } = useCart();
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  useEffect(() => {
    const count = getCartItemCount();
    setCartItemCount(count);
  }, [token, getCartItemCount]);

  return (
    <Link
      to="/cart"
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition relative py-1.5 px-2.5 rounded-lg hover:bg-slate-800"
      title="Bảng tổng hợp Yêu Cầu Báo Giá Thiết Bị (RFQ Requisition)"
    >
      <ClipboardList className="h-4 w-4 text-indigo-400" />
      <span className="hidden sm:inline">Yêu cầu RFQ</span>
      {cartItemCount > 0 && (
        <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-mono">
          {cartItemCount > 99 ? "99+" : cartItemCount}
        </span>
      )}
    </Link>
  );
};

export default CartButton;
