import { tx, uiMessage, uiText, useLocale } from "../i18n";
import AuthScaffold from "../components/ui/AuthScaffold";
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
  useLocale();
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
      setMessage(uiMessage("auth:aPasswordRecoveryLinkHasBeenSent"));
      setTimeout(() => navigate("/login"), 4000);
    } catch (err: any) {
      setError(err.message || uiMessage("auth:unableToSendRecoveryEmailPleaseTry"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold error={error} title={tx("auth:forgotPassword")} description={tx("auth:enterYourAccountEmailToReceiveA")} backTo="/">{error && (
          <div role="alert" id="pp-auth-error" tabIndex={-1} className="mb-6 p-3.5 bg-rose-50 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="font-medium leading-relaxed">{uiText(error)}</div>
          </div>
        )}
{message && (
          <div role="status" className="mb-6 p-3.5 bg-emerald-50 rounded-lg border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{tx("auth:requestSentSuccessfully")}</p>
              <p className="font-medium mt-0.5">{uiText(message)}</p>
              <p className="text-[11px] text-emerald-600 mt-1 font-mono">{tx("auth:redirectingToSignIn")}</p>
            </div>
          </div>
        )}
<form aria-describedby={error ? "pp-auth-error" : undefined} onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >{tx("auth:accountEmail")}{" "}<span className="text-rose-500">*</span>
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
                placeholder={tx("auth:nameExampleCom")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <span>{tx("auth:sendingRecoveryEmail")}</span>
              </>
            ) : (
              tx("auth:sendRecoveryLink")
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

export default ForgotPassword;
