import { mergeToAPI } from "@/lib/webphone-api/api";
import { bus } from "@/lib/webphone-api/bus";
import type { Theme } from "@/providers/settings/settings";

type ThemeAdapterConfig = {
  root: HTMLElement;
  defaultTheme?: Theme;
  storageKey?: string;
};

const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

function resolveAppliedClass(theme: Theme): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
  }
  return theme;
}

function applyToRoot(root: HTMLElement, theme: Theme): void {
  root.classList.remove("light", "dark");
  root.classList.add(resolveAppliedClass(theme));
}

export function bootThemeAdapter({
  root,
  defaultTheme = "system",
  storageKey = "wavoip-webphone-ui-theme",
}: ThemeAdapterConfig): () => void {
  let current: Theme = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  applyToRoot(root, current);

  const setTheme = (next: Theme) => {
    current = next;
    localStorage.setItem(storageKey, next);
    applyToRoot(root, next);
    bus.emit("theme.changed", next);
    pushToLegacyFacade();
  };

  const pushToLegacyFacade = () => {
    mergeToAPI({
      theme: {
        value: current,
        set: setTheme,
        setTheme,
      },
    });
  };

  const unsubQuery = bus.registerQuery("theme.value", () => current);

  const unsubHandle = bus.handle("theme.set", async ({ theme }) => {
    setTheme(theme);
  });

  const media = window.matchMedia(SYSTEM_QUERY);
  const onSystemChange = () => {
    if (current === "system") {
      applyToRoot(root, "system");
      bus.emit("theme.changed", "system");
    }
  };
  media.addEventListener("change", onSystemChange);

  pushToLegacyFacade();
  bus.emit("theme.changed", current);

  return () => {
    media.removeEventListener("change", onSystemChange);
    unsubHandle();
    unsubQuery();
  };
}
