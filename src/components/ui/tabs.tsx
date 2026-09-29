import { Tabs as ArkTabs } from "@ark-ui/solid/tabs"
import { type ComponentProps, splitProps } from "solid-js"

import { cn } from "@/lib/utils"

function Tabs(props: ComponentProps<typeof ArkTabs.Root>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <ArkTabs.Root data-slot="tabs" class={cn("wv:flex wv:flex-col wv:gap-2", local.class)} {...rest} />;
}

function TabsList(props: ComponentProps<typeof ArkTabs.List>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <ArkTabs.List data-slot="tabs-list" class={cn("wv:bg-muted wv:text-muted-foreground wv:inline-flex wv:h-9 wv:w-fit wv:items-center wv:justify-center wv:rounded-lg wv:p-[3px]", local.class)} {...rest} />;
}

function TabsTrigger(props: ComponentProps<typeof ArkTabs.Trigger>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <ArkTabs.Trigger data-slot="tabs-trigger" class={cn("wv:data-[selected]:bg-background wv:dark:data-[selected]:text-foreground wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:focus-visible:outline-ring wv:dark:data-[selected]:border-input wv:dark:data-[selected]:bg-input/30 wv:text-foreground wv:dark:text-muted-foreground wv:inline-flex wv:h-[calc(100%-1px)] wv:flex-1 wv:items-center wv:justify-center wv:gap-1.5 wv:rounded-md wv:border wv:border-transparent wv:px-2 wv:py-1 wv:text-sm wv:font-medium wv:whitespace-nowrap wv:transition-[color,box-shadow] wv:focus-visible:ring-[3px] wv:focus-visible:outline-1 wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:data-[selected]:shadow-sm wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4", local.class)} {...rest} />;
}

function TabsContent(props: ComponentProps<typeof ArkTabs.Content>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <ArkTabs.Content data-slot="tabs-content" class={cn("wv:flex-1 wv:outline-none", local.class)} {...rest} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
