import type { Address } from "viem"

import useMangrove from "@/providers/mangrove"
import { useQuery } from "@tanstack/react-query"

export function useTokenFromId(address: Address) {
  const { mangrove } = useMangrove()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenFromId", address, mangrove?.address],
    queryFn: () => {
      if (!(address && mangrove)) return null
      return mangrove.tokenFromId(address)
    },
    enabled: !!(address && mangrove),
  })
}
