import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import { useMiddleware } from "@/middleware/react/hooks";

type PipContextType = {
  pipWindow: Window | null;
  isPiP: boolean;
  togglePip: () => void;
  openPip: () => void;
  closePip: () => void;
};

const PipContext = createContext<PipContextType | undefined>(undefined);

type Props = {
  shadowRoot: ShadowRoot;
  children: ReactNode;
};

async function createNewPipWindow(shadowRoot: ShadowRoot): Promise<Window> {
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
      @media (display-mode: picture-in-picture) {
        [data-slot="keyboard-grid"] { max-width: 210px; }
        [data-slot="keyboard-buttons"] > * { max-width: 56px; max-height: 56px; }
      }
    `;
  newPipWindow.document.head.appendChild(pipStyle);

  return newPipWindow;
}

export function PipProvider({ shadowRoot, children }: Props) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const isPiP = !!pipWindow;
  const middleware = useMiddleware();
  const screen = useStore(middleware.store, (s) => s.screen);
  const prevScreenRef = useRef(screen);

  const openPip = useCallback(async () => {
    if (pipWindow) return;
    if (!("documentPictureInPicture" in window)) {
      console.warn("Picture-in-Picture not supported in this browser.");
      return;
    }
    const newPipWindow = await createNewPipWindow(shadowRoot);
    newPipWindow.addEventListener("pagehide", () => {
      setPipWindow(null);
    });
    setPipWindow(newPipWindow);
  }, [pipWindow, shadowRoot]);

  const closePip = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
    }
  }, [pipWindow]);

  const togglePip = useCallback(() => {
    if (pipWindow) closePip();
    else openPip();
  }, [pipWindow, openPip, closePip]);

  useEffect(() => {
    if (screen === "keyboard" && prevScreenRef.current !== "keyboard" && pipWindow) {
      pipWindow.close();
    }
    prevScreenRef.current = screen;
  }, [screen, pipWindow]);

  return (
    <PipContext.Provider value={{ pipWindow, isPiP, togglePip, openPip, closePip }}>{children}</PipContext.Provider>
  );
}

export function usePip() {
  const ctx = useContext(PipContext);
  if (!ctx) throw new Error("usePip deve ser usado dentro de PipProvider");
  return ctx;
}
