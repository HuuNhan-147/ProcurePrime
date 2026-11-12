import { tx, uiText, useLocale } from "../i18n";
import React, { useState, useEffect, useId, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../api/CartApi";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MainNav from "../components/Header/MainNav";
import ContactInfo from "../components/Header/ContactInfo";
import CartButton from "../components/Header/CartButton";
import OrdersButton from "../components/Header/OrdersButton";
import AuthButtons from "../components/Header/AuthButtons";
import { ShieldCheck, ArrowRight, Menu, X } from "lucide-react";
import ProcurePrimeWordmark from "./brand/ProcurePrimeWordmark";
import PrimeButton from "./ui/PrimeButton";
import PrimeStatus from "./ui/PrimeStatus";
import LanguageToggle from "./ui/LanguageToggle";

const Header = () => {
  useLocale();
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { pathname, search } = useLocation();

  // Presentation only: disclosure state never owns auth, cart or navigation state.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => {
      setMenuOpen(false);
      if (desktop.matches && document.activeElement === menuButtonRef.current) {
        headerRef.current?.querySelector<HTMLAnchorElement>(".pp-main-nav a")?.focus();
      } else if (!desktop.matches && headerRef.current?.querySelector(".pp-header__panel")?.contains(document.activeElement)) {
        menuButtonRef.current?.focus();
      }
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const handleOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [menuOpen]);

  // Hàm kiểm tra token hết hạn
  const checkTokenExpiration = (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        handleAutoLogout(tx("navigation:yourSessionHasExpiredPleaseSignIn"));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return true;
    }
  };

  // Hàm xử lý đăng xuất tự động
  const handleAutoLogout = useCallback((message: string) => {
    logout();
    setTokenExpired(true);
    alert(message);
    navigate("/login");
  }, [logout, navigate]);

  // Interceptor axios để xử lý token hết hạn
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleAutoLogout(
            tx("navigation:yourSessionHasExpiredPleaseSignIn")
          );
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout, navigate]);

  // Kiểm tra token định kỳ
  useEffect(() => {
    if (!user) return;

    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handleAutoLogout(
          tx("navigation:yourSessionIsInvalidPleaseSignIn")
        );
        return;
      }

      checkTokenExpiration(token);
    };

    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [user, logout, navigate]);

  const fetchCartItemCount = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleAutoLogout(
          tx("navigation:yourSessionIsInvalidPleaseSignIn")
        );
        return;
      }

      if (checkTokenExpiration(token)) return;

      const cartData = await getCart(token);
      const count = cartData.cart.cartItems.reduce(
        (total: number, item: { quantity: number }) => total + item.quantity,
        0
      );

      setCartItemCount(count);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleAutoLogout(tx("navigation:yourSessionHasExpiredPleaseSignIn"));
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItemCount();
    } else {
      setCartItemCount(0);
    }
  }, [user]);

  const handleViewProducts = () => {
    navigate("/products");
  };

  return (
    <header ref={headerRef} className="pp-header">
      {/* Admin Quick Bar */}
      {user?.isAdmin && (
        <div className="pp-header__admin-bar">
          <PrimeStatus tone="info">
            <ShieldCheck size={16} aria-hidden="true" />{tx("navigation:adminAccess")}</PrimeStatus>
          <Link
            to="/admin"
            className="pp-header__admin-link"
          >
            <span>{tx("navigation:adminDashboard")}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Main Header Container */}
      <div className="pp-header__container">
        <div className="pp-header__brand-row">
            <Link
              to={user?.isAdmin ? "/admin" : "/"}
              className="pp-header__brand"
              title={tx("navigation:procureprimeEnterpriseProcurementQuotations")}
            >
              <ProcurePrimeWordmark />
            </Link>
          <LanguageToggle />
          <PrimeButton
            ref={menuButtonRef}
            variant="secondary"
            size="compact"
            className="pp-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={uiText(menuOpen ? tx("navigation:closeNavigationMenu") : tx("navigation:openNavigationMenu"))}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span>{tx("navigation:menu")}</span>
          </PrimeButton>
        </div>
        <div id={panelId} className="pp-header__panel" data-open={menuOpen}>
          <div className="pp-language-mobile"><LanguageToggle /></div>
          <div
            className="pp-header__navigation"
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("a, button")) {
                setMenuOpen(false);
                if (menuOpen) menuButtonRef.current?.focus();
              }
            }}
          >
            <MainNav onViewProducts={handleViewProducts} isAdmin={user?.isAdmin} />
          </div>
          <div className="pp-header__utilities">
            <div className="pp-header__contact"><ContactInfo /></div>
            <div className="pp-header__utility-slot pp-header__orders"><OrdersButton /></div>
            {token && <div className="pp-header__utility-slot pp-header__cart"><CartButton token={token} /></div>}
            <div className="pp-header__utility-slot pp-header__account">
              <AuthButtons
                user={user}
                token={token}
                onAutoLogout={handleAutoLogout}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
