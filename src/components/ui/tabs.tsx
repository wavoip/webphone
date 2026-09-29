import { Tabs as ArkTabs } from "@ark-ui/react/tabs"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof ArkTabs.Root>) {
  return (
    <ArkTabs.Root
      data-slot="tabs"
      className={cn("wv:flex wv:flex-col wv:gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof ArkTabs.List>) {
  return (
    <ArkTabs.List
      data-slot="tabs-list"
      className={cn(
        "wv:bg-muted wv:text-muted-foreground wv:inline-flex wv:h-9 wv:w-fit wv:items-center wv:justify-center wv:rounded-lg wv:p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ArkTabs.Trigger>) {
  return (
    <ArkTabs.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "wv:data-[selected]:bg-background wv:dark:data-[selected]:text-foreground wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:focus-visible:outline-ring wv:dark:data-[selected]:border-input wv:dark:data-[selected]:bg-input/30 wv:text-foreground wv:dark:text-muted-foreground wv:inline-flex wv:h-[calc(100%-1px)] wv:flex-1 wv:items-center wv:justify-center wv:gap-1.5 wv:rounded-md wv:border wv:border-transparent wv:px-2 wv:py-1 wv:text-sm wv:font-medium wv:whitespace-nowrap wv:transition-[color,box-shadow] wv:focus-visible:ring-[3px] wv:focus-visible:outline-1 wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:data-[selected]:shadow-sm wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof ArkTabs.Content>) {
  return (
    <ArkTabs.Content
      data-slot="tabs-content"
      className={cn("wv:flex-1 wv:outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
