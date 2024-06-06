import type { Address } from "viem"

import { useTokenFromId } from "@/hooks/use-token-from-id"
import { useSearchParams } from "next/navigation"

export function useTokensFromQueryParams() {
  const searchParams = useSearchParams()
  const market = searchParams.get("market")
  const [baseId, quoteId] = market?.split(",") ?? []
  const { data: baseToken } = useTokenFromId(baseId as Address)
  const { data: quoteToken } = useTokenFromId(quoteId as Address)
  return {
    baseToken,
    quoteToken,
  }
}
