import { type Accessor, createContext, createEffect, createSignal, type JSX, useContext } from "solid-js";
import { useStore } from "@/middleware/solid/context";

type PipContextType = {
  /** Acessor, e não valor: a janela some quando o usuário fecha o PiP, sem passar por aqui. */
  pipWindow: Accessor<Window | null>;
  isPiP: Accessor<boolean>;
  togglePip: () => void;
  openPip: () => void;
  closePip: () => void;
};

export const PipContext = createContext<PipContextType>();

export const PIP_WINDOW_SIZE = { width: 320, height: 450 } as const;

type Props = {
  rootNode: ParentNode;
  children: JSX.Element;
};

async function createNewPipWindow(rootNode: ParentNode): Promise<Window> {
  // @ts-expect-error
  const newPipWindow = await window.documentPictureInPicture.requestWindow(PIP_WINDOW_SIZE);
  newPipWindow.document.body.style.margin = "0";
  newPipWindow.document.body.style.overflow = "hidden";
  newPipWindow.document.body.style.backgroundColor = "#1a1b1e";

  // Quem escolhe a subárvore é o shell — ver `Mount.rootNode`, que explica por que o
  // widget não pode clonar as folhas do documento.
  rootNode.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
    newPipWindow.document.head.appendChild(el.cloneNode(true));
  });

  const pipStyle = document.createElement("style");
  pipStyle.textContent = `
      html, body { height: 100vh; overflow: hidden; }
      [data-slot="call-type"] { justify-content: center; }
      @media (display-mode: picture-in-picture) {
        [data-slot="keyboard-grid"] { max-width: 210px; }
        [data-slot="keyboard-buttons"] > * { max-width: 56px; max-height: 56px; }
      }
    `;
  newPipWindow.document.head.appendChild(pipStyle);

  return newPipWindow;
}

export function PipProvider(props: Props) {
  const [pipWindow, setPipWindow] = createSignal<Window | null>(null);
  const isPiP = () => pipWindow() !== null;
  const state = useStore();
  let telaAnterior = state.screen;

  const openPip = async () => {
    if (pipWindow()) return;
    if (!("documentPictureInPicture" in window)) {
      console.warn("Picture-in-Picture not supported in this browser.");
      return;
    }
    const newPipWindow = await createNewPipWindow(props.rootNode);
    newPipWindow.addEventListener("pagehide", () => setPipWindow(null));
    setPipWindow(newPipWindow);
  };

  const closePip = () => pipWindow()?.close();

  const togglePip = () => (pipWindow() ? closePip() : openPip());

  // Voltar ao teclado fecha o PiP: a janelinha existe para acompanhar uma chamada.
  createEffect(() => {
    const tela = state.screen;
    if (tela === "keyboard" && telaAnterior !== "keyboard") pipWindow()?.close();
    telaAnterior = tela;
  });

  return (
    <PipContext.Provider value={{ pipWindow, isPiP, togglePip, openPip, closePip }}>
      {props.children}
    </PipContext.Provider>
  );
}

export function usePip() {
  const ctx = useContext(PipContext);
  if (!ctx) throw new Error("usePip deve ser usado dentro de PipProvider");
  return ctx;
}
