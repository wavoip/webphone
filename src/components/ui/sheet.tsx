"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "wv:fixed wv:inset-0 wv:z-50 wv:bg-black/50 wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:animate-in wv:data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "wv:fixed wv:z-50 wv:flex wv:flex-col wv:gap-4 wv:bg-background wv:shadow-lg wv:transition wv:ease-in-out wv:data-[state=closed]:animate-out wv:data-[state=closed]:duration-300 wv:data-[state=open]:animate-in wv:data-[state=open]:duration-500",
          side === "right" &&
            "wv:inset-y-0 wv:right-0 wv:h-full wv:w-3/4 wv:border-l wv:data-[state=closed]:slide-out-to-right wv:data-[state=open]:slide-in-from-right wv:sm:max-w-sm",
          side === "left" &&
            "wv:inset-y-0 wv:left-0 wv:h-full wv:w-3/4 wv:border-r wv:data-[state=closed]:slide-out-to-left wv:data-[state=open]:slide-in-from-left wv:sm:max-w-sm",
          side === "top" &&
            "wv:inset-x-0 wv:top-0 wv:h-auto wv:border-b wv:data-[state=closed]:slide-out-to-top wv:data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "wv:inset-x-0 wv:bottom-0 wv:h-auto wv:border-t wv:data-[state=closed]:slide-out-to-bottom wv:data-[state=open]:slide-in-from-bottom",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="wv:absolute wv:top-4 wv:right-4 wv:rounded-xs wv:opacity-70 wv:ring-offset-background wv:transition-opacity wv:hover:opacity-100 wv:focus:ring-2 wv:focus:ring-ring wv:focus:ring-offset-2 wv:focus:outline-hidden wv:disabled:pointer-events-none wv:data-[state=open]:bg-secondary">
            <XIcon className="wv:size-4" />
            <span className="wv:sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("wv:flex wv:flex-col wv:gap-1.5 wv:p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("wv:mt-auto wv:flex wv:flex-col wv:gap-2 wv:p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("wv:font-semibold wv:text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("wv:text-sm wv:text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
