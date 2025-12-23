import { createContext, type ReactNode, useContext } from "react";

type ShadowRootContextType = { shadowRoot: ShadowRoot; root: HTMLDivElement };
export const ShadowRootContext = createContext<ShadowRootContextType | null>(null);

type Props = {
  children: ReactNode;
  shadowRoot: ShadowRoot;
  root: HTMLDivElement;
};

export function ShadowProvider({ children, shadowRoot, root }: Props) {
  return <ShadowRootContext.Provider value={{ shadowRoot, root }}>{children}</ShadowRootContext.Provider>;
}

export function useShadowRoot() {
  const ctx = useContext(ShadowRootContext);
  if (!ctx) throw new Error("useShadow needs to be inside ShadowProvider");
  return ctx as ShadowRootContextType;
}
