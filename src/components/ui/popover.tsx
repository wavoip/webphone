import { Popover as ArkPopover } from "@ark-ui/solid/popover";
import { Portal } from "solid-js/web";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";
import { useSurface } from "@/providers/SurfaceProvider";

function Popover(props: ComponentProps<typeof ArkPopover.Root>) {
  return <ArkPopover.Root lazyMount unmountOnExit {...props} />;
}

function PopoverTrigger(props: ComponentProps<typeof ArkPopover.Trigger>) {
  return <ArkPopover.Trigger data-slot="popover-trigger" {...props} />;
}

/** Porta para a superfície ativa: é ela que carrega a classe de tema. */
function PopoverContent(props: ComponentProps<typeof ArkPopover.Content>) {
  const { container } = useSurface();
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <Portal mount={container()}>
      <ArkPopover.Positioner>
        <ArkPopover.Content
          data-slot="popover-content"
          class={cn(
            "wv:bg-popover wv:text-popover-foreground wv:z-50 wv:w-72 wv:rounded-md wv:border wv:p-4 wv:shadow-md wv:outline-hidden",
            local.class,
          )}
          {...rest}
        />
      </ArkPopover.Positioner>
    </Portal>
  );
}

function PopoverAnchor(props: ComponentProps<typeof ArkPopover.Anchor>) {
  return <ArkPopover.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
