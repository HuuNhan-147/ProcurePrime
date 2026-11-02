import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/UserApi";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  UserPlus,
} from "lucide-react";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Kiểm tra mật khẩu khớp
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có độ dài tối thiểu từ 6 ký tự!");
      return;
    }

    if (!agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!");
      return;
    }

    setLoading(true);

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );
      alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Đăng ký không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-stretch text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Cột Trái: Branding Banner (Hiển thị trên màn hình lớn lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-12 flex-col justify-between overflow-hidden border-r border-slate-800/80">
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
              NodeX <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">STORE</span>
            </span>
            <p className="text-xs text-slate-400 font-medium -mt-0.5">Sàn Thương Mại Điện Tử Hiện Đại</p>
          </div>
        </div>

        {/* Main Banner Content */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Tạo tài khoản thành viên chỉ trong 1 phút</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Gia nhập cộng đồng <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              mua sắm thông minh.
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Đăng ký để nhận hàng loạt ưu đãi thành viên độc quyền, theo dõi trạng thái đơn hàng thời gian thực và tích lũy điểm thưởng khi mua sắm.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Ưu đãi giảm giá độc quyền cho đơn hàng đầu tiên",
              "Theo dõi trạng thái giao hàng tức thì qua thông báo",
              "Quản lý lịch sử mua sắm và hóa đơn điện tử tiện lợi",
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
          <span>© 2026 NodeX Store Inc. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Bảo mật thông tin khách hàng
          </span>
        </div>
      </div>

      {/* Cột Phải: Form Đăng Ký Chuẩn Production */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-slate-50 relative overflow-y-auto">
        <Link
          to="/"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-slate-200/60"
        >
          <ArrowLeft size={16} />
          <span>Về trang chủ</span>
        </Link>

        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/80 border border-slate-200/80 my-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-3 shadow-xs">
              <UserPlus size={28} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tạo tài khoản mới
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Điền các thông tin dưới đây để đăng ký thành viên
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
              <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={17} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
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
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={17} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={17} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Xác nhận mật khẩu */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Xác nhận lại mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={17} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Điều khoản */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500/30"
                />
                <span className="text-xs text-slate-600 leading-tight">
                  Tôi đồng ý với{" "}
                  <span className="text-indigo-600 font-semibold hover:underline">
                    Điều khoản dịch vụ
                  </span>{" "}
                  và{" "}
                  <span className="text-indigo-600 font-semibold hover:underline">
                    Chính sách bảo mật
                  </span>
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
                  <span>Đang khởi tạo tài khoản...</span>
                </>
              ) : (
                "Đăng Ký Tài Khoản"
              )}
            </button>
          </form>

          {/* Link sang Đăng nhập */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Đã có tài khoản NodeX?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors ml-1"
              >
                Đăng nhập ngay →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
