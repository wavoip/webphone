"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "wv:flex wv:items-center wv:gap-2 wv:text-sm wv:leading-none wv:font-medium wv:select-none wv:group-data-[disabled=true]:pointer-events-none wv:group-data-[disabled=true]:opacity-50 wv:peer-disabled:cursor-not-allowed wv:peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
