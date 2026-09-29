import { createEffect, type JSX } from "solid-js";
import { useMiddleware, useStore } from "@/middleware/solid/context";
import type { Theme } from "@/providers/settings/settings";

type ThemeProviderProps = {
  children: JSX.Element;
  root: HTMLDivElement;
  storageKey?: string;
};

export function ThemeProvider(props: ThemeProviderProps) {
  const state = useStore();
  const storageKey = () => props.storageKey ?? "webphone-ui-theme";

  createEffect(() => {
    props.root.classList.remove("light", "dark");
    props.root.classList.add(state.theme === "system" ? systemTheme() : state.theme);
  });

  createEffect(() => {
    localStorage.setItem(storageKey(), state.theme);
  });

  return <>{props.children}</>;
}

function systemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(): { readonly theme: Theme; setTheme: (theme: Theme) => void } {
  const middleware = useMiddleware();
  const state = middleware.store.getState();
  return {
    get theme() {
      return state.theme;
    },
    setTheme: (next: Theme) => state.setTheme(next),
  };
}
