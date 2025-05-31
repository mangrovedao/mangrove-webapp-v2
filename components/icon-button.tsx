import clsx from "clsx"
import React from "react"
import { Button } from "./ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

type Props = React.ComponentProps<typeof Button> & {
  tooltip?: string
  children: React.ReactElement
  isLoading?: boolean
}

export function IconButton({
  children: icon,
  tooltip,
  isLoading,
  ...props
}: Props) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            {...props}
            type="button"
            variant={"primary"}
            size={"icon"}
            loading={isLoading}
            disabled={isLoading}
          >
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
