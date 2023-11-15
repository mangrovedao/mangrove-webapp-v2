import { useQuery } from "@tanstack/react-query"

import { getTokenPriceInToken } from "@/services/tokens.service"

const useTokenPriceQuery = (
  tokenSymbol?: string,
  priceTokenSymbol?: string,
  interval: "1m" | "1d" = "1m",
) => {
  if (!tokenSymbol || !priceTokenSymbol) return undefined
  return useQuery({
    queryKey: ["tokenPrice", tokenSymbol, priceTokenSymbol, interval],
    queryFn: () =>
      getTokenPriceInToken(tokenSymbol, priceTokenSymbol, interval),
  })
}

export default useTokenPriceQuery
