import { Avatar as ArkAvatar } from "@ark-ui/react/avatar";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Avatar({ className, ...props }: React.ComponentProps<typeof ArkAvatar.Root>) {
  return (
    <ArkAvatar.Root
      data-slot="avatar"
      className={cn("wv:relative wv:flex wv:size-8 wv:shrink-0 wv:overflow-hidden wv:rounded-full", className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof ArkAvatar.Image>) {
  return <ArkAvatar.Image data-slot="avatar-image" className={cn("wv:aspect-square wv:size-full", className)} {...props} />;
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof ArkAvatar.Fallback>) {
  return (
    <ArkAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn("wv:bg-muted wv:flex wv:size-full wv:items-center wv:justify-center wv:rounded-full", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
