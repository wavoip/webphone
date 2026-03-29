import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  container,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  showCloseButton?: boolean;
} & Pick<React.ComponentProps<typeof DropdownMenuPrimitive.Portal>, "container">) {
  return (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "wv:bg-popover wv:text-popover-foreground wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:data-[state=closed]:zoom-out-95 wv:data-[state=open]:zoom-in-95 wv:data-[side=bottom]:slide-in-from-top-2 wv:data-[side=left]:slide-in-from-right-2 wv:data-[side=right]:slide-in-from-left-2 wv:data-[side=top]:slide-in-from-bottom-2 wv:z-50 wv:max-h-(--radix-dropdown-menu-content-available-height) wv:min-w-[8rem] wv:origin-(--radix-dropdown-menu-content-transform-origin) wv:overflow-x-hidden wv:overflow-y-auto wv:rounded-md wv:border wv:p-1 wv:shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "wv:focus:bg-accent wv:focus:text-accent-foreground wv:data-[variant=destructive]:text-destructive wv:data-[variant=destructive]:focus:bg-destructive/10 wv:dark:data-[variant=destructive]:focus:bg-destructive/20 wv:data-[variant=destructive]:focus:text-destructive wv:data-[variant=destructive]:*:[svg]:!text-destructive wv:[&_svg:not([class*=text-])]:text-muted-foreground wv:relative wv:flex wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:px-2 wv:py-1.5 wv:text-sm wv:outline-hidden wv:select-none wv:data-[disabled]:pointer-events-none wv:data-[disabled]:opacity-50 wv:data-[inset]:pl-8 wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "wv:focus:bg-accent wv:focus:text-accent-foreground wv:relative wv:flex wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:py-1.5 wv:pr-2 wv:pl-8 wv:text-sm wv:outline-hidden wv:select-none wv:data-[disabled]:pointer-events-none wv:data-[disabled]:opacity-50 wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="wv:pointer-events-none wv:absolute wv:left-2 wv:flex wv:size-3.5 wv:items-center wv:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="wv:size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "wv:focus:bg-accent wv:focus:text-accent-foreground wv:relative wv:flex wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:py-1.5 wv:pr-2 wv:pl-8 wv:text-sm wv:outline-hidden wv:select-none wv:data-[disabled]:pointer-events-none wv:data-[disabled]:opacity-50 wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="wv:pointer-events-none wv:absolute wv:left-2 wv:flex wv:size-3.5 wv:items-center wv:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="wv:size-2 wv:fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("wv:px-2 wv:py-1.5 wv:text-sm wv:font-medium wv:data-[inset]:pl-8", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("wv:bg-border wv:-mx-1 wv:my-1 wv:h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("wv:text-muted-foreground wv:ml-auto wv:text-xs wv:tracking-widest", className)}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "wv:focus:bg-accent wv:focus:text-accent-foreground wv:data-[state=open]:bg-accent wv:data-[state=open]:text-accent-foreground wv:[&_svg:not([class*=text-])]:text-muted-foreground wv:flex wv:cursor-default wv:items-center wv:gap-2 wv:rounded-sm wv:px-2 wv:py-1.5 wv:text-sm wv:outline-hidden wv:select-none wv:data-[inset]:pl-8 wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="wv:ml-auto wv:size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "wv:bg-popover wv:text-popover-foreground wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:data-[state=closed]:zoom-out-95 wv:data-[state=open]:zoom-in-95 wv:data-[side=bottom]:slide-in-from-top-2 wv:data-[side=left]:slide-in-from-right-2 wv:data-[side=right]:slide-in-from-left-2 wv:data-[side=top]:slide-in-from-bottom-2 wv:z-50 wv:min-w-[8rem] wv:origin-(--radix-dropdown-menu-content-transform-origin) wv:overflow-hidden wv:rounded-md wv:border wv:p-1 wv:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
