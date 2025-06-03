import { cn } from "utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-bg-subtle-hover", className)}
      {...props}
    />
  )
}

export { Skeleton }
