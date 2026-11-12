import { tx, uiMessage, useLocale } from "../i18n";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/productSearchApi";
import { IProduct } from "../types/product";
import { useAuth } from "../context/AuthContext";

import AdminProductSearchFilter from "./AdminProductSearchFilter";
import AdminProductTable from "./AdminProductTable";

const AdminProductList: React.FC = () => {
  useLocale();
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
      setError(uiMessage("adminProducts:unableToLoadProducts"));
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{tx("adminProducts:productManagement")}</h1>
          <p className="text-slate-500 text-sm mt-1">{tx("adminProducts:manageStockAndProductListings")}</p>
        </div>
        <button type="button"
          onClick={handleAddProduct}
          className="inline-flex items-center gap-2 bg-[#254AD7] hover: hover: text-white font-bold py-2.5 px-5 rounded-lg transition-all text-xs"
        >
          <span className="text-base leading-none">+</span>{tx("adminProducts:addProduct3")}</button>
      </div>

      {/* Search Filter Section */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5">
        <AdminProductSearchFilter initialValues={getInitialValues()} />
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg overflow-hidden border border-slate-200/80">
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
