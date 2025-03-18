import { z } from "zod"

const orderHistorySchema = z.object({
  creationDate: z.date(),
  transactionHash: z.string(),
  isBid: z.boolean(),
  takerGot: z.string(),
  takerGave: z.string(),
  penalty: z.string(),
  feePaid: z.string(),
  initialWants: z.string(),
  initialGives: z.string(),
  price: z.string(),
  status: z.string(),
  isMarketOrder: z.boolean(),
})
export type OrderHistory = z.infer<typeof orderHistorySchema>

export function parseOrderHistory(data: unknown[]): OrderHistory[] {
  return data
    .map((item) => {
      try {
        return orderHistorySchema.parse(item)
      } catch (error) {
        console.error("Invalid format for order history: ", item, error)
        return null
      }
    })
    .filter(Boolean) as OrderHistory[]
}
