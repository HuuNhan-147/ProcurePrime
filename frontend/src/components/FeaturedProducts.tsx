import { tx, uiMessage, uiText, useLocale } from "../i18n";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchProducts } from "../api/productSearchApi";
import ProductCard from "./ProductCard";
import ResponsiveDisclosure from "./ui/ResponsiveDisclosure";
import SearchFilter from "./SearchFilter";
import { IProduct } from "../types/product";

interface ProductListProps {
  presentation?: "catalog" | "landing";
}

const ProductList: React.FC<ProductListProps> = ({ presentation = "catalog" }) => {
  useLocale();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch filtered products based on the query params
  const fetchFilteredProducts = async (params: { [key: string]: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data: IProduct[] = await fetchProducts(params);
      setProducts(data);
    } catch (err) {
      setError(uiMessage("catalog:unableToLoadProducts"));
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when location.search changes
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

  // Handle reset filters action
  const handleResetFilters = () => {
    navigate("/products", { replace: true });
  };

  // Get initial values for the filter form
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

  if (presentation === "landing") {
    return (
      <section className="pl-catalog pl-wrap" aria-labelledby="pl-catalog-title">
        <div className="pl-section-heading">
          <div><p className="pl-eyebrow">{tx("catalog:exploreTheCatalog")}</p><h2 id="pl-catalog-title">{tx("catalog:devicesToGetStarted")}</h2></div>
          <p>{tx("catalog:reviewProductsPricesAndStockInformationBefore")}</p>
        </div>
        <details className="pl-catalog-filters">
          <summary>{tx("catalog:searchFilterDevices")}</summary>
          <SearchFilter initialValues={getInitialValues()} />
        </details>
        {loading ? (
          <div aria-busy="true" className="pl-catalog-state">
            <p role="status">{tx("catalog:loadingDeviceCatalog")}</p>
            <div className="pl-product-grid" aria-hidden="true">{[0, 1, 2].map((item) => <div key={item} className="pl-skeleton" />)}</div>
          </div>
        ) : error ? (
          <div className="pl-catalog-state"><p role="alert" className="pl-catalog-error">{uiText(error)}</p><button type="button" onClick={handleResetFilters} className="pl-text-link">{tx("catalog:openTheCatalogToContinue")}</button></div>
        ) : products.length > 0 ? (
          <div className="pl-product-grid">{products.map((product) => <ProductCard key={product._id} product={product} presentation="landing" />)}</div>
        ) : (
          <div className="pl-catalog-state"><p>{tx("catalog:noDevicesMatchTheCurrentFilters")}</p><button type="button" onClick={handleResetFilters} className="pl-text-link">{tx("catalog:clearFilters")}</button></div>
        )}
      </section>
    );
  }

  return (
    <div className="pp-screen pp-catalog container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-3 border-b border-slate-200 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{tx("catalog:enterpriseEquipmentCatalog")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{tx("catalog:b2bItEquipmentAndInfrastructureWithOn")}</p>
        </div>
        <span className="self-start sm:self-auto text-xs font-mono font-bold px-3 py-1 bg-[#edf1ff] border border-indigo-200 text-[#254AD7] rounded-full">{tx("catalog:100GenuineB2b")}</span>
      </div>
      <ResponsiveDisclosure label={tx("catalog:searchFilterDevices")}><SearchFilter initialValues={getInitialValues()} /></ResponsiveDisclosure>
      {loading ? (
        <div className="text-center py-8">{tx("catalog:loadingProducts")}</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{uiText(error)}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl">{tx("catalog:noMatchingProducts")}</p>
          <button type="button"
            onClick={handleResetFilters}
            className="mt-4 text-[#254AD7] hover:underline"
          >{tx("catalog:clearFilters")}</button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
