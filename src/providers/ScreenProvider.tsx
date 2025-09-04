import { createContext, type ReactNode, useContext, useState } from "react";

type Screen = "call" | "keyboard" | "outgoing" | "incoming" | "login" | "closed" | "qrcode";

type PhoneContextType = {
  screen: Screen;
  setScreen: (s: Screen) => void;
  tokens: string[];
  setTokens: React.Dispatch<React.SetStateAction<string[]>>;
};

const PhoneContext = createContext<PhoneContextType | undefined>(undefined);

export function PhoneProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("keyboard");
  const [tokens, setTokens] = useState<string[]>([]);

  return <PhoneContext.Provider value={{ screen, setScreen, tokens, setTokens }}>{children}</PhoneContext.Provider>;
}

export function usePhone() {
  const ctx = useContext(PhoneContext);
  if (!ctx) throw new Error("usePhone deve ser usado dentro de <PhoneProvider>");
  return ctx;
}
