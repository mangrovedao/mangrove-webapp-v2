import { z } from "zod"

export interface SwapSimulationResult {
  simulation: any
  approvalStep: {
    done: boolean
    step?: string
  } | null
  receiveValue: string
}

export const priceSchema = z.object({
  price: z.number(),
  id: z.optional(z.string()),
  symbol: z.optional(z.string()),
  name: z.optional(z.string()),
})

export interface SwapFields {
  payValue: string
  receiveValue: string
}

export interface SwapProps {
  marketClient?: any // Client market actions
}

export interface MarketPrices {
  payDollar: number
  receiveDollar: number
}
