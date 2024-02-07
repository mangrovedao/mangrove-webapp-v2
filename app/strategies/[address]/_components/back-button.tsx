import Link from "next/link"

import { ChevronRight } from "@/svgs"
import { cn } from "@/utils"

export default function BackButton({
  children,
  className,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "text-cloud-300 text-sm font-medium hover:opacity-90 transition-opacity inline-flex",
        className,
      )}
      {...rest}
    >
      <ChevronRight className="h-5 w-auto rotate-180" />
      {children}
    </Link>
  )
}
