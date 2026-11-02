// pages/HomePage.tsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Banner from "../components/Banner";
import FeaturedProducts from "../components/FeaturedProducts";
import Footer from "../components/Footer";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("view") === "storefront";

  useEffect(() => {
    // Nếu tài khoản là Admin và không chủ ý xem cửa hàng với tham số ?view=storefront
    // thì tự động điều hướng về Bảng Quản Trị /admin
    if (user?.isAdmin && !isPreview) {
      navigate("/admin", { replace: true });
    }
  }, [user, isPreview, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Banner />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
