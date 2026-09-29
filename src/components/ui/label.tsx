import type * as React from "react";

import { cn } from "@/lib/utils";

/** O `<label>` nativo já associa pelo `htmlFor`; o que falta é só o estilo. */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: quem usa passa `htmlFor` ou aninha o controle
    <label
      data-slot="label"
      className={cn(
        "wv:flex wv:items-center wv:gap-2 wv:text-sm wv:leading-none wv:font-medium wv:select-none wv:group-data-[disabled=true]:pointer-events-none wv:group-data-[disabled=true]:opacity-50 wv:peer-disabled:cursor-not-allowed wv:peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
