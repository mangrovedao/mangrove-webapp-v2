import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"

import { useTokens } from "./use-addresses"

export function useTokenFromId(address: Address) {
  const tokens = useTokens()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenFromId", address, tokens],
    queryFn: () => {
      if (!(address && tokens)) return null
      return tokens.find((item) => item.address == address)
    },
    enabled: !!(address && tokens),
  })
}
