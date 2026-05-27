import a18nGlobal from "a18n";

export type Language = "en" | "pt-BR" | "es";

export type TranslationKey = "Device restricted" | "Restriction lifted" | "Restricted";

type LocaleResource = Record<TranslationKey, string>;

const a18n = a18nGlobal.getA18n("wavoip-webphone");

const ptBR: LocaleResource = {
  "Device restricted": "Dispositivo restrito",
  "Restriction lifted": "Restrição removida",
  Restricted: "Restrito",
};

const es: LocaleResource = {
  "Device restricted": "Dispositivo restringido",
  "Restriction lifted": "Restricción levantada",
  Restricted: "Restringido",
};

a18n.addLocaleResource("pt-BR", ptBR);
a18n.addLocaleResource("es", es);

export const t = (key: TranslationKey): string => a18n(key);

export const setLanguage = (lang: Language): void => a18n.setLocale(lang);

export const getLanguage = (): string => a18n.getLocale();
