import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import LanguageToggle from "../ui/LanguageToggle";
import { tx, useLocale } from "../../i18n";

/** Presentation-only disclosure. Does not own Workspace/session state. */
export default function WorkspaceHeaderActions() {
  useLocale();
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const resize = () => { setWide(media.matches); if (root.current) root.current.open = media.matches; };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  return <nav aria-label={tx("workspace:workspaceLinks")} className="pw-header-actions">
    <LanguageToggle />
    <details ref={root} open={wide} className="pw-header-links" onKeyDown={(event) => {
      if (event.key === "Escape" && !wide) { event.stopPropagation(); root.current!.open = false; root.current?.querySelector("summary")?.focus(); }
    }}>
      <summary aria-label={tx("workspace:workspaceLinks")}><MoreHorizontal size={20} aria-hidden="true" /></summary>
      <div><Link to="/admin">{tx("workspace:admin")}</Link><Link to="/admin/policies">{tx("workspace:policies")}</Link></div>
    </details>
  </nav>;
}
