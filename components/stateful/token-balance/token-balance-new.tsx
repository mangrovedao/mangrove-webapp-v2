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
  const amount = !token
    ? formatUnits(nativeBalance?.value || 0n, nativeBalance?.decimals || 18)
    : formatUnits(balance?.balance || 0n, token?.decimals || 18)
  const decimals = !token ? nativeBalance?.decimals : token.decimals
  const formatted = amount

  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-text-placeholder float-left">
        {props.label ?? "Balance:"}
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
                <span className="text-text-secondary">
                  {Number(formatted).toFixed(token?.displayDecimals ?? 8)}{" "}
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
        </span>
      )}
    </div>
  )
}
