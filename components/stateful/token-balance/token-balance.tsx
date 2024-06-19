import type { Token } from "@mangrovedao/mgv"

import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTokenBalance } from "@/hooks/use-balances"
import { formatUnits } from "viem"
import { useAccount, useBalance } from "wagmi"

export function TokenBalance(props: {
  token?: Token | string
  label?: string
  action?: {
    onClick: (value: string) => void
    text?: string
  }
}) {
  const token = typeof props.token === "string" ? undefined : props.token
  const { address } = useAccount()
  const { data: nativeBalance } = useBalance({ address })
  const { balance, isLoading } = useTokenBalance({
    token: token?.address,
  })

  const symbol = !token ? nativeBalance?.symbol : token.symbol
  const amount = !token ? nativeBalance?.value : balance?.balance
  const decimals = !token ? nativeBalance?.decimals : token.symbol

  const formatted = formatUnits(amount ?? 0n, Number(decimals || 18))

  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">
        {props.label ?? "Balance"}
      </span>
      {!props.token || isLoading ? (
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
                  props.action?.onClick(formatted || "")
                }}
              >
                <span title={formatted?.toString()}>
                  {Number(formatted).toFixed(token?.displayDecimals ?? 8)}{" "}
                  {symbol}
                </span>
              </TooltipTrigger>

              <TooltipPortal>
                <TooltipContent
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  {Number(formatted).toFixed(Number(decimals))} {symbol}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
          {props?.action && props?.action.text && (
            <button
              className="text-xs underline"
              onClick={(e) => {
                formatted && props?.action?.onClick(formatted)
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
