import { tx, useLocale } from "../i18n";
// pages/HomePage.tsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Banner from "../components/Banner";
import { Suspense } from "react";
import RouteSurface, { lazyPage } from "../components/ui/RouteSurface";
import LandingStory from "../components/landing/LandingStory";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "../components/landing/landing.css";
const FeaturedProducts = lazyPage(() => import("../components/FeaturedProducts"), ["catalog", "cart"]);
const Footer = lazyPage(() => import("../components/Footer"));

const HomePage = () => {
  useLocale();
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
    <div className="pp-landing min-h-screen flex flex-col">
      <main id="pl-main" className="flex-grow" tabIndex={-1}>
        <a href="#pl-hero-title" className="pl-skip">{tx("marketing:skipToMainContent")}</a>
        <Banner />
        <LandingStory />
        <RouteSurface><Suspense fallback={<div className="pl-wrap pl-catalog-loading" role="status">{tx("common:screen.loading")}</div>}><FeaturedProducts presentation="landing" /></Suspense></RouteSurface>
        <section className="pl-closing pl-wrap" aria-labelledby="pl-closing-title">
          <p className="pl-eyebrow">{tx("marketing:startWithYourRequirements")}</p>
          <h2 id="pl-closing-title">{tx("marketing:oneStartingPoint")}<br />{tx("marketing:moreClarity")}</h2>
          <a href="#pl-hero-title" className="pp-button pp-button--primary">{tx("marketing:describeRequirements")}{" "}<ArrowUpRight size={18} aria-hidden="true" /></a>
          <Link to="/workspace" className="pl-text-link">{tx("marketing:orOpenWorkspaceDirectly")}</Link>
        </section>
      </main>
      <RouteSurface><Suspense fallback={<div className="pl-footer-loading" role="status">{tx("common:screen.loading")}</div>}><Footer /></Suspense></RouteSurface>
    </div>
  );
};

export default HomePage;
