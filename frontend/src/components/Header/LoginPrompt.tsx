import { tx, useLocale } from "../../i18n";
import React from "react";
import { X } from "lucide-react";

interface LoginPromptProps {
  show: boolean;
  onClose: () => void;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ show, onClose }) => {
  useLocale();
  if (!show) return null;

  return (
    <div className="absolute left-0 top-full mt-2 w-64 bg-yellow-100 text-yellow-800 text-sm px-3 py-2 rounded-md shadow-lg animate-fade-in">
      <div className="flex items-start">
        <span className="flex-1">{tx("navigation:signInForASmootherExperience")}</span>
        <button
          type="button"
          aria-label={tx("navigation:closeSignInReminder")}
          onClick={onClose}
          className="pp-popup-close ml-2 text-yellow-600 hover:text-yellow-800"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default LoginPrompt;
