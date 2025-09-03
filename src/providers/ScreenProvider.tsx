import { createContext, type ReactNode, useContext, useState } from "react";

type Screen = "call" | "keyboard" | "outgoing" | "login" | "closed";

type PhoneContextType = {
  screen: Screen;
  setScreen: (s: Screen) => void;
};

const PhoneContext = createContext<PhoneContextType | undefined>(undefined);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("keyboard");

  return <PhoneContext.Provider value={{ screen, setScreen }}>{children}</PhoneContext.Provider>;
}

export function usePhone() {
  const ctx = useContext(PhoneContext);
  if (!ctx) throw new Error("usePhone deve ser usado dentro de <PhoneProvider>");
  return ctx;
}
