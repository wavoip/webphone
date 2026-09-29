import type * as React from "react";

import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  /** Decorativo não entra na árvore de acessibilidade: é risco, não estrutura. */
  decorative?: boolean;
};

function Separator({ className, orientation = "horizontal", decorative = true, ...props }: Props) {
  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "wv:bg-border wv:shrink-0 wv:data-[orientation=horizontal]:h-px wv:data-[orientation=horizontal]:w-full wv:data-[orientation=vertical]:h-full wv:data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
