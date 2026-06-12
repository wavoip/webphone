import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  pipWindow: Window;
  theme: string;
  children: ReactNode;
};

export function PipPortal({ pipWindow, theme, children }: Props) {
  return createPortal(
    <div
      className={`wv:fixed wv:inset-0 wv:flex wv:flex-col wv:items-center wv:justify-center wv:bg-background wv:overflow-hidden wv:m-0 wv:p-0 ${theme}`}
    >
      <div className="wv:h-full wv:w-full wv:flex wv:flex-col">{children}</div>
    </div>,
    pipWindow.document.body,
  );
}
