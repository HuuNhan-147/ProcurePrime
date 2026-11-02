import React, { useState } from "react";
import { updatePassword } from "../api/UserApi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getToken, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và mật khẩu xác nhận không trùng khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }

    setLoading(true);

    const token = getToken();
    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword, token);
      setMessage("Mật khẩu đã được cập nhật thành công! Đang chuyển hướng...");

      const decoded: any = jwtDecode(token);
      const isAdmin = decoded?.isAdmin === true;

      setTimeout(() => {
        navigate(isAdmin ? "/admin" : "/");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Lỗi khi cập nhật mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại!");
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
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Đổi mật khẩu tài khoản
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Cập nhật mật khẩu định kỳ giúp tài khoản của bạn luôn được bảo vệ an toàn
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
              <p className="font-bold">Đổi mật khẩu thành công!</p>
              <p className="font-medium mt-0.5">{message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Mật khẩu hiện tại <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                placeholder="Nhập mật khẩu đang dùng"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

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
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="confirmNewPassword"
                type="password"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
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
                <span>Đang xử lý yêu cầu...</span>
              </>
            ) : (
              "Lưu Mật Khẩu Mới"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            to={user?.isAdmin ? "/admin" : "/"}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>{user?.isAdmin ? "Quay lại trang Admin" : "Quay lại trang chủ"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
