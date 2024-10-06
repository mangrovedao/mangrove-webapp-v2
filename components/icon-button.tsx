import clsx from "clsx"
import React from "react"
import { Button } from "./ui/button-old"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

type Props = React.ComponentProps<typeof Button> & {
  tooltip?: string
  children: React.ReactElement
}

export function IconButton({ children: icon, tooltip, ...props }: Props) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button {...props} type="button" variant={"tertiary"} size={"icon"}>
            {React.cloneElement(icon, {
              className: clsx(
                icon.props.className,
                "w-5 h-auto stroke-current",
              ),
            })}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
