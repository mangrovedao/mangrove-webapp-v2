import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { useDefaultChain } from "./use-default-chain"

const priceSchema = z.object({
  baseVolume: z.number().nullable(),
  quoteVolume: z.number().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
  open: z.number().nullable(),
  close: z.number().nullable(),
})

// useTokenPrice query from Mangrove data
const useMangroveTokenPricesQuery = (
  baseAddress?: string,
  quoteAddress?: string,
  tickSpacing?: number,
) => {
  const defaultChain = useDefaultChain()

  return useQuery({
    queryKey: [
      "mangroveTokenPrice",
      baseAddress,
      quoteAddress,
      tickSpacing,
      defaultChain.id,
    ],
    queryFn: async () => {
      try {
        if (!baseAddress || !quoteAddress || !tickSpacing) return null

        const res = await fetch(
          `https://indexer.mgvinfra.com/price/24-hour/${defaultChain.id}/${baseAddress}/${quoteAddress}/${tickSpacing}`,
        )

        const data = await res.json()
        const parsedData = priceSchema.parse(data)

        return parsedData
      } catch (error) {
        console.error(error)
        return null
      }
    },
    enabled: !!baseAddress && !!quoteAddress && !!tickSpacing,
    refetchInterval: 1000 * 60, // every minute
    staleTime: 1000 * 60, // 1 minute for 1m interval
  })
}

export default useMangroveTokenPricesQuery
