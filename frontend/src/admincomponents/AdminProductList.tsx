import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/productSearchApi";
import { IProduct } from "../types/product";
import { useAuth } from "../context/AuthContext";

import AdminProductSearchFilter from "./AdminProductSearchFilter";
import AdminProductTable from "./AdminProductTable";

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const token = getToken();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchFilteredProducts = async (params: { [key: string]: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data: IProduct[] = await fetchProducts(params);
      setProducts(data);
    } catch (err) {
      setError("Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const params = {
      keyword: searchParams.get("keyword") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      sortBy: searchParams.get("sortBy") || "latest",
    };

    fetchFilteredProducts(params);
  }, [location.search]);

  const getInitialValues = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      keyword: searchParams.get("keyword") || "",
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      sortBy: searchParams.get("sortBy") || "latest",
    };
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product._id !== productId)
    );
  };

  const handleAddProduct = () => {
    navigate("/admin/add-product");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi, chỉnh sửa tồn kho và niêm yết các mặt hàng trên sàn
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/25 hover:shadow-lg hover:-translate-y-0.5 text-xs"
        >
          <span className="text-base leading-none">+</span>
          Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Search Filter Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5">
        <AdminProductSearchFilter initialValues={getInitialValues()} />
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-2xl shadow-xs overflow-hidden border border-slate-200/80">
        <AdminProductTable
          products={products}
          loading={loading}
          error={error}
          token={token}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>
    </div>
  );
};

export default AdminProductList;
