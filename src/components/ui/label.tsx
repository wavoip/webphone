import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

/** O `<label>` nativo já associa pelo `for`; o que falta é só o estilo. */
function Label(props: ComponentProps<"label">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: quem usa passa `for` ou aninha o controle
    <label
      data-slot="label"
      class={cn(
        "wv:flex wv:items-center wv:gap-2 wv:text-sm wv:leading-none wv:font-medium wv:select-none wv:group-data-[disabled=true]:pointer-events-none wv:group-data-[disabled=true]:opacity-50 wv:peer-disabled:cursor-not-allowed wv:peer-disabled:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Label };
