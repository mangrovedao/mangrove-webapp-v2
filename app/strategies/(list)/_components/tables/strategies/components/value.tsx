import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import Big from "big.js"

type Props = {
  base: string
  baseValue: string
  quote: string
  quoteValue: string
}
export function Value({ base, baseValue, quote, quoteValue }: Props) {
  const { data: baseToken } = useTokenFromAddress(base as Address)
  const { data: quoteToken } = useTokenFromAddress(quote as Address)

  if (!quoteToken) {
    return <Skeleton className="h-6 w-full" />
  }

  return (
    <div>
      <div>
        {Big(baseValue).toFixed(baseToken?.displayedDecimals)}{" "}
        {baseToken?.symbol}
      </div>
      <div>
        {Big(quoteValue).toFixed(quoteToken?.displayedDecimals)}{" "}
        {quoteToken?.symbol}
      </div>
    </div>
  )
}
