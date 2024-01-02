import type { Address } from "viem"

import useMangrove from "@/providers/mangrove"
import { useQuery } from "@tanstack/react-query"

export function useTokenFromAddress(address: Address) {
  const { mangrove } = useMangrove()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenFromAddress", address, mangrove?.address],
    queryFn: () => {
      if (!(address && mangrove)) return null
      return mangrove.tokenFromAddress(address)
    },
    enabled: !!(address && mangrove),
    staleTime: 10 * 60 * 1000,
  })
}
