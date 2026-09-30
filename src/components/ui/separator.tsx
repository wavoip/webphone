import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

type Props = ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
  /** Decorativo não entra na árvore de acessibilidade: é risco, não estrutura. */
  decorative?: boolean;
};

function Separator(props: Props) {
  const [local, rest] = splitProps(props, ["class", "orientation", "decorative"]);
  const orientation = () => local.orientation ?? "horizontal";
  const decorative = () => local.decorative ?? true;

  return (
    <div
      data-slot="separator"
      data-orientation={orientation()}
      role={decorative() ? "none" : "separator"}
      aria-orientation={decorative() ? undefined : orientation()}
      class={cn(
        "wv:bg-border wv:shrink-0 wv:data-[orientation=horizontal]:h-px wv:data-[orientation=horizontal]:w-full wv:data-[orientation=vertical]:h-full wv:data-[orientation=vertical]:w-px",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Separator };
