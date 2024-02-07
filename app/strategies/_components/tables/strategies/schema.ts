import { z } from "zod"

const parameterSchema = z.object({
  gasprice: z.string().optional(),
  gasreq: z.string().optional(),
  stepSize: z.string().optional(),
  length: z.string().optional(),
})

const bidsOrAsksSchema = z.union([z.literal("bids"), z.literal("asks")])

const kandelTypeStringSchema = z.union([
  z.literal("Kandel"),
  z.literal("KandelAAVE"),
])

const offerWithPricesSchema = z.object({
  offerType: bidsOrAsksSchema,
  gives: z.string(),
  gasprice: z.string(),
  gasreq: z.string(),
  gasbase: z.string(),
  price: z.union([z.string(), z.undefined()]),
  index: z.number(),
  offerId: z.number(),
  live: z.boolean(),
})

export const strategySchema = z.object({
  transactionHash: z.string(),
  creationDate: z.date(),
  address: z.string(),
  type: kandelTypeStringSchema,
  base: z.string(),
  quote: z.string(),
  depositedBase: z.string(),
  depositedQuote: z.string(),
  currentParameter: parameterSchema,
  offers: z.array(offerWithPricesSchema),
})

export type Strategy = z.infer<typeof strategySchema>

export function parseStrategies(data: unknown[]): Strategy[] {
  return data
    .map((item) => {
      try {
        return strategySchema.parse(item)
      } catch (error) {
        console.error("Invalid format for strategies: ", item, error)
        return null
      }
    })
    .filter(Boolean) as Strategy[]
}
