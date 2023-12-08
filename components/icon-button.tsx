import clsx from "clsx"
import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

type Props = React.ComponentProps<"button"> & {
  tooltip?: string
  children: React.ReactElement
}

export function IconButton({ children: icon, tooltip, ...props }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            {...props}
            className={clsx(
              "rounded-full aspect-square",
              "inline-flex items-center justify-center",
              "transition-transform hover:scale-125 disabled:scale-100 disabled:pointer-events-none",
              props.className,
            )}
          >
            {React.cloneElement(icon, {
              className: clsx(icon.props.className, "w-5 h-auto"),
            })}
          </button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
