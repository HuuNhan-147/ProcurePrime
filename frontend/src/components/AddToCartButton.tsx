import { tx, uiMessage, useLocale, localizedNode, localizedMessage } from "../i18n";
import React, { useState } from "react";
import { IProduct } from "../types/product";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FileSpreadsheet, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AddToCartButtonProps {
  product: IProduct;
  onAddToCart?: () => void;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  onAddToCart,
  className = "",
}) => {
  useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { getToken } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    const token = getToken();
    if (!token) {
      toast.warning(localizedNode("cart:signInWithABusinessAccountTo"), {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/login");
      return;
    }

    if (product.countInStock <= 0) return;

    setIsLoading(true);
    setIsSuccess(false);

    try {
      await addToCart(product._id, 1);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);

      toast.success(localizedNode("cart:addedToYourRequestForQuotationRfq"), {
        position: "top-right",
        autoClose: 2000,
      });

      if (onAddToCart) onAddToCart();
    } catch (error: any) {
      console.error("Lỗi khi thêm vào RFQ:", error);
      const errorMessage =
        error.response?.data?.message || uiMessage("cart:unableToAddTheRfqItem");
      toast.error(localizedMessage(errorMessage), {
        position: "top-right",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={product.countInStock <= 0 || isLoading || isSuccess}
      className={`${className} ${
        product.countInStock <= 0
          ? "bg-slate-200 text-slate-400 cursor-not-allowed border-slate-200"
          : isSuccess
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
      } border text-xs font-semibold py-2 px-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5`}
      title={tx("cart:addThisDeviceToYourRequestFor")}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5 text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{tx("cart:saving")}</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="h-3.5 w-3.5 text-white" />
          <span>{tx("cart:rfqSaved")}</span>
        </>
      ) : product.countInStock > 0 ? (
        <>
          <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
          <span>{tx("cart:addToRfq")}</span>
        </>
      ) : (
        <span>{tx("cart:outOfStock")}</span>
      )}
    </button>
  );
};
