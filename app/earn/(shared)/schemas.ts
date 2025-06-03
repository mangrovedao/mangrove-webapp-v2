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

export const kandelSchema = z.object({
  kandelAddress: z.string(),
  apr: z.object({
    mangroveKandelAPR: z.number(),
    aaveAPR: z.number(),
    baseTokenAaveAPR: z.number(),
    quoteTokenAaveAPR: z.number(),
    baseTokenTVL: z.string(),
    quoteTokenTVL: z.string(),
    data: z.object({
      address: z.string(),
      baseToken: z.string(),
      quoteToken: z.string(),
      baseTokenTVL: z.string(),
      quoteTokenTVL: z.string(),
      trades: z.object({
        baseReceived: z.string(),
        quoteReceived: z.string(),
      }),
      tickOffset: z.string(),
      tick: z.string(),
      chainId: z.number(),
      type: z.string(),
    }),
  }),
  timestamp: z.number(),
})
