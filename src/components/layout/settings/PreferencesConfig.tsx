import { type ComponentProps, For, type JSX } from "solid-js";
import { Desktop, Moon, Sun, Translate } from "@/components/icons";
import { type Language, t } from "@/lib/i18n";
import { useLanguage } from "@/providers/LanguageProvider";
import type { Theme } from "@/providers/settings/settings";
import { useTheme } from "@/providers/ThemeProvider";

const THEMES: { value: Theme; label: string; icon: () => JSX.Element }[] = [
  { value: "light", label: "Light", icon: () => <Sun class="wv:size-4" weight="duotone" /> },
  { value: "dark", label: "Dark", icon: () => <Moon class="wv:size-4" weight="duotone" /> },
  { value: "system", label: "System", icon: () => <Desktop class="wv:size-4" weight="duotone" /> },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

export function PreferencesConfig() {
  const tema = useTheme();
  const idioma = useLanguage();

  return (
    <div class="wv:flex wv:flex-col wv:gap-6">
      <Section
        title={t("Theme")}
        icon={<Sun class="wv:size-4" weight="duotone" />}
        description={t("Pick light, dark, or follow the system")}
      >
        <div class="wv:grid wv:grid-cols-3 wv:gap-2">
          <For each={THEMES}>
            {(opt) => (
              <OptionButton
                active={tema.theme === opt.value}
                onClick={() => tema.setTheme(opt.value)}
                aria-pressed={tema.theme === opt.value}
              >
                {opt.icon()}
                <span>{t(opt.label as "Light" | "Dark" | "System")}</span>
              </OptionButton>
            )}
          </For>
        </div>
      </Section>

      <Section
        title={t("Language")}
        icon={<Translate class="wv:size-4" weight="duotone" />}
        description={t("Switch the webphone interface language")}
      >
        <div class="wv:grid wv:grid-cols-1 wv:gap-2 wv:sm:grid-cols-3">
          <For each={LANGUAGES}>
            {(opt) => (
              <OptionButton
                active={idioma.language === opt.value}
                onClick={() => idioma.setLanguage(opt.value)}
                aria-pressed={idioma.language === opt.value}
              >
                <span class="wv:font-mono wv:text-[12px] wv:uppercase wv:text-muted-foreground">{opt.value}</span>
                <span>{opt.label}</span>
              </OptionButton>
            )}
          </For>
        </div>
      </Section>
    </div>
  );
}

function Section(props: { title: string; description: string; icon: JSX.Element; children: JSX.Element }) {
  return (
    <section class="wv:flex wv:flex-col wv:gap-3 wv:rounded-xl wv:border wv:border-border/60 wv:bg-card wv:p-4">
      <div class="wv:flex wv:flex-col wv:gap-1">
        <h3 class="wv:flex wv:items-center wv:gap-1.5 wv:text-xs wv:font-semibold wv:uppercase wv:tracking-wide wv:text-muted-foreground">
          {props.icon}
          {props.title}
        </h3>
        <p class="wv:text-xs wv:text-muted-foreground">{props.description}</p>
      </div>
      {props.children}
    </section>
  );
}

function OptionButton(props: { active: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-active={props.active}
      class="wv:flex wv:flex-col wv:items-center wv:justify-center wv:gap-1 wv:rounded-lg wv:border wv:border-border/60 wv:bg-background wv:px-3 wv:py-2 wv:text-xs wv:text-foreground wv:transition-colors wv:hover:bg-accent wv:hover:cursor-pointer wv:focus-visible:outline-none wv:focus-visible:ring-2 wv:focus-visible:ring-ring wv:data-[active=true]:border-primary wv:data-[active=true]:bg-primary/10 wv:data-[active=true]:text-primary"
      {...props}
    >
      {props.children}
    </button>
  );
}
