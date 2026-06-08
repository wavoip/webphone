import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("wv:animate-pulse wv:rounded-md wv:bg-accent", className)}
      {...props}
    />
  )
}

export { Skeleton }
