import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"

import { useOpenMarkets } from "./use-open-markets"

export function useTokenFromId(address: Address) {
  const { tokens } = useOpenMarkets()
  return useQuery({
    queryKey: ["tokenFromId", address, tokens],
    queryFn: () => {
      if (!(address && tokens)) return null
      const token = tokens.find((item) => item.address == address)
      return token ?? null
    },
    enabled: !!(address && tokens),
  })
}
