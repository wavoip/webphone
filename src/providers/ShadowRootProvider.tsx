import { createContext, useContext } from "react";

type ShadowRootContextType = ShadowRoot | null;
export const ShadowRootContext = createContext<ShadowRootContextType>(null);

export function useShadowRoot(): ShadowRoot | null {
  return useContext(ShadowRootContext);
}
