import { tx, uiMessage, uiText, useLocale } from "../i18n";
import AuthScaffold from "../components/ui/AuthScaffold";
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
  useLocale();
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
      setError(uiMessage("auth:passwordConfirmationDoesNotMatch"));
      return;
    }

    if (formData.password.length < 6) {
      setError(uiMessage("auth:passwordMustContainAtLeast6Characters"));
      return;
    }

    if (!agreeTerms) {
      setError(uiMessage("auth:pleaseAgreeToTheTermsOfService"));
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
      alert(tx("auth:accountCreatedSuccessfullyPleaseSignIn"));
      navigate("/login");
    } catch (err: any) {
      setError(err.message || uiMessage("auth:unableToCreateAccountPleaseTryAgain"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold error={error} title={tx("auth:createAnAccount2")} description={tx("auth:enterYourDetailsToRegister")} backTo="/">{error && (
            <div role="alert" id="pp-auth-error" tabIndex={-1} className="mb-6 p-3.5 bg-rose-50 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
              <AlertCircle size={17} className="text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{uiText(error)}</div>
            </div>
          )}
<form aria-describedby={error ? "pp-auth-error" : undefined} onSubmit={handleRegister} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >{tx("auth:fullName")}{" "}<span className="text-rose-500">*</span>
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
                  placeholder={tx("auth:fullName2")}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
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
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={tx("auth:nameExampleCom")}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >{tx("auth:phoneNumber")}{" "}<span className="text-rose-500">*</span>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >{tx("auth:password")}{" "}<span className="text-rose-500">*</span>
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
                  placeholder={tx("auth:atLeast6Characters")}
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Xác nhận mật khẩu */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >{tx("auth:confirmPassword")}{" "}<span className="text-rose-500">*</span>
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
                  placeholder={tx("auth:reEnterPassword")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

            {/* Điều khoản */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#254AD7] border-slate-300 focus:ring-indigo-500/30"
                />
                <span className="text-xs text-slate-600 leading-tight">{tx("auth:iAgreeToThe")}{" "}
                  <span className="text-[#254AD7] font-semibold hover:underline">{tx("auth:termsOfService")}</span>{" "}{tx("auth:and")}{" "}
                  <span className="text-[#254AD7] font-semibold hover:underline">{tx("auth:privacyPolicy")}</span>
                </span>
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
                  <span>{tx("auth:creatingAccount")}</span>
                </>
              ) : (
                tx("auth:createAccount")
              )}
            </button>
          </form>
<div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">{tx("auth:alreadyHaveAProcureprimeAccount")}{" "}
              <Link
                to="/login"
                className="font-bold text-[#254AD7] hover:text-[#254AD7] hover:underline transition-colors ml-1"
              >{tx("auth:signIn2")}</Link>
            </p>
          </div></AuthScaffold>
  );
};

export default RegisterPage;
