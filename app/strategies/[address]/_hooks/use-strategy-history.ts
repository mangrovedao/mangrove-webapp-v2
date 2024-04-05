import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { getErrorMessage } from "@/utils/errors"

type Params = {
  kandelAddress?: string
}
export function useStrategyHistory({ kandelAddress }: Params) {
  return useQuery({
    queryKey: ["strategy-history", kandelAddress],
    queryFn: async () => {
      try {
        if (!kandelAddress) return
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/kandel-history/${kandelAddress}`,
        )
        const history = await res.json()
        return parseHistory(history)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    enabled: !!kandelAddress,
    meta: {
      error: "Unable to retrieve strategy history data",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

const strategyHistorySchema = z.object({
  askAmount: z.string(),
  bidAmount: z.string(),
  block: z.number(),
  bounty: z.string(),
  creationDate: z.string(),
  marketName: z.string(),
  maxPrice: z.string(),
  minPrice: z.string(),
  numberOfOrders: z.string(),
  stepSize: z.string(),
  txHash: z.string(),
})

export const strategyHistorySchemaOut = z.array(strategyHistorySchema)

export type StrategyHistory = z.infer<typeof strategyHistorySchema>
export type StrategyHistoryEntry = z.infer<typeof strategyHistorySchemaOut>

export function parseHistory(data: unknown) {
  try {
    return strategyHistorySchemaOut.parse(data)
  } catch (error) {
    console.error("Invalid format for strategy: ", data, error)
    return null
  }
}
