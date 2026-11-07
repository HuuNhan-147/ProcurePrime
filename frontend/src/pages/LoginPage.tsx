import React, { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/UserLogin";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const { handleLogin, error, loading } = useLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-stretch text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Cột Trái: Branding Banner (Hiển thị trên màn hình lớn lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-12 flex-col justify-between overflow-hidden border-r border-slate-800/80">
        {/* Vệt sáng trang trí background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck size={22} className="text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Procure<span className="text-indigo-400">Prime</span> <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">B2B PORTAL</span>
            </span>
            <p className="text-xs text-slate-400 font-medium -mt-0.5">Nền Tảng Thu Mua &amp; Quản Trị B2B Doanh Nghiệp</p>
          </div>
        </div>

        {/* Main Banner Content */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Nền tảng mua sắm tích hợp AI Agent</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Khám phá trải nghiệm <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              mua sắm không giới hạn.
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Hàng ngàn sản phẩm công nghệ cao cấp, thanh toán trực tuyến bảo mật qua VNPay và trợ lý AI thông minh luôn sẵn sàng đồng hành cùng bạn.
          </p>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            {[
              "Bảo mật thanh toán & thông tin tiêu chuẩn SSL 256-bit",
              "Giao hàng nhanh toàn quốc cùng chế độ bảo hành chính hãng",
              "Trợ lý AI hỗ trợ tư vấn chọn sản phẩm theo nhu cầu 24/7",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <span>© 2026 ProcurePrime B2B Corporation. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Hệ thống an toàn
          </span>
        </div>
      </div>

      {/* Cột Phải: Form Đăng Nhập Chuẩn Production */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-50 relative">
        {/* Nút Quay lại trang chủ */}
        <Link
          to={user?.isAdmin ? "/admin" : "/"}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-slate-200/60"
        >
          <ArrowLeft size={16} />
          <span>{user?.isAdmin ? "Về trang Admin" : "Về trang chủ"}</span>
        </Link>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/80 border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Form */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-3 shadow-xs">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Chào mừng trở lại!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Đăng nhập tài khoản để tiếp tục trải nghiệm mua sắm
            </p>
          </div>

          {/* Alert Lỗi */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
              <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Trường Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Địa chỉ Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={17} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Trường Mật Khẩu */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Checkbox Ghi nhớ */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500/30"
                />
                <span className="text-xs font-medium text-slate-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-600/30 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>
          </form>

          {/* Chuyển sang Đăng ký */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Chưa có tài khoản ProcurePrime?{" "}
              <Link
                to="/register"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors ml-1"
              >
                Đăng ký tài khoản ngay →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
