import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { getErrorMessage } from "@/utils/errors"

type Params = {
  kandelAddress?: string
}
export function usePnL({ kandelAddress }: Params) {
  return useQuery({
    queryKey: ["pnl", kandelAddress],
    queryFn: async () => {
      try {
        if (!kandelAddress) return
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/pnl/${kandelAddress}`,
        )
        const pnl = await res.json()

        if (pnl.length <= 0) {
          return {
            pnlQuote: "closed",
            returnRate: "closed",
          }
        }
        return parsePnl(pnl)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    enabled: !!kandelAddress,
    meta: {
      error: "Unable to retrieve pnl data",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

const pnlEntrySchema = z.object({
  marketName: z.string(),
  instanceAddress: z.string(),
  startBalanceQuote: z.string(),
  endBalanceQuote: z.string(),
  pnlQuote: z.string(),
  returnRate: z.string(),
})

export const pnlSchema = z.array(
  z.object({
    pnlQuote: z.string(),
    returnRate: z.string(),
  }),
)

export type Pnl = z.infer<typeof pnlSchema>
export type PnlEntry = z.infer<typeof pnlEntrySchema>

export function parsePnl(data: unknown) {
  try {
    return pnlSchema.parse(data)[0]
  } catch (error) {
    console.error("Invalid format for pnl: ", data, error)
    return null
  }
}
