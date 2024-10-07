import React from "react"

import { Button } from "./ui/button-old"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

type Props = React.ComponentProps<typeof Button> & {
  tooltip?: React.ReactNode
  children: React.ReactElement
}

export function IconToolTip({ children: icon, tooltip, ...props }: Props) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{icon}</TooltipTrigger>
        <TooltipContent className="!z-50">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
