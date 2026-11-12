import React from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import resources from "./resources";
import "./language.css";

export type UILanguage = "vi" | "en";
export const languageStorageKey = "procureprime.ui.language";
const validLanguage = (value: unknown): value is UILanguage => value === "vi" || value === "en";
let initialLanguage: UILanguage = "vi";
try {
  const saved = localStorage.getItem(languageStorageKey);
  if (validLanguage(saved)) initialLanguage = saved;
} catch { /* Storage may be unavailable; Vietnamese remains the default. */ }

const syncLanguage = (language: string) => {
  const safeLanguage = validLanguage(language) ? language : "vi";
  document.documentElement.lang = safeLanguage;
  document.title = safeLanguage === "vi" ? "ProcurePrime — Mua sắm doanh nghiệp" : "ProcurePrime — Enterprise procurement";
  try { localStorage.setItem(languageStorageKey, safeLanguage); } catch { /* Non-essential preference. */ }
};

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  supportedLngs: ["vi", "en"],
  fallbackLng: "vi",
  defaultNS: "common",
  ns: Object.keys(resources.vi),
  initAsync: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false, bindI18n: "languageChanged" },
});
i18n.on("languageChanged", syncLanguage);
syncLanguage(initialLanguage);

/** Subscribe only at component boundaries. Stable helpers never become effect dependencies. */
export function useLocale() {
  useTranslation("common");
  return locale();
}
export const locale = () => i18n.resolvedLanguage === "en" ? "en-GB" : "vi-VN";
const messagePrefix = "\uE000procureprime-ui:";

/** Only frontend-owned notifications carry this marker. API/user/AI text stays verbatim. */
export function uiMessage(key: string, values?: Record<string, unknown>): string {
  return messagePrefix + JSON.stringify([key, values]);
}
export function uiText<T>(value: T): T | string {
  if (typeof value !== "string" || !value.startsWith(messagePrefix)) return value;
  try {
    const [key, values] = JSON.parse(value.slice(messagePrefix.length));
    if (typeof key !== "string" || !i18n.exists(key)) return value;
    return tx(key, values);
  } catch { return value; }
}
export function tx(key: string, values?: Record<string, unknown>): string {
  const resolved = Object.fromEntries(Object.entries(values || {}).map(([name, value]) => [name, uiText(value)]));
  return i18n.t(key, resolved) as string;
}
export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale(), options).format(value);
}
export function formatVND(value: number) {
  return new Intl.NumberFormat(locale(), { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
export function formatDate(value: Date | string | number, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale(), options).format(value instanceof Date ? value : new Date(value));
}

function LocalizedNotification({ message }: { message: string }) {
  useLocale();
  return <>{uiText(message)}</>;
}
export function localizedNode(key: string, values?: Record<string, unknown>) {
  return <LocalizedNotification message={uiMessage(key, values)} />;
}
/** Render a frontend-owned marker or verbatim API message without changing its source value. */
export function localizedMessage(message: string) {
  return <LocalizedNotification message={message} />;
}

/** Preserve SweetAlert's result, callbacks and lifecycle; update only its text fields. */
export function localizedSwal(swal: any, ...args: any[]) {
  const translated = () => args.map((argument) => typeof argument === "object" && argument !== null
    ? Object.fromEntries(Object.entries(argument).map(([name, value]) => [name, typeof value === "string" ? uiText(value) : value]))
    : uiText(argument));
  const result = swal.fire(...translated());
  const update = () => {
    if (!swal.isVisible()) return;
    const values = translated();
    const options = typeof values[0] === "object" ? values[0] : { title: values[0], text: values[1] };
    const textFields = ["title", "text", "confirmButtonText", "cancelButtonText", "denyButtonText", "closeButtonAriaLabel"];
    swal.update(Object.fromEntries(Object.entries(options).filter(([key]) => textFields.includes(key))));
  };
  i18n.on("languageChanged", update);
  return result.finally(() => i18n.off("languageChanged", update));
}
export { i18n };
