import { tx, useLocale } from "../../i18n";
import React from "react";
import { Headphones } from "lucide-react";

const ContactInfo: React.FC = () => {
  useLocale();
  return (
    <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 py-1 px-2.5 rounded-lg border border-slate-800 bg-slate-800/40">
      <Headphones className="h-3.5 w-3.5 text-indigo-400" />
      <span>{tx("navigation:b2bTechnicalSupport247Sla")}{" "}<strong className="text-slate-200 font-mono">1900 2154</strong></span>
    </div>
  );
};

export default ContactInfo;
