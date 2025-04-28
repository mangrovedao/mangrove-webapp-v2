import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { useDefaultChain } from "./use-default-chain"

const priceSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
})

// useTokenPrice query from Mangrove data
const useMangrovePoolStatsQuery = (
  baseAddress?: string,
  quoteAddress?: string,
) => {
  const { defaultChain } = useDefaultChain()

  return useQuery({
    queryKey: ["mangrovePoolStats", baseAddress, quoteAddress, defaultChain.id],
    queryFn: async () => {
      try {
        if (!baseAddress || !quoteAddress) return null

        const res = await fetch(
          `https://pools.mgvinfra.com/stats/?token0=${baseAddress}&token1=${quoteAddress}&chainId=${defaultChain.id}`,
        )
        const data = await res.json()

        console.log("data", data)

        const parsedData = priceSchema.parse(data)
        return parsedData
      } catch (error) {
        return null
      }
    },
    enabled: !!baseAddress && !!quoteAddress,
    refetchInterval: 1000 * 60, // every minute
    staleTime: 1000 * 60, // 1 minute for 1m interval
  })
}

export default useMangrovePoolStatsQuery
