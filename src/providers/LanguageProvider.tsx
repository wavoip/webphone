import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  setLanguage as applyLanguage,
  getLanguage,
  type Language,
  normalizeLanguage,
  subscribeLocale,
} from "@/lib/i18n";

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
 * Troca de língua re-renderiza, e não remonta com `key`: remontar perderia estado de
 * UI sem relação, como o diálogo de configurações aberto.
 */
export function LanguageProvider({ children, initial }: Props) {
  useEffect(() => {
    const resolved = normalizeLanguage(initial ?? getLanguage());
    if (resolved !== getLanguage()) applyLanguage(resolved);
  }, [initial]);

  const language = useSyncExternalStore(
    subscribeLocale,
    () => normalizeLanguage(getLanguage()),
    () => normalizeLanguage(initial),
  );

  const setLanguage = useCallback((next: Language) => {
    applyLanguage(next);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
