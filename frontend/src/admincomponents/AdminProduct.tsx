import { tx, uiMessage, uiText, useLocale, formatVND } from "../i18n";
import React, { useState, useEffect } from "react";
import { IProduct } from "../types/product";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteProduct } from "../api/productApi";

interface ProductCardProps {
  product: IProduct;
  onDelete: (productId: string) => void;
}

const AdminProduct: React.FC<ProductCardProps> = ({ product, onDelete }) => {
  useLocale();
  const [loading, setLoading] = useState<boolean>(true);
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/no-image.png";
    target.alt = uiMessage("adminProducts:productImageUnavailable");
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleEdit = () => {
    navigate(`/admin/product/${product._id}`);
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const confirmed = window.confirm(tx("adminProducts:deleteThisProduct"));
    if (!confirmed) return;

    try {
      await deleteProduct(product._id, token);
      onDelete(product._id);
      alert(tx("adminProducts:productDeletedSuccessfully"));
    } catch (error) {
      console.error("Không thể xóa sản phẩm", error);
      alert(tx("adminProducts:unableToDeleteTheProductPleaseTry"));
    }
  };


  const renderStars = () => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={i < product.rating ? "yellow" : "gray"}
        className="w-5 h-5"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ));
  };

  useEffect(() => {
    const shipping = product.price * 0.05;
    setShippingPrice(shipping);
  }, [product]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image Section */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-500">{tx("adminProducts:loadingImage")}</span>
          </div>
        )}
        <img
          src={product.image} 
          alt={uiText(product.name)}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          className="w-full aspect-square object-contain p-2 bg-white"
        />
        {product.rating === 5 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">{tx("adminProducts:featured")}</span>
        )}
      </div>

      {/* Product Info Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
          {uiText(product.name)}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2 h-10">
          {uiText(product.description)}
        </p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold text-blue-600">
            {formatVND(product.price)}
          </span>
          <div className="flex">{uiText(renderStars())}</div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">{tx("adminProducts:available")}{" "}{uiText(product.countInStock)}{" "}{tx("adminProducts:products")}</span>
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >{tx("adminProducts:details")}</button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              disabled={product.countInStock <= 0}
            >{tx("adminProducts:delete")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProduct;
