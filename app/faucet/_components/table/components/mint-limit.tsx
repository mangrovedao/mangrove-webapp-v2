import type { Address } from "viem"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { useMintLimit } from "../hooks/use-mint-limit"

export function MintLimit({ address }: { address?: string }) {
  const { data: token } = useTokenFromAddress(address as Address)
  const mintLimitQuery = useMintLimit(address as Address)
  return (
    <div className="flex items-center">
      {!token || mintLimitQuery.isFetching ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-base float-right">
          {mintLimitQuery.data} {token.symbol}
        </span>
      )}
    </div>
  )
}
