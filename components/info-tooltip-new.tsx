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
  iconSize = 16,
  asChild = true,
}: PropsWithChildren<{
  className?: string
  iconSize?: number
  side?: "top" | "right" | "bottom" | "left"
  asChild?: boolean
}>) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger
          asChild={asChild}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className={cn(
            "hover:opacity-80 transition-opacity ml-1 text-cloud-300 cursor-pointer",
            className,
          )}
        >
          <CircleHelp size={iconSize ?? 16} />
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side={side}
            className="bg-bg-secondary flex-wrap text-wrap"
          >
            {children}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  )
}
