"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  container,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  Pick<React.ComponentProps<typeof TooltipPrimitive.Portal>, "container">) {
  return (
    <TooltipPrimitive.Portal container={container}>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "wv:bg-primary wv:text-primary-foreground wv:animate-in wv:fade-in-0 wv:zoom-in-95 wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=closed]:zoom-out-95 wv:data-[side=bottom]:slide-in-from-top-2 wv:data-[side=left]:slide-in-from-right-2 wv:data-[side=right]:slide-in-from-left-2 wv:data-[side=top]:slide-in-from-bottom-2 wv:z-50 wv:w-fit wv:origin-(--radix-tooltip-content-transform-origin) wv:rounded-md wv:px-3 wv:py-1.5 wv:text-xs wv:text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="wv:bg-primary wv:fill-primary wv:z-50 wv:size-2.5 wv:translate-y-[calc(-50%_-_2px)] wv:rotate-45 wv:rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
