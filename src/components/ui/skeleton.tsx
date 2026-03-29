import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("wv:bg-accent wv:animate-pulse wv:rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
