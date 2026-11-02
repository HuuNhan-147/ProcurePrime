import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/UserApi";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
} from "lucide-react";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { resetToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!resetToken) {
      setError("Liên kết xác nhận không hợp lệ hoặc đã hết hạn.");
    }
  }, [resetToken]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu từ 6 ký tự!");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!resetToken) {
        setError("Token xác thực không hợp lệ!");
        return;
      }

      await resetPassword(resetToken, newPassword);
      setMessage("Mật khẩu của bạn đã được thay đổi thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.message || "Lỗi khi thay đổi mật khẩu. Vui lòng thử lại!");
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
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 shadow-xs">
            <Key size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Đặt lại mật khẩu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Vui lòng nhập mật khẩu mới bảo mật cho tài khoản của bạn
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Thao tác thành công!</p>
              <p className="font-medium mt-0.5">{message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Mật khẩu mới */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
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
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md shadow-indigo-600/30 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang lưu mật khẩu mới...</span>
              </>
            ) : (
              "Lưu Thay Đổi Mật Khẩu"
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

export default ResetPassword;
