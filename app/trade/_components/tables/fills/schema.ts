import { z } from "zod"

const fillSchema = z.object({
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
export type Fill = z.infer<typeof fillSchema>

export function parseFills(data: unknown[]): Fill[] {
  return data
    .map((item) => {
      try {
        return fillSchema.parse(item)
      } catch (error) {
        console.error("Invalid format for fills: ", item, error)
        return null
      }
    })
    .filter(Boolean) as Fill[]
}
