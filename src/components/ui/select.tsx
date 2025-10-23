import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "wv:border-input wv:data-[placeholder]:text-muted-foreground wv:[&_svg:not([class*=text-])]:text-muted-foreground wv:focus-visible:border-ring wv:focus-visible:ring-ring/50 wv:aria-invalid:ring-destructive/20 wv:dark:aria-invalid:ring-destructive/40 wv:aria-invalid:border-destructive wv:dark:bg-input/30 wv:dark:hover:bg-input/50 wv:flex wv:w-fit wv:items-center wv:justify-between wv:gap-2 wv:rounded-md wv:border wv:bg-transparent wv:px-3 wv:py-2 wv:text-sm wv:whitespace-nowrap wv:shadow-xs wv:transition-[color,box-shadow] wv:outline-none wv:focus-visible:ring-[3px] wv:disabled:cursor-not-allowed wv:disabled:opacity-50 wv:data-[size=default]:h-9 wv:data-[size=sm]:h-8 wv:*:data-[slot=select-value]:line-clamp-1 wv:*:data-[slot=select-value]:flex wv:*:data-[slot=select-value]:items-center wv:*:data-[slot=select-value]:gap-2 wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="wv:size-4 wv:opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "wv:bg-popover wv:text-popover-foreground wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:data-[state=closed]:zoom-out-95 wv:data-[state=open]:zoom-in-95 wv:data-[side=bottom]:slide-in-from-top-2 wv:data-[side=left]:slide-in-from-right-2 wv:data-[side=right]:slide-in-from-left-2 wv:data-[side=top]:slide-in-from-bottom-2 wv:relative wv:z-50 wv:max-h-(--radix-select-content-available-height) wv:min-w-[8rem] wv:origin-(--radix-select-content-transform-origin) wv:overflow-x-hidden wv:overflow-y-auto wv:rounded-md wv:border wv:shadow-md",
          position === "popper" &&
            "wv:data-[side=bottom]:translate-y-1 wv:data-[side=left]:-translate-x-1 wv:data-[side=right]:translate-x-1 wv:data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "wv:p-1",
            position === "popper" &&
              "wv:h-[var(--radix-select-trigger-height)] wv:w-full wv:min-w-[var(--radix-select-trigger-width)] wv:scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("wv:text-muted-foreground wv:px-2 wv:py-1.5 wv:text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "wv:focus:bg-accent wv:focus:text-accent-foreground wv:[&_svg:not([class*=text-])]:text-muted-foreground wv:relative wv:flex wv:w-full wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:py-1.5 wv:pr-8 wv:pl-2 wv:text-sm wv:outline-hidden wv:select-none wv:data-[disabled]:pointer-events-none wv:data-[disabled]:opacity-50 wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4 wv:*:[span]:last:flex wv:*:[span]:last:items-center wv:*:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="wv:absolute wv:right-2 wv:flex wv:size-3.5 wv:items-center wv:justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="wv:size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("wv:bg-border wv:pointer-events-none wv:-mx-1 wv:my-1 wv:h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "wv:flex wv:cursor-default wv:items-center wv:justify-center wv:py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="wv:size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "wv:flex wv:cursor-default wv:items-center wv:justify-center wv:py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="wv:size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
