import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}


const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:fixed wv:inset-0 wv:z-50 wv:bg-black/50",
        className
      )}
      {...props}
    />
  )
})

function DialogContent({
  className,
  children,
  showCloseButton = true,
  container,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
} & Pick<React.ComponentProps<typeof DialogPrimitive.Portal>, "container">) {
  return (
    <DialogPortal container={container} data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "wv:bg-background wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:data-[state=closed]:zoom-out-95 wv:data-[state=open]:zoom-in-95 wv:fixed wv:top-[50%] wv:left-[50%] wv:z-50 wv:grid wv:w-full wv:max-w-[calc(100%-2rem)] wv:translate-x-[-50%] wv:translate-y-[-50%] wv:gap-4 wv:rounded-lg wv:border wv:p-6 wv:shadow-lg wv:duration-200 wv:sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="wv:ring-offset-background wv:focus:ring-ring wv:data-[state=open]:bg-accent wv:data-[state=open]:text-muted-foreground wv:absolute wv:top-4 wv:right-4 wv:rounded-xs wv:opacity-70 wv:transition-opacity wv:hover:opacity-100 wv:focus:ring-2 wv:focus:ring-offset-2 wv:focus:outline-hidden wv:disabled:pointer-events-none wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4"
          >
            <XIcon />
            <span className="wv:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("wv:flex wv:flex-col wv:gap-2 wv:text-center wv:sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "wv:flex wv:flex-col-reverse wv:gap-2 wv:sm:flex-row wv:sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("wv:text-lg wv:leading-none wv:font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("wv:text-muted-foreground wv:text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
