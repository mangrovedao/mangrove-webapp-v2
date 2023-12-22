import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"

export function TokenBalance({ address }: { address?: string }) {
  const { data: token } = useTokenFromAddress(address as Address)
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
