import { type Accessor, createContext, createSignal, type JSX, useContext } from "solid-js";
import { delegateEventsToRoot } from "@/lib/event-delegation";

export const PIP_WINDOW_SIZE = { width: 320, height: 450 } as const;

/**
 * Onde a interface está desenhando agora.
 *
 * São duas superfícies e só uma ativa por vez: a da página — shadow root fechado no
 * widget, documento no PWA — e a janela do Picture-in-Picture, que ao abrir leva a tela
 * inteira para lá. Eram dois providers, e cada componente que precisa de destino para
 * portal tinha que perguntar aos dois qual valia; bastava um esquecer para o diálogo
 * abrir na página enquanto a chamada estava na janelinha.
 */
export type Surface = {
  /**
   * `floating` é o widget: tamanho fixo, arrastável, encostado num canto da página de
   * outra pessoa. `filled` é o PWA, que é dono da janela e a ocupa inteira.
   */
  layout: "floating" | "filled";
  /** O `root` da página. É nele que a classe de tema mora, com PiP aberto ou não. */
  root: HTMLDivElement;
  /** Destino de portal: o `root` da página, ou o quadro dentro da janela do PiP. */
  container: Accessor<HTMLElement>;
  /**
   * A subárvore de quem desenha agora. É onde o CSS mora, e é o que o Ark usa para
   * resolver portal e consulta de DOM.
   *
   * No widget o PiP clona as folhas daqui e só daqui: as do documento são da página do
   * cliente, e ler `cssRules` de uma folha de outra origem (a CDN do jsDelivr) lança
   * SecurityError e aborta a abertura da janela.
   */
  rootNode: Accessor<ShadowRoot | Document>;
  /** A janela de quem desenha agora. Área de transferência e medida de tela vêm daqui. */
  window: Accessor<Window>;
  isPiP: Accessor<boolean>;
  pipWindow: Accessor<Window | null>;
  openPip: () => void;
  closePip: () => void;
  togglePip: () => void;
  /** Só o `PipPortal` chama: é ele que desenha o quadro que carrega a classe de tema. */
  setPipContainer: (element: HTMLElement | null) => void;
};

const SurfaceContext = createContext<Surface>();

type Props = {
  layout: Surface["layout"];
  root: HTMLDivElement;
  rootNode: ShadowRoot | Document;
  children: JSX.Element;
};

async function createPipWindow(rootNode: ShadowRoot | Document): Promise<Window> {
  // @ts-expect-error
  const pip = (await window.documentPictureInPicture.requestWindow(PIP_WINDOW_SIZE)) as Window;
  pip.document.body.style.margin = "0";
  pip.document.body.style.overflow = "hidden";
  pip.document.body.style.backgroundColor = "#1a1b1e";

  // `importNode`, e não `cloneNode`: o nó nasce já no documento da janela nova, em vez de
  // ser adotado de um documento para o outro no meio do append.
  rootNode.querySelectorAll('style, link[rel="stylesheet"]').forEach((folha) => {
    pip.document.head.appendChild(pip.document.importNode(folha, true));
  });

  const ajustes = pip.document.createElement("style");
  ajustes.textContent = `
      html, body { height: 100vh; overflow: hidden; }
      [data-slot="call-type"] { justify-content: center; }
      @media (display-mode: picture-in-picture) {
        [data-slot="keyboard-grid"] { max-width: 210px; }
        [data-slot="keyboard-buttons"] > * { max-width: 56px; max-height: 56px; }
      }
    `;
  pip.document.head.appendChild(ajustes);

  return pip;
}

export function SurfaceProvider(props: Props) {
  // Acessor, e não valor: a janela some quando o usuário fecha o PiP, sem passar por aqui.
  const [pipWindow, setPipWindow] = createSignal<Window | null>(null);
  const [pipContainer, setPipContainer] = createSignal<HTMLElement | null>(null);

  const openPip = async () => {
    if (pipWindow()) return;
    if (!("documentPictureInPicture" in window)) {
      console.warn("Picture-in-Picture not supported in this browser.");
      return;
    }
    const nova = await createPipWindow(props.rootNode);
    delegateEventsToRoot(nova.document);
    nova.addEventListener("pagehide", () => {
      setPipContainer(null);
      setPipWindow(null);
    });
    setPipWindow(nova);
  };

  const closePip = () => pipWindow()?.close();

  const value: Surface = {
    layout: props.layout,
    root: props.root,
    // Preso à janela, e não só ao quadro: o quadro é registrado quando o portal monta e
    // some junto com ela, e um destino órfão levaria o portal para uma janela fechada.
    container: () => (pipWindow() ? (pipContainer() ?? props.root) : props.root),
    rootNode: () => pipWindow()?.document ?? props.rootNode,
    window: () => pipWindow() ?? globalThis.window,
    isPiP: () => pipWindow() !== null,
    pipWindow,
    openPip,
    closePip,
    togglePip: () => (pipWindow() ? closePip() : openPip()),
    setPipContainer,
  };

  return <SurfaceContext.Provider value={value}>{props.children}</SurfaceContext.Provider>;
}

export function useSurface(): Surface {
  const ctx = useContext(SurfaceContext);
  if (!ctx) throw new Error("useSurface precisa estar dentro de SurfaceProvider");
  return ctx;
}
