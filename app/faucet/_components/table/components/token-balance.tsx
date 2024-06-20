import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { buildToken } from "@mangrovedao/mgv/addresses"
import { Address } from "viem"

export function TokenBalance({
  address,
  symbol,
}: {
  address?: string
  symbol?: string
}) {
  if (!address || !symbol) return <div>Loading...</div>
  const token = buildToken({ address: address as Address, symbol })
  const { formattedWithSymbol, formatted, isLoading } = useTokenBalance(
    token ?? undefined,
  )

  return (
    <div className="flex items-center">
      {!token || isLoading ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-base float-right" title={formatted?.toString()}>
          {formattedWithSymbol}
        </span>
      )}
    </div>
  )
}
