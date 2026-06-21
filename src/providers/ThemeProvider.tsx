import { useCallback, useEffect } from "react";
import { useStore } from "zustand";
import { useMiddleware } from "@/middleware/react/hooks";
import type { Theme } from "@/providers/settings/settings";

type ThemeProviderProps = {
  children: React.ReactNode;
  root: HTMLDivElement;
  storageKey?: string;
};

/**
 * Owns DOM theme class application and persistence. Theme value is sourced
 * from the middleware store (seeded at bootstrap) so `window.wavoip.theme.set`
 * flows through here automatically. Initial seeding lives in `bootstrapStore`.
 */
export function ThemeProvider({ children, root, storageKey = "webphone-ui-theme" }: ThemeProviderProps) {
  const middleware = useMiddleware();
  const theme = useStore(middleware.store, (s) => s.theme);

  useEffect(() => {
    root.classList.remove("light", "dark");
    const applied = theme === "system" ? systemTheme() : theme;
    root.classList.add(applied);
  }, [theme, root]);

  useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  return <>{children}</>;
}

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Reads/writes theme via the middleware store. Kept as a hook for components
 * that still call it directly (e.g. WidgetProvider).
 */
export const useTheme = (): { theme: Theme; setTheme: (theme: Theme) => void } => {
  const middleware = useMiddleware();
  const theme = useStore(middleware.store, (s) => s.theme);
  const setStoreTheme = useStore(middleware.store, (s) => s.setTheme);
  const setTheme = useCallback((next: Theme) => setStoreTheme(next), [setStoreTheme]);
  return { theme, setTheme };
};
