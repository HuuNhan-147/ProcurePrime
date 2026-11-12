import { tx, uiMessage, uiText, useLocale } from "../i18n";
import AuthScaffold from "../components/ui/AuthScaffold";
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
  useLocale();
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
      setError(uiMessage("auth:theNewPasswordAndConfirmationDoNot"));
      return;
    }

    if (newPassword.length < 6) {
      setError(uiMessage("auth:theNewPasswordMustContainAtLeast"));
      return;
    }

    setLoading(true);

    const token = getToken();
    if (!token) {
      setError(uiMessage("auth:youAreNotSignedInPleaseSign"));
      setLoading(false);
      return;
    }

    try {
      await updatePassword(currentPassword, newPassword, token);
      setMessage(uiMessage("auth:passwordUpdatedSuccessfullyRedirecting"));

      const decoded: any = jwtDecode(token);
      const isAdmin = decoded?.isAdmin === true;

      setTimeout(() => {
        navigate(isAdmin ? "/admin" : "/");
      }, 2500);
    } catch (err: any) {
      setError(err.message || uiMessage("auth:unableToUpdateYourPasswordCheckYour"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold error={error} title={tx("auth:changeAccountPassword")} description={tx("auth:updateYourPasswordToHelpKeepYour")} backTo={user?.isAdmin ? "/admin" : "/"}>{error && (
          <div role="alert" id="pp-auth-error" tabIndex={-1} className="mb-6 p-3.5 bg-rose-50 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{uiText(error)}</div>
          </div>
        )}
{message && (
          <div role="status" className="mb-6 p-3.5 bg-emerald-50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{tx("auth:passwordChangedSuccessfully")}</p>
              <p className="font-medium mt-0.5">{uiText(message)}</p>
            </div>
          </div>
        )}
<form aria-describedby={error ? "pp-auth-error" : undefined} onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >{tx("auth:currentPassword")}{" "}<span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                placeholder={tx("auth:enterCurrentPassword")}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button aria-label={uiText(showCurrentPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={uiText(showCurrentPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
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
            >{tx("auth:newPassword")}{" "}<span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                placeholder={tx("auth:atLeast6Characters")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button aria-label={uiText(showNewPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={uiText(showNewPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
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
            >{tx("auth:confirmNewPassword")}{" "}<span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={17} />
              </div>
              <input
                id="confirmNewPassword"
                type="password"
                required
                placeholder={tx("auth:reEnterNewPassword")}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#254AD7] hover: hover: transition-all active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{tx("auth:processingRequest")}</span>
              </>
            ) : (
              tx("auth:saveNewPassword")
            )}
          </button>
        </form>
<div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            to={user?.isAdmin ? "/admin" : "/"}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#254AD7] transition-colors"
          >
            <ArrowLeft size={15} />
            <span>{uiText(user?.isAdmin ? tx("auth:backToAdmin") : tx("auth:backToHome"))}</span>
          </Link>
        </div></AuthScaffold>
  );
};

export default ChangePassword;
