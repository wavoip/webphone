import { createSignal, type JSX, onCleanup, useContext } from "solid-js";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n";
import { MountContext } from "@/providers/MountProvider";

type Props = {
  value: string;
  ariaLabel: string;
  class?: string;
  children: JSX.Element;
};

const FEEDBACK_DURATION_MS = 1500;

export function CopyableText(props: Props) {
  const [copied, setCopied] = createSignal(false);
  const mount = useContext(MountContext);
  let timer: ReturnType<typeof setTimeout> | null = null;

  onCleanup(() => {
    if (timer) clearTimeout(timer);
  });

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(props.value);
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
    <Tooltip open={copied()} positioning={{ placement: "top", gutter: 4 }}>
      <TooltipTrigger asChild>
        {/* biome-ignore lint/a11y/useSemanticElements: quem chama pode passar filhos de bloco, inválidos dentro de <button>; span + role=button + teclado mantêm a semântica. */}
        <span
          role="button"
          tabIndex={0}
          aria-label={props.ariaLabel}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          class={`wv:inline-flex wv:items-center wv:gap-1 wv:rounded wv:px-1 wv:-mx-1 wv:cursor-pointer wv:select-none wv:transition-colors wv:hover:bg-foreground/10 wv:active:bg-foreground/20 wv:active:scale-[0.98] ${props.class ?? ""}`}
        >
          {props.children}
        </span>
      </TooltipTrigger>
      <TooltipContent container={mount?.root} class="wv:bg-green-600 wv:text-white">
        {t("Copied")}
      </TooltipContent>
    </Tooltip>
  );
}
