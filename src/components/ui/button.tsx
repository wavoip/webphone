import { ark } from "@ark-ui/solid/factory";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "wv:inline-flex wv:items-center wv:justify-center wv:gap-2 wv:whitespace-nowrap wv:rounded-md wv:text-sm wv:font-medium wv:transition-all wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:[&_svg]:pointer-events-none wv:[&_svg:not([class*=size-])]:size-4 wv:shrink-0 wv:[&_svg]:shrink-0 wv:outline-none wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:focus-visible:ring-[3px] wv:aria-invalid:ring-destructive/20 wv:dark:aria-invalid:ring-destructive/40 wv:aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "wv:bg-primary wv:text-primary-foreground wv:shadow-xs wv:hover:bg-primary/90",
        destructive:
          "wv:bg-destructive wv:text-white wv:shadow-xs wv:hover:bg-destructive/90 wv:focus-visible:ring-destructive/20 wv:dark:focus-visible:ring-destructive/40 wv:dark:bg-destructive/60",
        outline:
          "wv:border wv:bg-background wv:shadow-xs wv:hover:bg-accent wv:hover:text-accent-foreground wv:dark:bg-input/30 wv:dark:border-input wv:dark:hover:bg-input/50",
        secondary: "wv:bg-secondary wv:text-secondary-foreground wv:shadow-xs wv:hover:bg-secondary/80",
        ghost: "wv:hover:bg-accent wv:hover:text-accent-foreground wv:dark:hover:bg-accent/50",
        link: "wv:text-primary wv:underline-offset-4 wv:hover:underline",
      },
      size: {
        default: "wv:h-9 wv:px-4 wv:py-2 wv:has-[>svg]:px-3",
        sm: "wv:h-8 wv:rounded-md wv:gap-1.5 wv:px-3 wv:has-[>svg]:px-2.5",
        lg: "wv:h-10 wv:rounded-md wv:px-6 wv:has-[>svg]:px-4",
        icon: "wv:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Os props vêm do `ark.button`: o `asChild` do Solid é função, e não booleano — declarar
// como booleano aqui compila e quebra na hora do clique.
type Props = ComponentProps<typeof ark.button> & VariantProps<typeof buttonVariants>;

function Button(props: Props) {
  const [local, rest] = splitProps(props, ["class", "variant", "size", "asChild"]);
  return (
    <ark.button
      data-slot="button"
      asChild={local.asChild}
      class={cn(buttonVariants({ variant: local.variant, size: local.size, className: local.class }))}
      {...rest}
    />
  );
}

export { Button, buttonVariants };
