import { createContext, useContext, useEffect, useState } from "react";
import { buildAPI } from "@/lib/webphone-api";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  root: HTMLDivElement;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  root,
  defaultTheme = "system",
  storageKey = "wavoip-webphone-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);

  useEffect(() => {
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, root]);

  const handleSetTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme);
    setTheme(theme);
  };

  buildAPI({
    theme: {
      setTheme: (...args) => handleSetTheme(...args),
    },
  });

  return (
    <ThemeProviderContext.Provider
      {...props}
      value={{
        theme,
        setTheme: handleSetTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
