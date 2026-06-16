import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { setLanguage as applyLanguage, getLanguage, type Language } from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type Props = {
  children: ReactNode;
  initial?: Language;
};

/**
 * Holds the active webphone language. The children are keyed by language so
 * a change forces a remount, which is the only way to get `t()` calls scattered
 * across the tree to re-evaluate after `a18n.setLocale`.
 */
export function LanguageProvider({ children, initial }: Props) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (initial) {
      applyLanguage(initial);
      return initial;
    }
    return (getLanguage() as Language) ?? "en";
  });

  const setLanguage = useCallback((next: Language) => {
    applyLanguage(next);
    setLanguageState(next);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      <div key={language} className="wv:contents">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
