import { tx, uiMessage, uiText, useLocale } from "../i18n";
import React, { useEffect, useState } from "react";
import { fetchProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import { IProduct } from "../types/product"; // Import đúng đường dẫn
const ProductList = () => {
  useLocale();
  // ✅ Định nghĩa state với kiểu dữ liệu rõ ràng
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(uiMessage("catalog:unableToLoadProducts"));
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) return <p>{tx("catalog:loadingProducts")}</p>;
  if (error) return <p style={{ color: "red" }}>{uiText(error)}</p>;

  return (
    <div>
      <h1>{tx("catalog:productList")}</h1>
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>{tx("catalog:noProductsAvailable")}</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
