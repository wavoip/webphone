import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { PIP_WINDOW_SIZE } from "@/providers/PipProvider";

type Props = {
  pipWindow: Window;
  theme: string;
  children: ReactNode;
};

export function PipPortal({ pipWindow, theme, children }: Props) {
  return createPortal(
    <div
      className={`wv:fixed wv:inset-0 wv:flex wv:flex-col wv:bg-background wv:overflow-hidden wv:m-0 wv:p-0 ${theme}`}
    >
      <div
        className="wv:h-full wv:w-full wv:mx-auto wv:flex wv:flex-col wv:px-8"
        style={{ maxWidth: PIP_WINDOW_SIZE.width }}
      >
        {children}
      </div>
    </div>,
    pipWindow.document.body,
  );
}
