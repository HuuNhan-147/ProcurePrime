import { tx, uiMessage, uiText, useLocale, locale, formatVND } from "../i18n";
import React, { useState } from "react";
import { IProduct } from "../types/product";
import { AddToCartButton } from "./AddToCartButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Truck, ArrowRight, FileText } from "lucide-react";
import PrimeButton from "./ui/PrimeButton";

interface ProductCardProps {
  product: IProduct;
  presentation?: "catalog" | "landing";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, presentation = "catalog" }) => {
  useLocale();
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
    target.alt = tx("catalog:enterpriseItEquipment");
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

  if (presentation === "landing") {
    return (
      <article className="pl-product-card">
        <button type="button" onClick={handleCardClick} className="pl-product-media" aria-label={tx("catalog:viewDetailsForValue", { v0: (product.name) })}>
          {loading && <span className="pl-image-loading">{tx("catalog:loadingImage")}</span>}
          <img src={imageUrl} alt={uiText(product.name)} onError={handleImageError} onLoad={handleImageLoad} loading="lazy" width={600} height={450} />
        </button>
        <div className="pl-product-copy">
          <h3><button type="button" onClick={handleCardClick} className="pl-product-name">{uiText(product.name)}</button></h3>
          <p>{uiText(product.description)}</p>
          <div className="pl-product-price">{formatVND(product.price)}</div>
          <div className="pl-product-stock">{uiText(typeof product.countInStock === "number" ? product.countInStock > 0 ? tx("catalog:catalogStockValue", { v0: (product.countInStock.toLocaleString(locale())) }) : tx("catalog:currentlyOutOfStockInCatalog") : tx("catalog:stockInformationUnavailable"))}</div>
          <div className="pl-product-actions">
            <AddToCartButton product={product} className="pl-product-cart" />
            <PrimeButton onClick={handleOrderProcurement} disabled={product.countInStock <= 0} title={tx("catalog:createABusinessPurchaseOrderPo")}>
              <FileText size={16} aria-hidden="true" /><span>{tx("catalog:createPo")}</span>
            </PrimeButton>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="pp-product-card pp-surface bg-white rounded-lg border border-slate-200/90 hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between p-4 group">
      <div>
        {/* KHUNG ẢNH THIẾT BỊ B2B */}
        <div className="relative aspect-video w-full mb-3 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
          {loading && (
            <div className="absolute inset-0 flex justify-center items-center bg-slate-100 text-slate-400 text-xs">{tx("catalog:loadingImage2")}</div>
          )}
          <img
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300"
            src={imageUrl}
            alt={uiText(product.name)}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            onClick={handleCardClick}
          />
          {/* Huy hiệu tiêu chuẩn B2B */}
          <div className="pp-product-badges absolute top-2 left-2 right-2 flex flex-wrap gap-1">
            <span className="bg-slate-900/90 text-slate-200 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded">{tx("catalog:enterpriseB2b")}</span>
            <span className="bg-emerald-700/90 text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 flex-none" aria-hidden="true" />
              <span>{tx("catalog:36MonthOnSiteWarranty")}</span>
            </span>
          </div>
        </div>

        {/* THÔNG TIN THIẾT BỊ */}
        <div className="space-y-1.5">
          <h3
            className="text-sm font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-[#254AD7] transition leading-snug"
            title={uiText(product.name)}
          >
            <button type="button" onClick={handleCardClick} className="text-left w-full">{uiText(product.name)}</button>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans">
            {uiText(product.description)}
          </p>
        </div>
      </div>

      {/* ĐƠN GIÁ DỰ ÁN & CHÍNH SÁCH CHIẾT KHẤU SỈ */}
      <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-slate-950 font-mono tracking-tight">
                {formatVND(product.price)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{tx("catalog:set")}</span>
            </div>
            <span className="block text-[10px] text-[#254AD7] font-medium mt-0.5">{tx("catalog:excludes10Vat5DiscountFrom5")}</span>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium border px-2 py-0.5 rounded ${typeof product.countInStock === "number" && product.countInStock > 0 ? "text-emerald-700 bg-emerald-50 border-emerald-200/60" : "text-slate-600 bg-slate-100 border-slate-200"}`}>
              <Truck className="w-3 h-3" />
              <span>{typeof product.countInStock === "number" ? product.countInStock > 0 ? <>{tx("catalog:inStock")}{" "}{uiText(product.countInStock)}</> : tx("catalog:outOfStock") : tx("catalog:stockInformationUnavailable")}</span>
            </span>
          </div>
        </div>

        {/* CẶP NÚT HÀNH ĐỘNG DOANH NGHIỆP: [ĐƯA VÀO RFQ] & [TẠO ĐƠN PO] */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <AddToCartButton
            product={product}
            className="w-full text-center"
          />
          <button type="button"
            className="w-full bg-[#254AD7] hover:bg-[#254AD7] text-white py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
            onClick={handleOrderProcurement}
            disabled={product.countInStock <= 0}
            title={tx("catalog:createABusinessPurchaseOrderPo2")}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{tx("catalog:createPo2")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
