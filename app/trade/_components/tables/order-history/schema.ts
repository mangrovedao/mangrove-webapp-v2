import { MarketParams } from "@mangrovedao/mgv"
import { z } from "zod"

export const rawOrderHistory = z.object({
  side: z.string(),
  type: z.string(),
  received: z.number(),
  sent: z.number(),
  block: z.number(),
  fee: z.number(),
  price: z.number().nullable(),
  offerId: z.string().nullable(),
  status: z.string(),
  transactionHash: z.string(),
  lockedProvision: z.string().nullable(),
})

const marketSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  displayDecimals: z.number(),
})

export const orderHistorySchema = z.object({
  ...rawOrderHistory.shape,
  market: z.object({
    base: marketSchema,
    quote: marketSchema,
    tickSpacing: z.bigint(),
  }),
})

export type OrderHistory = z.infer<typeof orderHistorySchema>

export function parseOrderHistory(
  data: unknown[],
  market: MarketParams,
): OrderHistory[] {
  return data
    .map((item) => {
      try {
        const rawOrder = rawOrderHistory.parse(item)

        return orderHistorySchema.parse({
          ...rawOrder,
          market: {
            base: {
              ...market.base,
              displayDecimals: market.base.displayDecimals,
            },
            quote: {
              ...market.quote,
              displayDecimals: market.quote.displayDecimals,
            },
            tickSpacing: market.tickSpacing,
          },
        })
      } catch (error) {
        console.error("Invalid format for order history: ", item, error)
        return null
      }
    })
    .filter(Boolean) as OrderHistory[]
}
