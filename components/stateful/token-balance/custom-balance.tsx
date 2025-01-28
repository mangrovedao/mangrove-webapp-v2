import type { Token } from "@mangrovedao/mgv"

import InfoTooltip from "@/components/info-tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getExactWeiAmount } from "@/utils/regexp"

export function CustomBalance(props: {
  token?: Token | string
  balance?: string
  label?: string
  tooltip?: string
  action?: {
    onClick: (value: string) => void
    text?: string
  }
}) {
  const token = typeof props.token === "string" ? undefined : props.token

  return (
    <div className="flex justify-between items-center mt-1">
      <div className="flex items-center">
        <span className="text-xs text-secondary float-left">
          {props.label ?? "Balance"}
        </span>
        {props.tooltip && <InfoTooltip>{props.tooltip}</InfoTooltip>}
      </div>
      {!props.balance || !props.token ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger
                className="hover:opacity-80 transition-opacity ml-1"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()

                  props.action?.onClick(props.balance || "")
                }}
              >
                <span>
                  {!token ? (
                    `${getExactWeiAmount(props.balance, 6)} ${props.token}`
                  ) : (
                    <>
                      {getExactWeiAmount(props.balance, token.displayDecimals)}{" "}
                      {token?.symbol}
                    </>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  {props.balance} {token?.symbol}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </span>
      )}
    </div>
  )
}
