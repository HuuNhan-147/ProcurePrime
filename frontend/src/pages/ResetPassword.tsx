import { tx, uiMessage, uiText, useLocale } from "../i18n";
import AuthScaffold from "../components/ui/AuthScaffold";
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
  useLocale();
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
      setError(uiMessage("auth:thisResetLinkIsInvalidOrHas"));
    }
  }, [resetToken]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError(uiMessage("auth:passwordConfirmationDoesNotMatch"));
      return;
    }

    if (newPassword.length < 6) {
      setError(uiMessage("auth:theNewPasswordMustContainAtLeast2"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!resetToken) {
        setError(uiMessage("auth:invalidAuthenticationToken"));
        return;
      }

      await resetPassword(resetToken, newPassword);
      setMessage(uiMessage("auth:yourPasswordHasBeenChangedRedirecting"));
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.message || uiMessage("auth:unableToChangeYourPasswordPleaseTry"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold error={error} title={tx("auth:resetPassword")} description={tx("auth:enterASecureNewPasswordForYour")} backTo="/">{error && (
          <div role="alert" id="pp-auth-error" tabIndex={-1} className="mb-6 p-3.5 bg-rose-50 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{uiText(error)}</div>
          </div>
        )}
{message && (
          <div role="status" className="mb-6 p-3.5 bg-emerald-50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{tx("auth:completedSuccessfully")}</p>
              <p className="font-medium mt-0.5">{uiText(message)}</p>
            </div>
          </div>
        )}
<form aria-describedby={error ? "pp-auth-error" : undefined} onSubmit={handleResetPassword} className="space-y-4">
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
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder={tx("auth:atLeast6Characters")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button aria-label={uiText(showPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={uiText(showPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
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
            >{tx("auth:confirmNewPassword")}{" "}<span className="text-rose-500">*</span>
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
                placeholder={tx("auth:reEnterNewPassword")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button aria-label={uiText(showConfirmPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                title={uiText(showConfirmPassword ? tx("auth:hidePassword") : tx("auth:showPassword"))}
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
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
                <span>{tx("auth:savingNewPassword")}</span>
              </>
            ) : (
              tx("auth:savePasswordChanges")
            )}
          </button>
        </form>
<div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#254AD7] transition-colors"
          >
            <ArrowLeft size={15} />
            <span>{tx("auth:backToSignIn")}</span>
          </Link>
        </div></AuthScaffold>
  );
};

export default ResetPassword;
