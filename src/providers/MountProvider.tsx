import { createContext, type ReactNode, useContext } from "react";

/**
 * O que o shell entrega à interface. O widget monta dentro de um shadow root fechado na
 * página do cliente; o PWA monta na própria página. As duas coisas abaixo existem nos
 * dois, e são tudo que a interface precisa saber sobre onde está.
 */
export type Mount = {
  /** Onde a classe de tema mora e para onde os portais vão. */
  root: HTMLDivElement;
  /**
   * De onde o PiP clona o CSS. No widget é o shadow root, e só ele: as folhas do
   * documento são da página do cliente, e ler `cssRules` de uma folha de outra origem
   * (a CDN do jsDelivr) lança SecurityError e aborta a abertura do PiP. No PWA a
   * página é nossa, e a fonte é o `document.head`.
   */
  styleSource: ParentNode;
};

export const MountContext = createContext<Mount | null>(null);

type Props = Mount & { children: ReactNode };

export function MountProvider({ children, root, styleSource }: Props) {
  return <MountContext.Provider value={{ root, styleSource }}>{children}</MountContext.Provider>;
}

export function useMount(): Mount {
  const ctx = useContext(MountContext);
  if (!ctx) throw new Error("useMount needs to be inside MountProvider");
  return ctx;
}
