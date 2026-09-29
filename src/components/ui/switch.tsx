import { Switch as ArkSwitch } from "@ark-ui/react/switch";
import type * as React from "react";

import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof ArkSwitch.Root>, "onCheckedChange"> & {
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * O `className` vai para o `Control`, e não para o `Root`: o trilho é ele, e é nele que
 * está o `data-state`. Isso também mantém `[&>span]` apontando para o thumb, como quem
 * usa já espera.
 */
function Switch({ className, onCheckedChange, ...props }: Props) {
  return (
    <ArkSwitch.Root
      data-slot="switch"
      onCheckedChange={onCheckedChange && ((details) => onCheckedChange(details.checked))}
      {...props}
    >
      <ArkSwitch.Control
        className={cn(
          "wv:peer wv:data-[state=checked]:bg-primary wv:data-[state=unchecked]:bg-input wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:dark:data-[state=unchecked]:bg-input/80 wv:inline-flex wv:h-[1.15rem] wv:w-8 wv:shrink-0 wv:items-center wv:rounded-full wv:border wv:border-transparent wv:shadow-xs wv:transition-all wv:outline-none wv:focus-visible:ring-[3px] wv:disabled:cursor-not-allowed wv:disabled:opacity-50",
          className,
        )}
      >
        <ArkSwitch.Thumb
          data-slot="switch-thumb"
          className="wv:bg-background wv:dark:data-[state=unchecked]:bg-foreground wv:dark:data-[state=checked]:bg-primary-foreground wv:pointer-events-none wv:block wv:size-4 wv:rounded-full wv:ring-0 wv:transition-transform wv:data-[state=checked]:translate-x-[calc(100%-2px)] wv:data-[state=unchecked]:translate-x-0 wv:translate-y-0"
        />
      </ArkSwitch.Control>
      <ArkSwitch.HiddenInput />
    </ArkSwitch.Root>
  );
}

export { Switch };
