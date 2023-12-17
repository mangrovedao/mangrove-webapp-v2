import type { Address } from "viem"

import { TokenIcon } from "@/components/token-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

type Props = {
  base: string
  quote: string
}
export function Market({ base, quote }: Props) {
  const { data: baseToken } = useTokenFromAddress(base as Address)
  const { data: quoteToken } = useTokenFromAddress(quote as Address)
  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {baseToken && quoteToken ? (
          <>
            <TokenIcon symbol={baseToken.symbol} />
            <TokenIcon symbol={quoteToken.symbol} />{" "}
          </>
        ) : (
          <>
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </>
        )}
      </div>
      {baseToken && quoteToken ? (
        <span>
          {baseToken.symbol}/{quoteToken.symbol}
        </span>
      ) : (
        <Skeleton className="w-20 h-6" />
      )}
    </div>
  )
}
