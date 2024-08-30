import { formatUnits, type Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

type Props = {
  min: string
  max: string
  quote: string
  base: string
}
export function MinMax({ min, max, quote, base }: Props) {
  const { data: quoteToken } = useTokenFromAddress(quote as Address)
  const { data: baseToken } = useTokenFromAddress(base as Address)

  const displayedDecimals = quoteToken?.displayDecimals ?? 2
  const symbol = quoteToken?.symbol

  if (!quoteToken) {
    return <Skeleton className="h-6 w-full" />
  }

  const decimals = Number(quoteToken?.decimals) - Number(baseToken?.decimals)

  const minBigInt = BigInt(Math.floor(Number(min)))
  const maxBigInt = BigInt(Math.floor(Number(max)))

  if (!quoteToken) {
    return
  }

  return (
    <div>
      <div>
        {Number(formatUnits(minBigInt, decimals)).toFixed(displayedDecimals)}{" "}
        {symbol}
      </div>
      <div>
        {Number(formatUnits(maxBigInt, decimals)).toFixed(displayedDecimals)}{" "}
        {symbol}
      </div>
    </div>
  )
}
