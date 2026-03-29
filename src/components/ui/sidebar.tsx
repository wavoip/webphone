"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "wv:group/sidebar-wrapper wv:has-data-[variant=inset]:bg-sidebar wv:flex wv:min-h-svh wv:w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "wv:bg-sidebar wv:text-sidebar-foreground wv:flex wv:h-full wv:w-(--sidebar-width) wv:flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="wv:bg-sidebar wv:text-sidebar-foreground wv:w-(--sidebar-width) wv:p-0 wv:[&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="wv:sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="wv:flex wv:h-full wv:w-full wv:flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="wv:group wv:peer wv:text-sidebar-foreground wv:hidden wv:md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "wv:relative wv:w-(--sidebar-width) wv:bg-transparent wv:transition-[width] wv:duration-200 wv:ease-linear",
          "wv:group-data-[collapsible=offcanvas]:w-0",
          "wv:group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "wv:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "wv:group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "wv:fixed wv:inset-y-0 wv:z-10 wv:hidden wv:h-svh wv:w-(--sidebar-width) wv:transition-[left,right,width] wv:duration-200 wv:ease-linear wv:md:flex",
          side === "left"
            ? "wv:left-0 wv:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "wv:right-0 wv:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "wv:p-2 wv:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "wv:group-data-[collapsible=icon]:w-(--sidebar-width-icon) wv:group-data-[side=left]:border-r wv:group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="wv:bg-sidebar wv:group-data-[variant=floating]:border-sidebar-border wv:flex wv:h-full wv:w-full wv:flex-col wv:group-data-[variant=floating]:rounded-lg wv:group-data-[variant=floating]:border wv:group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("wv:size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="wv:sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "wv:hover:after:bg-sidebar-border wv:absolute wv:inset-y-0 wv:z-20 wv:hidden wv:w-4 wv:-translate-x-1/2 wv:transition-all wv:ease-linear wv:group-data-[side=left]:-right-4 wv:group-data-[side=right]:left-0 wv:after:absolute wv:after:inset-y-0 wv:after:left-1/2 wv:after:w-[2px] wv:sm:flex",
        "wv:in-data-[side=left]:cursor-w-resize wv:in-data-[side=right]:cursor-e-resize",
        "wv:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize wv:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "wv:hover:group-data-[collapsible=offcanvas]:bg-sidebar wv:group-data-[collapsible=offcanvas]:translate-x-0 wv:group-data-[collapsible=offcanvas]:after:left-full",
        "wv:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "wv:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "wv:bg-background wv:relative wv:flex wv:w-full wv:flex-1 wv:flex-col",
        "wv:md:peer-data-[variant=inset]:m-2 wv:md:peer-data-[variant=inset]:ml-0 wv:md:peer-data-[variant=inset]:rounded-xl wv:md:peer-data-[variant=inset]:shadow-sm wv:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("wv:bg-background wv:h-8 wv:w-full wv:shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("wv:flex wv:flex-col wv:gap-2 wv:p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("wv:flex wv:flex-col wv:gap-2 wv:p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("wv:bg-sidebar-border wv:mx-2 wv:w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "wv:flex wv:min-h-0 wv:flex-1 wv:flex-col wv:gap-2 wv:overflow-auto wv:group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("wv:relative wv:flex wv:w-full wv:min-w-0 wv:flex-col wv:p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "wv:text-sidebar-foreground/70 wv:ring-sidebar-ring wv:flex wv:h-8 wv:shrink-0 wv:items-center wv:rounded-md wv:px-2 wv:text-xs wv:font-medium wv:outline-hidden wv:transition-[margin,opacity] wv:duration-200 wv:ease-linear wv:focus-visible:ring-2 wv:[&>svg]:size-4 wv:[&>svg]:shrink-0",
        "wv:group-data-[collapsible=icon]:-mt-8 wv:group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "wv:text-sidebar-foreground wv:ring-sidebar-ring wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:absolute wv:top-3.5 wv:right-3 wv:flex wv:aspect-square wv:w-5 wv:items-center wv:justify-center wv:rounded-md wv:p-0 wv:outline-hidden wv:transition-transform wv:focus-visible:ring-2 wv:[&>svg]:size-4 wv:[&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "wv:after:absolute wv:after:-inset-2 wv:md:after:hidden",
        "wv:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("wv:w-full wv:text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("wv:flex wv:w-full wv:min-w-0 wv:flex-col wv:gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("wv:group/menu-item wv:relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "wv:peer/menu-button wv:flex wv:w-full wv:items-center wv:gap-2 wv:overflow-hidden wv:rounded-md wv:p-2 wv:text-left wv:text-sm wv:outline-hidden wv:ring-sidebar-ring wv:transition-[width,height,padding] wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:focus-visible:ring-2 wv:active:bg-sidebar-accent wv:active:text-sidebar-accent-foreground wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:group-has-data-[sidebar=menu-action]/menu-item:pr-8 wv:aria-disabled:pointer-events-none wv:aria-disabled:opacity-50 wv:data-[active=true]:bg-sidebar-accent wv:data-[active=true]:font-medium wv:data-[active=true]:text-sidebar-accent-foreground wv:data-[state=open]:hover:bg-sidebar-accent wv:data-[state=open]:hover:text-sidebar-accent-foreground wv:group-data-[collapsible=icon]:size-8! wv:group-data-[collapsible=icon]:p-2! wv:[&>span:last-child]:truncate wv:[&>svg]:size-4 wv:[&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground",
        outline:
          "wv:bg-background wv:shadow-[0_0_0_1px_hsl(var(--sidebar-border))] wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "wv:h-8 wv:text-sm",
        sm: "wv:h-7 wv:text-xs",
        lg: "wv:h-12 wv:text-sm wv:group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "wv:text-sidebar-foreground wv:ring-sidebar-ring wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:peer-hover/menu-button:text-sidebar-accent-foreground wv:absolute wv:top-1.5 wv:right-1 wv:flex wv:aspect-square wv:w-5 wv:items-center wv:justify-center wv:rounded-md wv:p-0 wv:outline-hidden wv:transition-transform wv:focus-visible:ring-2 wv:[&>svg]:size-4 wv:[&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "wv:after:absolute wv:after:-inset-2 wv:md:after:hidden",
        "wv:peer-data-[size=sm]/menu-button:top-1",
        "wv:peer-data-[size=default]/menu-button:top-1.5",
        "wv:peer-data-[size=lg]/menu-button:top-2.5",
        "wv:group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "wv:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground wv:group-focus-within/menu-item:opacity-100 wv:group-hover/menu-item:opacity-100 wv:data-[state=open]:opacity-100 wv:md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "wv:text-sidebar-foreground wv:pointer-events-none wv:absolute wv:right-1 wv:flex wv:h-5 wv:min-w-5 wv:items-center wv:justify-center wv:rounded-md wv:px-1 wv:text-xs wv:font-medium wv:tabular-nums wv:select-none",
        "wv:peer-hover/menu-button:text-sidebar-accent-foreground wv:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "wv:peer-data-[size=sm]/menu-button:top-1",
        "wv:peer-data-[size=default]/menu-button:top-1.5",
        "wv:peer-data-[size=lg]/menu-button:top-2.5",
        "wv:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("wv:flex wv:h-8 wv:items-center wv:gap-2 wv:rounded-md wv:px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="wv:size-4 wv:rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="wv:h-4 wv:max-w-(--skeleton-width) wv:flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "wv:border-sidebar-border wv:mx-3.5 wv:flex wv:min-w-0 wv:translate-x-px wv:flex-col wv:gap-1 wv:border-l wv:px-2.5 wv:py-0.5",
        "wv:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("wv:group/menu-sub-item wv:relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "wv:text-sidebar-foreground wv:ring-sidebar-ring wv:hover:bg-sidebar-accent wv:hover:text-sidebar-accent-foreground wv:active:bg-sidebar-accent wv:active:text-sidebar-accent-foreground wv:[&>svg]:text-sidebar-accent-foreground wv:flex wv:h-7 wv:min-w-0 wv:-translate-x-px wv:items-center wv:gap-2 wv:overflow-hidden wv:rounded-md wv:px-2 wv:outline-hidden wv:focus-visible:ring-2 wv:disabled:pointer-events-none wv:disabled:opacity-50 wv:aria-disabled:pointer-events-none wv:aria-disabled:opacity-50 wv:[&>span:last-child]:truncate wv:[&>svg]:size-4 wv:[&>svg]:shrink-0",
        "wv:data-[active=true]:bg-sidebar-accent wv:data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "wv:text-xs",
        size === "md" && "wv:text-sm",
        "wv:group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
