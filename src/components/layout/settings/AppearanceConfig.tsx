import { DesktopIcon, MoonIcon, SunIcon, TranslateIcon } from "@phosphor-icons/react";
import { type Language, t } from "@/lib/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import type { Theme } from "@/providers/settings/settings";
import { useTheme } from "@/providers/ThemeProvider";
import { useWavoip } from "@/providers/WavoipProvider";

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon className="wv:size-4" weight="duotone" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="wv:size-4" weight="duotone" /> },
  { value: "system", label: "System", icon: <DesktopIcon className="wv:size-4" weight="duotone" /> },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

export function AppearanceConfig() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { wavoip } = useWavoip();

  const handleLanguage = (next: Language) => {
    setLanguage(next);
    wavoip?.setLanguage(next);
  };

  return (
    <div className="wv:flex wv:flex-col wv:gap-6">
      <Section
        title={t("Theme")}
        icon={<SunIcon className="wv:size-4" weight="duotone" />}
        description={t("Pick light, dark, or follow the system")}
      >
        <div className="wv:grid wv:grid-cols-3 wv:gap-2">
          {THEMES.map((opt) => (
            <OptionButton
              key={opt.value}
              active={theme === opt.value}
              onClick={() => setTheme(opt.value)}
              aria-pressed={theme === opt.value}
            >
              {opt.icon}
              <span>{t(opt.label as "Light" | "Dark" | "System")}</span>
            </OptionButton>
          ))}
        </div>
      </Section>

      <Section
        title={t("Language")}
        icon={<TranslateIcon className="wv:size-4" weight="duotone" />}
        description={t("Switch the webphone interface language")}
      >
        <div className="wv:grid wv:grid-cols-1 wv:gap-2 wv:sm:grid-cols-3">
          {LANGUAGES.map((opt) => (
            <OptionButton
              key={opt.value}
              active={language === opt.value}
              onClick={() => handleLanguage(opt.value)}
              aria-pressed={language === opt.value}
            >
              <span className="wv:font-mono wv:text-[10px] wv:uppercase wv:text-muted-foreground">{opt.value}</span>
              <span>{opt.label}</span>
            </OptionButton>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="wv:flex wv:flex-col wv:gap-3 wv:rounded-xl wv:border wv:border-border/60 wv:bg-card wv:p-4">
      <div className="wv:flex wv:flex-col wv:gap-1">
        <h3 className="wv:flex wv:items-center wv:gap-1.5 wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
          {icon}
          {title}
        </h3>
        <p className="wv:text-xs wv:text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function OptionButton({
  active,
  children,
  ...props
}: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-active={active}
      className="wv:flex wv:flex-col wv:items-center wv:justify-center wv:gap-1 wv:rounded-lg wv:border wv:border-border/60 wv:bg-background wv:px-3 wv:py-2 wv:text-xs wv:text-foreground wv:transition-colors wv:hover:bg-accent wv:hover:cursor-pointer wv:focus-visible:outline-none wv:focus-visible:ring-2 wv:focus-visible:ring-ring wv:data-[active=true]:border-primary wv:data-[active=true]:bg-primary/10 wv:data-[active=true]:text-primary"
      {...props}
    >
      {children}
    </button>
  );
}
