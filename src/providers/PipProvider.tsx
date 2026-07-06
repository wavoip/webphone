import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

export type PipContent = "keyboard" | "call";

type PipContextType = {
  pipWindow: Window | null;
  togglePip: () => void;
  pipContent: PipContent;
  setPipContent: (content: PipContent) => void;
};

const PipContext = createContext<PipContextType | undefined>(undefined);


type Props = {
  shadowRoot: ShadowRoot;
  children: ReactNode;
};

export function PipProvider({ shadowRoot, children }: Props) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContent, setPipContent] = useState<PipContent>("keyboard");

  const togglePip = useCallback(async () => {




    if (pipWindow) {
      pipWindow.close();
      return;
    }
    if (!("documentPictureInPicture" in window)) {
      console.warn("Picture-in-Picture not supported in this browser.");
      return;
    }
    // @ts-expect-error
    const newPipWindow = await window.documentPictureInPicture.requestWindow({
      width: 320,
      height: 450,
    });
    newPipWindow.document.body.style.margin = "0";
    newPipWindow.document.body.style.overflow = "hidden";
    newPipWindow.document.body.style.backgroundColor = "#1a1b1e";

    [...document.styleSheets].forEach((styleSheet) => {
      if (styleSheet.cssRules) {
        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
        const style = document.createElement("style");
        style.textContent = cssRules;
        newPipWindow.document.head.appendChild(style);
      }
    });

    shadowRoot.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      newPipWindow.document.head.appendChild(el.cloneNode(true));
    });

    const pipStyle = document.createElement("style");
    pipStyle.textContent = `
        html, body { height: 100vh; overflow: hidden; }
        [data-slot="call-type"] { justify-content: center; }
      `;
    newPipWindow.document.head.appendChild(pipStyle);

    newPipWindow.addEventListener("pagehide", () => {
      setPipWindow(null);
    });

    setPipWindow(newPipWindow);
  }, [pipWindow, shadowRoot]);

  return <PipContext.Provider value={{ pipWindow, togglePip, pipContent, setPipContent }}>{children}</PipContext.Provider>;
}

export function usePip() {
  const ctx = useContext(PipContext);
  if (!ctx) throw new Error("usePip deve ser usado dentro de PipProvider");
  return ctx;
}
