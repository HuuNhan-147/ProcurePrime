import { tx, uiText, useLocale } from "../../i18n";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ProcurePrimeWordmark from "../brand/ProcurePrimeWordmark";
import LanguageToggle from "./LanguageToggle";
import "./enterprise.css";

export default function AuthScaffold({ title, description, children, backTo = "/", error }: {
  title: string; description: string; children: React.ReactNode; backTo?: string; error?: string | null;
}) {
  useLocale();
  const formRegion = useRef<HTMLElement>(null);
  useEffect(() => { if (error) formRegion.current?.querySelector<HTMLElement>("[role=alert]")?.focus(); }, [error]);
  return <main className="pp-screen pp-auth">
    <header className="pp-auth-header"><ProcurePrimeWordmark /><LanguageToggle /><Link to={backTo}>{tx("auth:back")}</Link></header>
    <div className="pp-auth-layout">
      <aside className="pp-auth-story"><p>{tx("auth:procureprimeAccount")}</p><h2>{tx("auth:aPlaceForProcurementDecisions")}</h2><p>{tx("auth:continueWorkingWithYourDeviceCatalogAi")}</p><ol><li>{tx("auth:clarifyRequirements")}</li><li>{tx("auth:reviewDevices")}</li><li>{tx("auth:manageRecords")}</li></ol></aside>
      <section ref={formRegion} className="pp-auth-form" aria-labelledby="pp-auth-title"><h1 id="pp-auth-title">{uiText(title)}</h1><p className="pp-auth-description">{uiText(description)}</p>{uiText(children)}</section>
    </div>
  </main>;
}
