import { Portal } from "@ark-ui/react/portal";
import { Tooltip as ArkTooltip } from "@ark-ui/react/tooltip";
import { type ReactNode, useMemo } from "react";

import { cn } from "@/lib/utils";

/**
 * Onde o tooltip aparece é decisão do `Tooltip`, e não do conteúdo: o Zag calcula a
 * posição na máquina de estado, que é a raiz. Use `positioning={{ placement, gutter }}`.
 */
function Tooltip({ openDelay = 0, closeDelay = 0, ...props }: React.ComponentProps<typeof ArkTooltip.Root>) {
  return (
    <ArkTooltip.Root
      data-slot="tooltip"
      openDelay={openDelay}
      closeDelay={closeDelay}
      // O Ark deixa o conteúdo montado e escondido; fechado, ele sairia do DOM só com
      // isto. Quem consulta a árvore não deve achar o texto de um tooltip fechado.
      lazyMount
      unmountOnExit
      {...props}
    />
  );
}

function TooltipTrigger(props: React.ComponentProps<typeof ArkTooltip.Trigger>) {
  return <ArkTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

type ContentProps = React.ComponentProps<typeof ArkTooltip.Content> & {
  /** Para onde portar. No widget é o `root` do shadow, que carrega a classe de tema. */
  container?: HTMLElement | null;
  children?: ReactNode;
};

function TooltipContent({ className, container, children, ...props }: ContentProps) {
  // O `Portal` do Ark quer uma ref, e não o elemento.
  const containerRef = useMemo(() => ({ current: container ?? null }), [container]);

  return (
    <Portal container={containerRef}>
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          data-slot="tooltip-content"
          className={cn(
            "wv:bg-primary wv:text-primary-foreground wv:animate-in wv:fade-in-0 wv:zoom-in-95 wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=closed]:zoom-out-95 wv:z-50 wv:w-fit wv:rounded-md wv:px-3 wv:py-1.5 wv:text-xs wv:text-balance",
            className,
          )}
          {...props}
        >
          {children}
          <ArkTooltip.Arrow className="wv:[--arrow-size:10px] wv:[--arrow-background:var(--color-primary)]">
            <ArkTooltip.ArrowTip className="wv:border-primary" />
          </ArkTooltip.Arrow>
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
