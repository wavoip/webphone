import { Portal } from "solid-js/web";
import { Tooltip as ArkTooltip } from "@ark-ui/solid/tooltip";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

/**
 * Onde o tooltip aparece é decisão do `Tooltip`, e não do conteúdo: o Zag calcula a
 * posição na máquina de estado, que é a raiz. Use `positioning={{ placement, gutter }}`.
 */
function Tooltip(props: ComponentProps<typeof ArkTooltip.Root>) {
  return (
    <ArkTooltip.Root
      openDelay={0}
      closeDelay={0}
      // O Ark deixa o conteúdo montado e escondido; fechado, ele sai do DOM só com isto.
      lazyMount
      unmountOnExit
      {...props}
    />
  );
}

function TooltipTrigger(props: ComponentProps<typeof ArkTooltip.Trigger>) {
  return <ArkTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

type ContentProps = ComponentProps<typeof ArkTooltip.Content> & {
  /** Para onde portar. No widget é o `root` do shadow, que carrega a classe de tema. */
  container?: HTMLElement | null;
};

function TooltipContent(props: ContentProps) {
  const [local, rest] = splitProps(props, ["class", "container", "children"]);

  return (
    <Portal mount={local.container ?? undefined}>
      <ArkTooltip.Positioner>
        <ArkTooltip.Content
          data-slot="tooltip-content"
          class={cn(
            "wv:bg-primary wv:text-primary-foreground wv:z-50 wv:w-fit wv:rounded-md wv:px-3 wv:py-1.5 wv:text-xs wv:text-balance",
            local.class,
          )}
          {...rest}
        >
          {local.children}
          <ArkTooltip.Arrow class="wv:[--arrow-size:10px] wv:[--arrow-background:var(--color-primary)]">
            <ArkTooltip.ArrowTip class="wv:border-primary" />
          </ArkTooltip.Arrow>
        </ArkTooltip.Content>
      </ArkTooltip.Positioner>
    </Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
