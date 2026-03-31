import {
  type Component,
  createContext,
  createSignal,
  type JSX,
  useContext,
} from "solid-js";
import en from "../locales/en";
import ko from "../locales/ko";

export type Locale = "en" | "ko";

type Translations = Record<string, string | Record<string, string>>;

const locales: Record<Locale, Translations> = { en, ko };

const STORAGE_KEY = "ktulu-locale";

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ko") return stored;
  const lang = navigator.language;
  if (lang.startsWith("ko")) return "ko";
  return "en";
}

function resolve(obj: Translations, key: string): string {
  const parts = key.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : key;
}

const I18nContext = createContext<{
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: () => Locale;
  setLocale: (l: Locale) => void;
}>();

export const I18nProvider: Component<{ children: JSX.Element }> = (props) => {
  const [locale, setLocaleSignal] = createSignal<Locale>(getInitialLocale());

  const setLocale = (l: Locale) => {
    setLocaleSignal(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    let str = resolve(locales[locale()], key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {props.children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
