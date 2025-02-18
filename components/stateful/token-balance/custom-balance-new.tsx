import type { Token } from "@mangrovedao/mgv"

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
  isWrapping?: boolean
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
        <span className="text-xs text-text-placeholder float-left">
          {props.label ?? "Balance: "}
        </span>
        {/* <InfoTooltip>{props.tooltip ?? "Formatted Wallet balance"}</InfoTooltip> */}
      </div>
      {!props.balance || !props.token ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs text-text-secondary space-x-1">
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
                    `${props.balance} ${props.token}`
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
                  {props.balance} {token?.symbol} {props.isWrapping && " + ETH"}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </span>
      )}
    </div>
  )
}
