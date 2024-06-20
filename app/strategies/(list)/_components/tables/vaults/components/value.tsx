import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

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
        {Number(baseValue).toFixed(baseToken?.displayDecimals)}{" "}
        {baseToken?.symbol}
      </div>
      <div>
        {Number(quoteValue).toFixed(quoteToken?.displayDecimals)}{" "}
        {quoteToken?.symbol}
      </div>
    </div>
  )
}
