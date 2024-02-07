import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import Big from "big.js"

type Props = {
  quote: string
  value: string
}
export function Value({ quote, value }: Props) {
  const { data: quoteToken } = useTokenFromAddress(quote as Address)

  if (!quoteToken) {
    return <Skeleton className="h-6 w-full" />
  }

  return (
    <div className="text-right">
      {Big(value).toFixed(quoteToken?.displayedDecimals)} {quoteToken?.symbol}
    </div>
  )
}
