import { createContext, type ReactNode, useContext, useState } from "react";

type Screen = "call" | "keyboard" | "outgoing" | "incoming";

type ScreenContextType = {
  screen: Screen;
  setScreen: (s: Screen) => void;
};

const ScreenContext = createContext<ScreenContextType | undefined>(undefined);

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("keyboard");

  return <ScreenContext.Provider value={{ screen, setScreen }}>{children}</ScreenContext.Provider>;
}

export function useScreen() {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error("useScreen deve ser usado dentro de <ScreenProvider>");
  return ctx;
}
