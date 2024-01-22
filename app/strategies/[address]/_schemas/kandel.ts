import { z } from "zod"
import {
  kandelTypeStringSchema,
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
  return: z.number(),
  currentParameter: parameterSchema,
  offers: z.array(offerWithPricesSchema),
})

export type Strategy = z.infer<typeof strategySchema>

export function parseStrategy(data: unknown): Strategy {
  return strategySchema.parse(data)
}
