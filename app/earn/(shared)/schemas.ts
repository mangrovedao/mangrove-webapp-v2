import { z } from "zod"

export const multicallSchema = z.object({
  totalInQuote: z.tuple([z.bigint(), z.bigint()]),
  underlyingBalances: z.tuple([z.bigint(), z.bigint()]),
  totalSupply: z.bigint(),
  balanceOf: z.bigint(),
  feeData: z.tuple([z.number(), z.number(), z.string()]),
  market: z.tuple([z.string(), z.string(), z.bigint()]),
  symbol: z.string(),
  decimals: z.number(),
  lastTotalInQuote: z.bigint(),
  lastTimestamp: z.bigint(),
})

export const pnlSchema = z.object({
  currentShares: z.number().or(z.null()),
  pnl: z.number().or(z.null()),
  realizedPnl: z.number().or(z.null()),
})

export const priceSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  symbol: z.string(),
})
