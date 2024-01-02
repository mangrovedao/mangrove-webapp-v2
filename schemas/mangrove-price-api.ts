import { z } from "zod"

export const mangrovePriceResponseSchema = z.object({
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  date: z.string(),
})
