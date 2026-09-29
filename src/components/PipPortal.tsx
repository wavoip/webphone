import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { PIP_WINDOW_SIZE } from "@/providers/PipProvider";

type Props = {
  pipWindow: Window;
  theme: string;
  children: JSX.Element;
};

/**
 * O `mount` aponta para o corpo de **outra janela**. O Solid cria os nós no documento do
 * destino, então o CSS que o `PipProvider` clonou para lá é o que vale aqui — o da
 * página não alcança.
 */
export function PipPortal(props: Props) {
  return (
    <Portal mount={props.pipWindow.document.body}>
      <div
        class={`wv:fixed wv:inset-0 wv:flex wv:flex-col wv:bg-background wv:overflow-hidden wv:m-0 wv:p-0 ${props.theme}`}
      >
        <div class="wv:h-full wv:mx-auto wv:flex wv:flex-col wv:px-8" style={{ width: `${PIP_WINDOW_SIZE.width}px` }}>
          {props.children}
        </div>
      </div>
    </Portal>
  );
}
