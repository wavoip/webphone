import { Avatar as ArkAvatar } from "@ark-ui/solid/avatar";
import { type ComponentProps, splitProps } from "solid-js";

import { cn } from "@/lib/utils";

function Avatar(props: ComponentProps<typeof ArkAvatar.Root>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ArkAvatar.Root
      data-slot="avatar"
      class={cn("wv:relative wv:flex wv:size-8 wv:shrink-0 wv:overflow-hidden wv:rounded-full", local.class)}
      {...rest}
    />
  );
}

function AvatarImage(props: ComponentProps<typeof ArkAvatar.Image>) {
  const [local, rest] = splitProps(props, ["class"]);
  return <ArkAvatar.Image data-slot="avatar-image" class={cn("wv:aspect-square wv:size-full", local.class)} {...rest} />;
}

function AvatarFallback(props: ComponentProps<typeof ArkAvatar.Fallback>) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <ArkAvatar.Fallback
      data-slot="avatar-fallback"
      class={cn("wv:bg-muted wv:flex wv:size-full wv:items-center wv:justify-center wv:rounded-full", local.class)}
      {...rest}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
