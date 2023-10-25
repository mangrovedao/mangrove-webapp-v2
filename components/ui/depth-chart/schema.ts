import Big from "big.js"
import { z } from "zod"

// Custom transformer function to convert string to Big.js
function bigStringToBig(value: string) {
  return new Big(value)
}

export const offerSchema = z.object({
  next: z.number().optional(),
  offer_gasbase: z.number().optional(),
  id: z.number().optional(),
  gasprice: z.number().optional(),
  maker: z.string().optional(),
  gasreq: z.number().optional(),
  gives: z.string().optional(),
  wants: z.string().optional(),
  volume: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "Invalid price value",
    })
    .transform(bigStringToBig),
  price: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "Invalid price value",
    })
    .transform(bigStringToBig),
  prev: z.number().optional(),
})

export const orderbookSchema = z.object({
  asks: z.array(offerSchema),
  bids: z.array(offerSchema),
})

export type Offer = z.infer<typeof offerSchema>
export type Orderbook = z.infer<typeof orderbookSchema>
