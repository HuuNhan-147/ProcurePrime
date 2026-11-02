import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../api/CartApi";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MainNav from "../components/Header/MainNav";
import ContactInfo from "../components/Header/ContactInfo";
import CartButton from "../components/Header/CartButton";
import OrdersButton from "../components/Header/OrdersButton";
import AuthButtons from "../components/Header/AuthButtons";
import { ShieldCheck, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

const Header = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [tokenExpired, setTokenExpired] = useState(false);

  // Hàm kiểm tra token hết hạn
  const checkTokenExpiration = (token: string) => {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        handleAutoLogout("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
      return true;
    }
  };

  // Hàm xử lý đăng xuất tự động
  const handleAutoLogout = (message: string) => {
    logout();
    setTokenExpired(true);
    alert(message);
    navigate("/login");
  };

  // Interceptor axios để xử lý token hết hạn
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleAutoLogout(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
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
          "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
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
          "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
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
        handleAutoLogout("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
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
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-sm backdrop-blur-md">
      {/* Admin Quick Bar */}
      {user?.isAdmin && (
        <div className="bg-indigo-950/80 text-white px-4 py-1.5 text-xs flex items-center justify-between border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-indigo-400" />
            <span>
              Quyền quản trị: <strong>Admin Mode</strong>
            </span>
          </div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-[11px] transition"
          >
            <span>Bảng Quản Trị</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. BRAND IDENTITY */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link
              to={user?.isAdmin ? "/admin" : "/"}
              className="flex items-center gap-2.5 group"
              title="ProcurePrime - Nền Tảng Thu Mua & Báo Giá Doanh Nghiệp"
            >
              <img
                src={logo}
                alt="ProcurePrime"
                className="w-8 h-8 object-cover rounded-lg border border-slate-700 group-hover:scale-105 transition-transform"
              />
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Procure<span className="text-indigo-400">Prime</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  B2B
                </span>
              </div>
            </Link>

            {/* 2. NAVIGATION MENU (Đặt ngay cạnh logo hoặc căn giữa) */}
            <MainNav onViewProducts={handleViewProducts} isAdmin={user?.isAdmin} />
          </div>

          {/* 3. UTILITIES & ACTIONS */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <ContactInfo />
            <OrdersButton />
            {token && <CartButton token={token} />}
            <AuthButtons
              user={user}
              token={token}
              onAutoLogout={handleAutoLogout}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
