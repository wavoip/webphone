import { useCallback, useEffect, useState } from "react";
import { useStore } from "zustand";
import { useMiddleware } from "@/middleware/react/hooks";
import type { Theme } from "@/providers/settings/settings";

type ThemeProviderProps = {
  children: React.ReactNode;
  root: HTMLDivElement;
  defaultTheme?: Theme;
  storageKey?: string;
};

/**
 * Owns DOM theme class application and persistence. Theme value is sourced
 * from the middleware store so `window.wavoip.theme.set(...)` flows through
 * here automatically.
 */
export function ThemeProvider({
  children,
  root,
  defaultTheme = "system",
  storageKey = "wavoip-webphone-ui-theme",
}: ThemeProviderProps) {
  const middleware = useMiddleware();
  const theme = useStore(middleware.store, (s) => s.theme);
  const setStoreTheme = useStore(middleware.store, (s) => s.setTheme);

  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (seeded) return;
    const stored = (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme;
    setStoreTheme(stored);
    setSeeded(true);
  }, [seeded, storageKey, defaultTheme, setStoreTheme]);

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
