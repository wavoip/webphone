import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "wv:inline-flex wv:items-center wv:justify-center wv:rounded-md wv:border wv:px-2 wv:py-0.5 wv:text-xs wv:font-medium wv:w-fit wv:whitespace-nowrap wv:shrink-0 wv:[&>svg]:size-3 wv:gap-1 wv:[&>svg]:pointer-events-none wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:focus-visible:ring-[3px] wv:aria-invalid:ring-destructive/20 wv:dark:aria-invalid:ring-destructive/40 wv:aria-invalid:border-destructive wv:transition-[color,box-shadow] wv:overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "wv:border-transparent wv:bg-primary wv:text-primary-foreground wv:[a&]:hover:bg-primary/90",
        secondary:
          "wv:border-transparent wv:bg-secondary wv:text-secondary-foreground wv:[a&]:hover:bg-secondary/90",
        destructive:
          "wv:border-transparent wv:bg-destructive wv:text-white wv:[a&]:hover:bg-destructive/90 wv:focus-visible:ring-destructive/20 wv:dark:focus-visible:ring-destructive/40 wv:dark:bg-destructive/60",
        outline:
          "wv:text-foreground wv:[a&]:hover:bg-accent wv:[a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
