import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import Big from "big.js"

type Props = {
  min: string
  max: string
  quote: string
}
export function MinMax({ min, max, quote }: Props) {
  const { data: quoteToken } = useTokenFromAddress(quote as Address)
  const displayedDecimals = quoteToken?.displayedDecimals ?? 2
  const symbol = quoteToken?.symbol

  if (!quoteToken) {
    return <Skeleton className="h-6 w-full" />
  }

  return (
    <div>
      <div>
        {Big(min).toFixed(displayedDecimals)} {symbol}
      </div>
      <div>
        {Big(max).toFixed(displayedDecimals)} {symbol}
      </div>
    </div>
  )
}
