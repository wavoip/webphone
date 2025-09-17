import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "wv:file:text-foreground wv:placeholder:text-muted-foreground wv:selection:bg-primary wv:selection:text-primary-foreground wv:dark:bg-input/30 wv:border-input wv:flex wv:h-9 wv:w-full wv:min-w-0 wv:rounded-md wv:border wv:bg-transparent wv:px-3 wv:py-1 wv:text-base wv:shadow-xs wv:transition-[color,box-shadow] wv:outline-none wv:file:inline-flex wv:file:h-7 wv:file:border-0 wv:file:bg-transparent wv:file:text-sm wv:file:font-medium wv:disabled:pointer-events-none wv:disabled:cursor-not-allowed wv:disabled:opacity-50 wv:md:text-sm",
        "wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:focus-visible:ring-[3px]",
        "wv:aria-invalid:ring-destructive/20 wv:dark:aria-invalid:ring-destructive/40 wv:aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
