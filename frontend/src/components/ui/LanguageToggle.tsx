import React from "react";
import { i18n, tx, useLocale, type UILanguage } from "../../i18n";

export default function LanguageToggle() {
  useLocale();
  const selected = i18n.resolvedLanguage === "en" ? "en" : "vi";
  return <div className="pp-language" role="group" aria-label={tx("common:language.choose")}>
    {(["vi", "en"] as UILanguage[]).map((language) => <button key={language}
      type="button" lang={language} aria-label={language === "vi" ? "Tiếng Việt" : "English"}
      aria-pressed={selected === language} onClick={() => { void i18n.changeLanguage(language); }}>
      {language === "vi" ? "VI" : "EN"}
    </button>)}
  </div>;
}
