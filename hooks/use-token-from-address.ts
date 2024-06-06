import type { Address } from "viem"

import { useQuery } from "@tanstack/react-query"
import { useTokens } from "./use-addresses"

export function useTokenFromAddress(address: Address) {
  const tokens = useTokens()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenFromAddress", address, tokens],
    queryFn: () => {
      if (!(address && tokens)) return undefined
      return tokens.find((item) => item.address == address)
    },
    enabled: !!(address && tokens),
    staleTime: 10 * 60 * 1000,
  })
}
