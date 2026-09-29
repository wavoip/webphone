import { createContext, type ReactNode, useContext } from "react";

/**
 * O que o shell entrega à interface. O widget monta dentro de um shadow root fechado na
 * página do cliente; o PWA monta na própria página. As duas coisas abaixo existem nos
 * dois, e são tudo que a interface precisa saber sobre onde está.
 */
export type Mount = {
  /**
   * `floating` é o widget: tamanho fixo, arrastável, encostado num canto da página de
   * outra pessoa. `filled` é o PWA, que é dono da janela e a ocupa inteira.
   */
  layout: "floating" | "filled";
  /** Onde a classe de tema mora e para onde os portais vão. */
  root: HTMLDivElement;
  /**
   * A subárvore em que esta instância vive: o shadow root no widget, o documento no PWA.
   * É onde o CSS mora, e é o que o Ark usa para resolver portal e consulta de DOM.
   *
   * No widget o PiP clona daqui e só daqui: as folhas do documento são da página do
   * cliente, e ler `cssRules` de uma folha de outra origem (a CDN do jsDelivr) lança
   * SecurityError e aborta a abertura da janela.
   */
  rootNode: ShadowRoot | Document;
};

export const MountContext = createContext<Mount | null>(null);

type Props = Mount & { children: ReactNode };

export function MountProvider({ children, layout, root, rootNode }: Props) {
  return <MountContext.Provider value={{ layout, root, rootNode }}>{children}</MountContext.Provider>;
}

export function useMount(): Mount {
  const ctx = useContext(MountContext);
  if (!ctx) throw new Error("useMount needs to be inside MountProvider");
  return ctx;
}
