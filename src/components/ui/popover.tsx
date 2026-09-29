import { Popover as ArkPopover } from "@ark-ui/react/popover";
import { Portal } from "@ark-ui/react/portal";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { useMount } from "@/providers/MountProvider";

function Popover(props: React.ComponentProps<typeof ArkPopover.Root>) {
  return <ArkPopover.Root data-slot="popover" lazyMount unmountOnExit {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof ArkPopover.Trigger>) {
  return <ArkPopover.Trigger data-slot="popover-trigger" {...props} />;
}

/** Porta para o `root` do shell: é ele que carrega a classe de tema. */
function PopoverContent({ className, ...props }: React.ComponentProps<typeof ArkPopover.Content>) {
  const { root } = useMount();
  const containerRef = useMemo(() => ({ current: root as HTMLElement | null }), [root]);

  return (
    <Portal container={containerRef}>
      <ArkPopover.Positioner>
        <ArkPopover.Content
          data-slot="popover-content"
          className={cn(
            "wv:bg-popover wv:text-popover-foreground wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:data-[state=closed]:zoom-out-95 wv:data-[state=open]:zoom-in-95 wv:z-50 wv:w-72 wv:rounded-md wv:border wv:p-4 wv:shadow-md wv:outline-hidden",
            className,
          )}
          {...props}
        />
      </ArkPopover.Positioner>
    </Portal>
  );
}

function PopoverAnchor(props: React.ComponentProps<typeof ArkPopover.Anchor>) {
  return <ArkPopover.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
