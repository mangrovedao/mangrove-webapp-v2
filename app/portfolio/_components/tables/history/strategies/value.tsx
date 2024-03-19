import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import useTokenPriceInUsdQuery from "@/hooks/use-token-price-usd-query"

type Props = {
  base: string
  baseValue: string
  quote: string
  quoteValue: string
}
export function ValueInUSD({ base, quote, baseValue, quoteValue }: Props) {
  const { data: baseToken } = useTokenFromAddress(base as Address)
  const { data: quoteToken } = useTokenFromAddress(quote as Address)

  const { data: baseRate } = useTokenPriceInUsdQuery(
    baseToken?.symbol as string,
  )
  const { data: quoteRate } = useTokenPriceInUsdQuery(
    quoteToken?.symbol as string,
  )

  if (!quoteToken) {
    return <Skeleton className="h-6 w-full" />
  }

  const baseAmount = Number(baseValue) * (baseRate?.high ?? 0)
  const quoteAmount = Number(quoteValue) * (quoteRate?.high ?? 0)

  return (
    <div>
      <div>{baseAmount.toFixed(2)} USD</div>
      <div>{quoteAmount.toFixed(2)} USD</div>
    </div>
  )
}
