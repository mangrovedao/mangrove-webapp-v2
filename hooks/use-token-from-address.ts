import { isAddressEqual, type Address } from "viem"

import { useQuery } from "@tanstack/react-query"
import { useOpenMarkets } from "./use-open-markets"

export function useTokenFromAddress(address: Address) {
  const { tokens } = useOpenMarkets()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenFromAddress", address, tokens],
    queryFn: () => {
      try {
        if (!(address && tokens)) return undefined
        return tokens.find((item) => isAddressEqual(item.address, address))
      } catch (error) {
        console.error(error)
        return undefined
      }
    },
    enabled: !!(address && tokens),
    staleTime: 10 * 60 * 1000,
  })
}
