import { z } from "zod"

export const numberOrNaN = z.custom(
  (value) => typeof value === "number" || Number.isNaN(value),
  { message: "Expected number or NaN" },
)

export const parameterSchema = z.object({
  gasprice: z.string().nullable().optional(),
  gasreq: z.string().optional(),
  stepSize: z.string().nullable().optional(),
  length: z.string().nullable().optional(),
})

export const bidsOrAsksSchema = z.union([z.literal("bids"), z.literal("asks")])

export const kandelTypeStringSchema = z.union([
  z.literal("Kandel"),
  z.literal("SmartKandel"),
  z.literal("KandelAAVE"),
])

export const offerWithPricesSchema = z.object({
  offerType: bidsOrAsksSchema,
  gives: z.string(),
  gasprice: z.string(),
  gasreq: z.string(),
  gasbase: z.string(),
  price: z.union([z.string(), z.undefined()]),
  index: z.number(),
  offerId: z.number(),
  tick: z.string(),
  live: z.boolean(),
})

export const depositsAndWithdraws = z.object({
  transactionHash: z.string(),
  date: z.date(),
  token: z.string(),
  amount: z.string(),
  isDeposit: z.boolean(),
})

export const parametersHistory = z.object({
  date: z.date().nullish(),
  length: z.string().nullish(),
  stepSize: z.string().nullish(),
  transactionHash: z.string().nullish(),
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
  owner: z.string(),
  min: z.string(),
  max: z.string(),
  return: numberOrNaN,
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
