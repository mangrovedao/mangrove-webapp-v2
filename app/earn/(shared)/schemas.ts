import { Address } from "viem"
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
  kandel: z.string(),
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

const AddressSchema = z.string().transform((val) => val as Address)

const MarketTokenSchema = z.object({
  address: AddressSchema,
  symbol: z.string(),
  decimals: z.number(),
  displayDecimals: z.number(),
  priceDisplayDecimals: z.number(),
  mgvTestToken: z.boolean(),
})

const MarketSchema = z.object({
  base: MarketTokenSchema,
  quote: MarketTokenSchema,
  tickSpacing: z.coerce.bigint(),
})

export const IncentiveSchema = z
  .object({
    startTimestamp: z.number(),
    endTimestamp: z.number(),
    maxRewards: z.number(),
    rewardRatePerSecond: z.number(),
    apy: z.number().transform((val) => val * 100),
    stakedTokenPrice: z.number(),
    rewardTokenPrice: z.number(),
    token: z.string(),
    tokenAddress: AddressSchema,
  })
  .transform((val) => ({
    ...val,
    rewardRate: val.rewardRatePerSecond * 3600 * 24,
  }))

const SocialsSchema = z.object({
  x: z.string(),
  website: z.string(),
})

export const VaultSchema = z.object({
  isDeprecated: z.boolean(),
  manager: z.string(),
  address: AddressSchema,
  market: MarketSchema,
  strategyType: z.string(),
  description: z.string(),
  descriptionBonus: z.string(),
  socials: SocialsSchema,
  incentives: z.array(IncentiveSchema),
})

export const VaultsResponseSchema = z.array(VaultSchema)
