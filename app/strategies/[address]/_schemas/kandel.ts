import { z } from "zod"
import {
  depositAndWithdraw,
  kandelTypeStringSchema,
  numberOrNaN,
  offerWithPricesSchema,
  parameterSchema,
} from "../../(list)/_schemas/kandels"

export const strategySchema = z.object({
  transactionHash: z.string(),
  creationDate: z.date(),
  address: z.string(),
  owner: z.string(),
  type: kandelTypeStringSchema,
  base: z.string(),
  quote: z.string(),
  min: z.string(),
  max: z.string(),
  depositedBase: z.string(),
  depositedQuote: z.string(),
  return: numberOrNaN.optional(),
  currentParameter: parameterSchema,
  offers: z.array(offerWithPricesSchema),
  depositAndWithdraw: depositAndWithdraw.optional(),
})

export type Strategy = z.infer<typeof strategySchema>

export function parseStrategy(data: unknown): Strategy {
  try {
    return strategySchema.parse(data)
  } catch (error) {
    console.error("Failed to parse strategy", error, data)
    throw error
  }
}
