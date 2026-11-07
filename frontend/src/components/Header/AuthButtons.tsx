import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ShieldCheck, Building } from "lucide-react";
import UserProfile from "./UserProfile";
import LoginPrompt from "./LoginPrompt";
import { User as UserType } from "../../types/User";

interface AuthButtonsProps {
  user: UserType | null;
  token: string | null;
  onAutoLogout: (message: string) => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({
  user,
  token,
  onAutoLogout,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const [updatedUser, setUpdatedUser] = useState<UserType | null>(user);

  const handleLogout = () => {
    if (window.confirm("Xác nhận đăng xuất khỏi hệ thống Mua sắm Doanh nghiệp ProcurePrime?")) {
      onAutoLogout("Bạn đã đăng xuất an toàn!");
    }
  };

  const handleToggleProfile = () => {
    setShowProfile(!showProfile);
  };

  useEffect(() => {
    setUpdatedUser(user);
  }, [user]);

  useEffect(() => {
    if (user) return;

    const interval = setInterval(() => {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  if (user) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3 relative">
        <button
          onClick={handleToggleProfile}
          className="text-xs text-slate-200 hover:text-white font-medium transition flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800"
          title="Hồ sơ Pháp nhân Doanh nghiệp & Hạn mức Mua sắm"
        >
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs font-mono">
            {updatedUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <span className="block font-semibold leading-tight text-white max-w-[120px] truncate">
              {updatedUser?.name}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono block">
              Doanh Nghiệp
            </span>
          </div>
        </button>

        {user.isAdmin && (
          <Link
            to="/admin"
            className="flex items-center text-xs text-amber-400 hover:text-amber-300 font-medium transition py-1 px-2 rounded bg-amber-950/40 border border-amber-500/30"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-amber-400" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center text-xs text-slate-400 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-slate-800"
          title="Đăng xuất khỏi phiên làm việc"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <UserProfile
          token={token}
          showProfile={showProfile}
          onToggleProfile={handleToggleProfile}
          onAutoLogout={onAutoLogout}
          onUpdateUser={(newUser) => setUpdatedUser(newUser)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Link
        to="/login"
        className="flex items-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition px-3 py-1.5 rounded-lg shadow-sm"
      >
        <Building className="h-3.5 w-3.5 mr-1.5" />
        <span>Đăng Nhập B2B</span>
      </Link>
      <LoginPrompt
        show={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default AuthButtons;
