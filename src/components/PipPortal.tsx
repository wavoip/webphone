import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { PIP_WINDOW_SIZE, useSurface } from "@/providers/SurfaceProvider";

type Props = {
  pipWindow: Window;
  theme: string;
  children: JSX.Element;
};

/**
 * O `mount` aponta para o corpo de **outra janela**. O Solid cria os nós no documento do
 * destino, então o CSS que a superfície clonou para lá é o que vale aqui — o da página
 * não alcança.
 *
 * O quadro de fora é o que carrega a classe de tema, e por isso é ele que a superfície
 * registra como destino de portal: tooltip e diálogo abertos com o PiP aberto precisam
 * nascer dentro dele, e não soltos no corpo da janela, onde não há tema.
 */
export function PipPortal(props: Props) {
  const surface = useSurface();

  return (
    <Portal mount={props.pipWindow.document.body}>
      <div
        ref={(el) => surface.setPipContainer(el)}
        class={`wv:fixed wv:inset-0 wv:flex wv:flex-col wv:bg-background wv:overflow-hidden wv:m-0 wv:p-0 ${props.theme}`}
      >
        <div class="wv:h-full wv:mx-auto wv:flex wv:flex-col wv:px-8" style={{ width: `${PIP_WINDOW_SIZE.width}px` }}>
          {props.children}
        </div>
      </div>
    </Portal>
  );
}
