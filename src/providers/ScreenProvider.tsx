import { createContext, type ReactNode, useContext, useState } from "react";
import type { ACLScreen } from "@/lib/webphone-api/events";

type ScreenContextType = {
  screen: ACLScreen;
  setScreen: (s: ACLScreen) => void;
};

const ScreenContext = createContext<ScreenContextType | undefined>(undefined);

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ACLScreen>("keyboard");

  return <ScreenContext.Provider value={{ screen, setScreen }}>{children}</ScreenContext.Provider>;
}

export function useScreen() {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error("useScreen deve ser usado dentro de <ScreenProvider>");
  return ctx;
}
