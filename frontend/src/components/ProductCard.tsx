import React, { useState } from "react";
import { IProduct } from "../types/product";
import { AddToCartButton } from "./AddToCartButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProductCardProps {
  product: IProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // Hình ảnh sản phẩm
  const imageUrl = product.image
    ? product.image.startsWith("http")
      ? product.image
      : `http://localhost:5000${product.image}`
    : "/images/no-image.png";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80";
    target.alt = "Thiết bị doanh nghiệp B2B";
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleOrderProcurement = () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    navigate("/create", {
      state: {
        product,
        shippingPrice: 0,
      },
    });
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`, {
      state: { product },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between p-4 group">
      <div>
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-slate-100 text-slate-400 text-xs">
              Đang tải hình ảnh...
            </div>
          )}
          <img
            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
            src={imageUrl}
            alt={product.name}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            onClick={handleCardClick}
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              B2B Enterprise
            </span>
            <span className="bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
              Bảo hành On-site
            </span>
          </div>
        </div>

        {/* PRODUCT DETAILS */}
        <div className="space-y-1.5">
          <h3
            onClick={handleCardClick}
            className="text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-indigo-600 transition"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* PRICING & STOCK */}
      <div className="pt-3 border-t border-slate-100 mt-3">
        <div className="flex items-baseline justify-between mb-1">
          <div>
            <span className="text-base font-extrabold text-slate-900">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              (Chưa gồm VAT 10% • CK 5% từ 10 máy)
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Kho: {product.countInStock} bộ
          </span>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
          <AddToCartButton
            product={product}
            className="w-full text-xs font-semibold py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition border border-slate-200 text-center"
          />
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-2 rounded-lg text-xs font-semibold transition shadow-sm text-center disabled:opacity-50"
            onClick={handleOrderProcurement}
            disabled={product.countInStock <= 0}
          >
            Tạo Đơn PO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
