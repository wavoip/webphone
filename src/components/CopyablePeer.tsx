import { createSignal, onCleanup, Show } from "solid-js";
import MarqueeText from "@/components/MarqueeText";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSurface } from "@/providers/SurfaceProvider";

type Props = {
  displayName: string | null | undefined;
  phone: string;
  class?: string;
  marqueeSpeed?: number;
};

const FEEDBACK_DURATION_MS = 1500;

/**
 * O clique copia o *número*, nunca o displayName. O tooltip flutua para escapar do
 * recorte dos ancestrais do cabeçalho da chamada.
 */
export function CopyablePeer(props: Props) {
  const [copied, setCopied] = createSignal(false);
  const surface = useSurface();
  let timer: ReturnType<typeof setTimeout> | null = null;

  onCleanup(() => {
    if (timer) clearTimeout(timer);
  });

  const label = () => props.displayName?.trim() || props.phone;

  const handleClick = async () => {
    try {
      await surface.window().navigator.clipboard.writeText(props.phone);
    } catch (e) {
      console.error(e);
      return;
    }
    setCopied(true);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setCopied(false), FEEDBACK_DURATION_MS);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    void handleClick();
  };

  return (
    <Show
      when={props.phone}
      fallback={
        <MarqueeText speed={props.marqueeSpeed ?? 10} class={props.class}>
          {label()}
        </MarqueeText>
      }
    >
      <Tooltip open={copied()} positioning={{ placement: "top", gutter: 4 }}>
        {/* `asChild` no Solid é função, e não booleano: o Ark passa os props do gatilho
            para quem vai desenhar. */}
        <TooltipTrigger
          asChild={(triggerProps) => (
            // biome-ignore lint/a11y/useSemanticElements: o MarqueeText renderiza <div>, que é HTML inválido dentro de <button>; span + role=button + teclado mantêm a semântica.
            <span
              {...triggerProps()}
              role="button"
              tabIndex={0}
              aria-label="Copiar telefone"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              class="wv:cursor-pointer wv:select-none wv:block wv:w-full"
            >
              <MarqueeText speed={props.marqueeSpeed ?? 10} class={props.class}>
                {label()}
              </MarqueeText>
            </span>
          )}
        />
        <TooltipContent container={surface.container()} class="wv:bg-green-600 wv:text-white">
          Copiado
        </TooltipContent>
      </Tooltip>
    </Show>
  );
}
