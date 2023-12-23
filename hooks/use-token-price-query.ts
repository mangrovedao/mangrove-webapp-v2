import { useQuery } from "@tanstack/react-query"

import { getTokenPriceInToken } from "@/services/tokens.service"

const useTokenPriceQuery = (
  tokenSymbol?: string,
  priceTokenSymbol?: string,
  interval: "1m" | "1d" = "1m",
) => {
  return useQuery({
    queryKey: ["tokenPrice", tokenSymbol, priceTokenSymbol, interval],
    queryFn: () => {
      if (!tokenSymbol || !priceTokenSymbol) return undefined
      return getTokenPriceInToken(tokenSymbol, priceTokenSymbol, interval)
    },
    enabled: !!tokenSymbol && !!priceTokenSymbol,
    refetchInterval: interval === "1m" ? 1000 * 60 : false, // every minute for 1m interval only
    staleTime: interval === "1d" ? 1000 * 60 * 60 * 24 : 1000 * 60, // 1 day for 1d interval, 1 minute for 1m interval
  })
}

export default useTokenPriceQuery
