import { PropsWithChildren } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TooltipInfo } from "@/svgs"
import { cn } from "@/utils"

export default function InfoTooltip({
  children,
  className,
}: PropsWithChildren<{
  className?: string
}>) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger
          className={cn(
            "hover:opacity-80 transition-opacity ml-1 text-cloud-300",
            className,
          )}
        >
          <TooltipInfo />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
