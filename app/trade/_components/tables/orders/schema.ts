import { z } from "zod"

const orderSchema = z.object({
  creationDate: z.date(),
  latestUpdateDate: z.date(),
  expiryDate: z.date().optional(),
  transactionHash: z.string(),
  isBid: z.boolean(),
  takerGot: z.string(),
  takerGave: z.string(),
  penalty: z.string(),
  feePaid: z.string(),
  initialWants: z.string(),
  initialGives: z.string(),
  price: z.string(),
  offerId: z.string(),
  inboundRoute: z.string(),
  outboundRoute: z.string(),
})
export type Order = z.infer<typeof orderSchema>

export function parseOrders(data: unknown[]): Order[] {
  return data
    .map((item) => {
      try {
        return orderSchema.parse(item)
      } catch (error) {
        console.error("Invalid format for offers: ", item, error)
        return null
      }
    })
    .filter(Boolean) as Order[]
}
