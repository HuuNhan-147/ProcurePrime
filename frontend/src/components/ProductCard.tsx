import React, { useState } from "react";
import { IProduct } from "../types/product";
import { AddToCartButton } from "./AddToCartButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Truck, ArrowRight, FileText } from "lucide-react";

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
    target.alt = "Thiết bị CNTT chuẩn Doanh nghiệp";
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
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between p-4 group">
      <div>
        {/* KHUNG ẢNH THIẾT BỊ B2B */}
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
          {/* Huy hiệu tiêu chuẩn B2B */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="bg-slate-900/90 backdrop-blur-sm text-slate-200 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
              ENTERPRISE B2B
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className="bg-emerald-700/90 backdrop-blur-sm text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>36T On-site</span>
            </span>
          </div>
        </div>

        {/* THÔNG TIN THIẾT BỊ */}
        <div className="space-y-1.5">
          <h3
            onClick={handleCardClick}
            className="text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-indigo-600 transition leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>
        </div>
      </div>

      {/* ĐƠN GIÁ DỰ ÁN & CHÍNH SÁCH CHIẾT KHẤU SỈ */}
      <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-slate-950 font-mono tracking-tight">
                {product.price.toLocaleString("vi-VN")} ₫
              </span>
              <span className="text-[10px] text-slate-400 font-medium">/ bộ</span>
            </div>
            <span className="block text-[10px] text-indigo-700 font-medium mt-0.5">
              (Chưa gồm VAT 10% • CK 5% từ 5 bộ)
            </span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
              <Truck className="w-3 h-3" />
              <span>Sẵn kho: {product.countInStock}</span>
            </span>
          </div>
        </div>

        {/* CẶP NÚT HÀNH ĐỘNG DOANH NGHIỆP: [ĐƯA VÀO RFQ] & [TẠO ĐƠN PO] */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <AddToCartButton
            product={product}
            className="w-full text-center"
          />
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
            onClick={handleOrderProcurement}
            disabled={product.countInStock <= 0}
            title="Khởi tạo Đơn Đặt Hàng Doanh Nghiệp (PO)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tạo Đơn PO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
