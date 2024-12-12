import { MarketParams } from "@mangrovedao/mgv"
import { z } from "zod"

export const rawOrderSchema = z.object({
  side: z.string(),
  type: z.string(),
  received: z.number(),
  sent: z.number(),
  total: z.number(),
  price: z.number(),
  expiry: z.number(),
  offerId: z.string(),
  lockedProvision: z.string(),
})

const marketSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  displayDecimals: z.number(),
})

export const orderSchema = z.object({
  ...rawOrderSchema.shape,
  market: z.object({
    base: marketSchema,
    quote: marketSchema,
    tickSpacing: z.bigint(),
  }),
})

export type Order = z.infer<typeof orderSchema>

export function parseOrders(data: unknown[], market: MarketParams): Order[] {
  return data
    .map((item) => {
      try {
        // First validate the raw item data
        const rawOrder = rawOrderSchema.parse(item)

        // Then construct and validate the full order with market data
        return orderSchema.parse({
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
        console.error(
          "Invalid format for offers: ",
          {
            item,
            base: market.base,
            quote: market.quote,
          },
          error,
        )
        return null
      }
    })
    .filter(Boolean) as Order[]
}
