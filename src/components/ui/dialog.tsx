import { Dialog as ArkDialog } from "@ark-ui/solid/dialog";
import { type ComponentProps, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type RootProps = Omit<ComponentProps<typeof ArkDialog.Root>, "onOpenChange"> & {
  onOpenChange?: (open: boolean) => void;
};

function Dialog(props: RootProps) {
  const [local, rest] = splitProps(props, ["onOpenChange"]);
  return (
    <ArkDialog.Root lazyMount unmountOnExit onOpenChange={(details) => local.onOpenChange?.(details.open)} {...rest} />
  );
}

function DialogTrigger(props: ComponentProps<typeof ArkDialog.Trigger>) {
  return <ArkDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogClose(props: ComponentProps<typeof ArkDialog.CloseTrigger>) {
  return <ArkDialog.CloseTrigger data-slot="dialog-close" {...props} />;
}

function DialogOverlay(props: ComponentProps<typeof ArkDialog.Backdrop>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ArkDialog.Backdrop
      data-slot="dialog-overlay"
      class={cn("wv:fixed wv:inset-0 wv:z-50 wv:bg-black/50", local.class)}
      {...rest}
    />
  );
}

type ContentProps = ComponentProps<typeof ArkDialog.Content> & {
  showCloseButton?: boolean;
  container?: HTMLElement | null;
};

/**
 * Centralizar é do `Positioner`, e não do conteúdo: o Ark separa quem posiciona de quem é
 * posicionado, então as classes de tamanho de quem usa continuam valendo no conteúdo.
 */
function DialogContent(props: ContentProps) {
  const [local, rest] = splitProps(props, ["class", "children", "showCloseButton", "container"]);
  const showClose = () => local.showCloseButton ?? true;

  return (
    <Portal mount={local.container ?? undefined}>
      <DialogOverlay />
      <ArkDialog.Positioner class="wv:fixed wv:inset-0 wv:z-50 wv:flex wv:items-center wv:justify-center wv:p-4">
        <ArkDialog.Content
          data-slot="dialog-content"
          class={cn(
            "wv:bg-background wv:relative wv:grid wv:w-full wv:gap-4 wv:rounded-lg wv:border wv:p-6 wv:shadow-lg wv:sm:max-w-lg",
            local.class,
          )}
          {...rest}
        >
          {local.children}
          {showClose() && (
            <ArkDialog.CloseTrigger
              data-slot="dialog-close"
              class="wv:ring-offset-background wv:focus:ring-ring wv:absolute wv:top-4 wv:right-4 wv:rounded-xs wv:opacity-70 wv:transition-opacity wv:hover:opacity-100 wv:focus:ring-2 wv:focus:ring-offset-2 wv:focus:outline-hidden wv:disabled:pointer-events-none wv:[&_svg]:pointer-events-none wv:[&_svg]:shrink-0 wv:[&_svg:not([class*=size-])]:size-4"
            >
              <XIcon />
              <span class="wv:sr-only">Close</span>
            </ArkDialog.CloseTrigger>
          )}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </Portal>
  );
}

function DialogHeader(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="dialog-header"
      class={cn("wv:flex wv:flex-col wv:gap-2 wv:text-center wv:sm:text-left", local.class)}
      {...rest}
    />
  );
}

function DialogFooter(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="dialog-footer"
      class={cn("wv:flex wv:flex-col-reverse wv:gap-2 wv:sm:flex-row wv:sm:justify-end", local.class)}
      {...rest}
    />
  );
}

function DialogTitle(props: ComponentProps<typeof ArkDialog.Title>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ArkDialog.Title
      data-slot="dialog-title"
      class={cn("wv:text-lg wv:leading-none wv:font-semibold", local.class)}
      {...rest}
    />
  );
}

function DialogDescription(props: ComponentProps<typeof ArkDialog.Description>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ArkDialog.Description
      data-slot="dialog-description"
      class={cn("wv:text-muted-foreground wv:text-sm", local.class)}
      {...rest}
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
