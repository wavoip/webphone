import { createContext, createSignal, type JSX, onCleanup, onMount, useContext } from "solid-js";
import {
  setLanguage as applyLanguage,
  getLanguage,
  type Language,
  normalizeLanguage,
  subscribeLocale,
} from "@/lib/i18n";

type LanguageContextValue = {
  readonly language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>();

type Props = {
  children: JSX.Element;
  initial?: Language;
};

/**
 * O `i18n` é um módulo, e não um componente: quem troca o idioma pode ser a tela de
 * preferências ou o integrador. O `subscribeLocale` alimenta o sinal direto, venha de
 * onde vier.
 */
export function LanguageProvider(props: Props) {
  const [language, setLanguageSignal] = createSignal(normalizeLanguage(props.initial ?? getLanguage()));

  onMount(() => {
    const resolved = normalizeLanguage(props.initial ?? getLanguage());
    if (resolved !== getLanguage()) applyLanguage(resolved);
  });

  onCleanup(subscribeLocale(() => setLanguageSignal(normalizeLanguage(getLanguage()))));

  const value: LanguageContextValue = {
    get language() {
      return language();
    },
    setLanguage: applyLanguage,
  };

  return <LanguageContext.Provider value={value}>{props.children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
