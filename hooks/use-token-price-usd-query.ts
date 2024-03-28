import { useQuery } from "@tanstack/react-query"

import { getTokenPriceInUsd } from "@/services/tokens.service"

const useTokenPriceInUsdQuery = (tokenSymbol?: string) => {
  return useQuery({
    queryKey: ["tokenPrice", tokenSymbol],
    queryFn: () => {
      if (!tokenSymbol) return undefined
      return getTokenPriceInUsd(tokenSymbol)
    },
    enabled: !!tokenSymbol,
    staleTime: 1000 * 60, // 1 day for 1d interval, 1 minute for 1m interval
  })
}

export default useTokenPriceInUsdQuery
