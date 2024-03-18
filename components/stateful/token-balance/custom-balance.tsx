import type { Token } from "@mangrovedao/mangrove.js"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"

export function CustomBalance(props: {
  token?: Token | string
  balance?: string
  label?: string
  action?: {
    onClick: (value: string) => void
    text?: string
  }
}) {
  const token = typeof props.token === "string" ? undefined : props.token

  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">
        {props.label ?? "Balance"}
      </span>
      {!props.balance || !props.token ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger
                title={undefined}
                className="hover:opacity-80 transition-opacity ml-1"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()

                  props.action?.onClick(props.balance || "0")
                }}
              >
                <span>
                  {Number(props.balance).toFixed(token?.displayedDecimals)}{" "}
                  {token?.symbol}
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  {Number(props.balance).toFixed(token?.decimals)}{" "}
                  {token?.symbol}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          {props?.action && props?.action.text && (
            <button
              className="text-xs underline"
              onClick={(e) => {
                props.balance && props?.action?.onClick(props.balance)
              }}
            >
              {props?.action.text}
            </button>
          )}
        </span>
      )}
    </div>
  )
}
