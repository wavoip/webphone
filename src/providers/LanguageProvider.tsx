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
 * Holds the active webphone language. Subscribes to locale changes via
 * `subscribeLocale` so any parent that mounts this provider re-renders on
 * `setLanguage`, cascading fresh `t()` results through the tree. We rely on
 * the parent's re-render (not a key/remount) so unrelated UI state like an
 * open Settings dialog is preserved across a language change.
 */
export function LanguageProvider({ children, initial }: Props) {
  useEffect(() => {
    // Ensure the runtime locale matches one of our shipped languages so the
    // Preferences tab has an active option on first render.
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
