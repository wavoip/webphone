import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "wv:peer wv:data-[state=checked]:bg-primary wv:data-[state=unchecked]:bg-input wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:dark:data-[state=unchecked]:bg-input/80 wv:inline-flex wv:h-[1.15rem] wv:w-8 wv:shrink-0 wv:items-center wv:rounded-full wv:border wv:border-transparent wv:shadow-xs wv:transition-all wv:outline-none wv:focus-visible:ring-[3px] wv:disabled:cursor-not-allowed wv:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "wv:bg-background wv:dark:data-[state=unchecked]:bg-foreground wv:dark:data-[state=checked]:bg-primary-foreground wv:pointer-events-none wv:block wv:size-4 wv:rounded-full wv:ring-0 wv:transition-transform wv:data-[state=checked]:translate-x-[calc(100%-2px)] wv:data-[state=unchecked]:translate-x-0 wv:translate-y-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
