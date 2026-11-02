import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/UserApi";
import {
  Mail,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await forgotPassword(email);
      setMessage("Đã gửi liên kết khôi phục mật khẩu. Vui lòng kiểm tra hộp thư email của bạn!");
      setTimeout(() => navigate("/login"), 4000);
    } catch (err: any) {
      setError(err.message || "Không thể gửi email khôi phục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden antialiased selection:bg-indigo-500 selection:text-white">
      {/* Vệt sáng trang trí Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-3xl pointer-events-none" />

      {/* Top Branding Bar */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck size={20} className="text-indigo-400" />
          </div>
        </div>
        <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
          NodeX <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">SECURITY</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Form */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 shadow-xs">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quên mật khẩu?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Nhập email tài khoản của bạn để nhận liên kết xác thực đặt lại mật khẩu
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Thông báo thành công */}
        {message && (
          <div className="mb-6 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Đã gửi yêu cầu thành công!</p>
              <p className="font-medium mt-0.5">{message}</p>
              <p className="text-[11px] text-emerald-600 mt-1 font-mono">
                Đang chuyển hướng về trang đăng nhập...
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Email đăng nhập <span className="text-rose-500">*</span>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-600/30 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang gửi thư khôi phục...</span>
              </>
            ) : (
              "Gửi Liên Kết Khôi Phục"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Quay lại trang đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
