import { z } from "zod"

// Helper to transform various date formats into valid Date objects
const dateTransformer = z.preprocess((arg) => {
  if (arg instanceof Date) return arg
  if (arg === null || arg === undefined) return new Date()
  return new Date(arg as any)
}, z.date())

const orderSchema = z.object({
  creationDate: dateTransformer,
  latestUpdateDate: dateTransformer,
  expiryDate: dateTransformer.optional(),
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
        // More detailed error logging
        if (error instanceof z.ZodError) {
          console.error(
            "Zod validation error for order:",
            item,
            error.issues.map((issue) => ({
              path: issue.path,
              code: issue.code,
              message: issue.message,
            })),
          )
        } else {
          console.error("Invalid format for offers: ", item, error)
        }
        return null
      }
    })
    .filter(Boolean) as Order[]
}
