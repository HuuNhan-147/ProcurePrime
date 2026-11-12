import { tx, uiMessage, uiText, useLocale, formatVND } from "../i18n";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/productSearchApi";
import SearchFilter from "../components/SearchFilter";
import { IProduct } from "../types/product";

const SearchProduct: React.FC = () => {
  useLocale();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleResetFilters = () => {
    navigate("/admin/products/search", { replace: true });
  };

  const handleDelete = (productId: string) => {
    if (window.confirm(tx("adminProducts:deleteThisProduct"))) {
      // TODO: Gọi API xóa sản phẩm ở đây
      console.log("Xóa sản phẩm với ID:", productId);
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{tx("adminProducts:productManagement2")}</h1>
      <SearchFilter initialValues={getInitialValues()} />

      {loading ? (
        <div className="text-center py-8">{tx("adminProducts:loadingProducts")}</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{uiText(error)}</div>
      ) : products.length > 0 ? (
        <div className="overflow-x-auto mt-6">
          <div className="pp-table-region" role="region" aria-label={tx("adminProducts:dataTable")} tabIndex={0}><table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminProducts:image")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminProducts:productName")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminProducts:price")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminProducts:quantity")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminProducts:rating2")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminProducts:actions2")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
  src={product.image || "/images/no-image.png"}
  alt={uiText(product.name)}
  className="w-16 h-16 object-contain rounded"
  onError={(e) => {
    (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
  }}
/>

                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                    {uiText(product.name)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#254AD7] font-semibold">
                    {formatVND(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {uiText(product.countInStock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={i < product.rating ? "yellow" : "gray"}
                          className="w-5 h-5"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button type="button"
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                      className="mr-2 px-3 py-1 bg-[#254AD7] text-white text-sm rounded hover:bg-[#1D3CBA] transition-colors"
                    >{tx("adminProducts:edit2")}</button>
                    <button type="button"
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >{tx("adminProducts:delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl">{tx("adminProducts:noMatchingProducts")}</p>
          <button type="button"
            onClick={handleResetFilters}
            className="mt-4 text-[#254AD7] hover:underline"
          >{tx("adminProducts:clearFilters")}</button>
        </div>
      )}
    </div>
  );
};

export default SearchProduct;
