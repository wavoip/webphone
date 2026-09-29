import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { XIcon } from "lucide-react";
import { type ReactNode, useMemo } from "react";

import { cn } from "@/lib/utils";

type RootProps = Omit<React.ComponentProps<typeof ArkDialog.Root>, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

function Dialog({ onOpenChange, ...props }: RootProps) {
  return (
    <ArkDialog.Root
      lazyMount
      unmountOnExit
      onOpenChange={onOpenChange && ((details) => onOpenChange(details.open))}
      {...props}
    />
  );
}

function DialogTrigger(props: React.ComponentProps<typeof ArkDialog.Trigger>) {
  return <ArkDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: React.ComponentProps<typeof ArkDialog.CloseTrigger>) {
  return <ArkDialog.CloseTrigger data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof ArkDialog.Backdrop>) {
  return (
    <ArkDialog.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:fixed wv:inset-0 wv:z-50 wv:bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

type ContentProps = React.ComponentProps<typeof ArkDialog.Content> & {
  showCloseButton?: boolean;
  container?: HTMLElement | null;
  children?: ReactNode;
};

/**
 * Centralizar é do `Positioner`, e não do conteúdo: o Ark separa quem posiciona de quem
 * é posicionado, então as classes de tamanho de quem usa continuam valendo no conteúdo.
 */
function DialogContent({ className, children, showCloseButton = true, container, ...props }: ContentProps) {
  const containerRef = useMemo(() => ({ current: container ?? null }), [container]);

  return (
    <Portal container={containerRef}>
      <DialogOverlay />
      <ArkDialog.Positioner className="wv:fixed wv:inset-0 wv:z-50 wv:flex wv:items-center wv:justify-center wv:p-4">
        <ArkDialog.Content
          data-slot="dialog-content"
          className={cn(
            "wv:bg-background wv:data-[state=open]:animate-in wv:data-[state=closed]:animate-out wv:data-[state=closed]:fade-out-0 wv:data-[state=open]:fade-in-0 wv:data-[state=closed]:zoom-out-95 wv:data-[state=open]:zoom-in-95 wv:relative wv:grid wv:w-full wv:gap-4 wv:rounded-lg wv:border wv:p-6 wv:shadow-lg wv:duration-200 wv:sm:max-w-lg",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <ArkDialog.CloseTrigger
              data-slot="dialog-close"
              className="wv:ring-offset-background wv:focus:ring-ring wv:absolute wv:top-4 wv:right-4 wv:rounded-xs wv:opacity-70 wv:transition-opacity wv:hover:opacity-100 wv:focus:ring-2 wv:focus:ring-offset-2 wv:focus:outline-hidden wv:disabled:pointer-events-none wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4"
            >
              <XIcon />
              <span className="wv:sr-only">Close</span>
            </ArkDialog.CloseTrigger>
          )}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </Portal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("wv:flex wv:flex-col wv:gap-2 wv:text-center wv:sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("wv:flex wv:flex-col-reverse wv:gap-2 wv:sm:flex-row wv:sm:justify-end", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof ArkDialog.Title>) {
  return (
    <ArkDialog.Title
      data-slot="dialog-title"
      className={cn("wv:text-lg wv:leading-none wv:font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof ArkDialog.Description>) {
  return (
    <ArkDialog.Description
      data-slot="dialog-description"
      className={cn("wv:text-muted-foreground wv:text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
};
