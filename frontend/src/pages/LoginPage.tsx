import { tx, uiText, useLocale } from "../i18n";
import AuthScaffold from "../components/ui/AuthScaffold";
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
  useLocale();
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
    <AuthScaffold error={error} title={tx("auth:welcomeBack")} description={tx("auth:signInToContinueYourProcurementJourney")} backTo={user?.isAdmin ? "/admin" : "/"}>{error && (
            <div role="alert" id="pp-auth-error" tabIndex={-1} className="mb-6 p-3.5 bg-rose-50 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
              <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed"><p>{tx("common:errors.signInFailed")}</p><details><summary>{tx("common:errors.original")}</summary>{error}</details></div>
            </div>
          )}
<form aria-describedby={error ? "pp-auth-error" : undefined} onSubmit={onSubmit} className="space-y-4">
            {/* Trường Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >{tx("auth:emailAddress")}{" "}<span className="text-rose-500">*</span>
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
                  placeholder={tx("auth:nameExampleCom")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Trường Mật Khẩu */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >{tx("auth:password")}{" "}<span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#254AD7] hover:text-[#254AD7] hover:underline transition-colors"
                >{tx("auth:forgotPassword")}</Link>
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

            {/* Checkbox Ghi nhớ */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#254AD7] border-slate-300 focus:ring-indigo-500/30"
                />
                <span className="text-xs font-medium text-slate-600">{tx("auth:rememberMe")}</span>
              </label>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-xs sm:text-sm text-white bg-[#254AD7] hover: hover: transition-all active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{tx("auth:authenticating")}</span>
                </>
              ) : (
                tx("auth:signIn")
              )}
            </button>
          </form>
<div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">{tx("auth:newToProcureprime")}{" "}
              <Link
                to="/register"
                className="font-bold text-[#254AD7] hover:text-[#254AD7] hover:underline transition-colors ml-1"
              >{tx("auth:createAnAccount")}</Link>
            </p>
          </div></AuthScaffold>
  );
};

export default LoginPage;
