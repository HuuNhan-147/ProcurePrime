import React from "react";
import { ArrowRight } from "lucide-react";
import { tx, useLocale } from "../../i18n";

export default function WorkspaceWelcome({ original }: { original: React.ReactNode }) {
  useLocale();
  return <div className="pw-welcome">
    <h3>{tx("workspace:welcomeTitle")}</h3>
    <p>{tx("workspace:welcomeSummary")}</p>
    <div className="pw-welcome-path" aria-label={tx("workspace:welcomePath")}>
      <span>{tx("marketing:requirements")}</span><ArrowRight size={14} aria-hidden="true" /><span>{tx("marketing:options")}</span><ArrowRight size={14} aria-hidden="true" /><span>{tx("marketing:quotation")}</span>
    </div>
    <details><summary>{tx("workspace:welcomeDetails")}</summary><p>{original}</p></details>
  </div>;
}
