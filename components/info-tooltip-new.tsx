import { PropsWithChildren } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/utils"
import { CircleHelp } from "lucide-react"

export default function InfoTooltip({
  children,
  side,
  className,
}: PropsWithChildren<{
  className?: string
  side?: "top" | "right" | "bottom" | "left"
}>) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className={cn(
            "hover:opacity-80 transition-opacity ml-1 text-cloud-300",
            className,
          )}
        >
          <CircleHelp size={16} />
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side={side}>{children}</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}
