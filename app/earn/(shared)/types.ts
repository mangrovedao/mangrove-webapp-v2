import { incentiveResponseSchema } from "@/app/rewards/schemas/rewards-configuration"
import { MarketParams } from "@mangrovedao/mgv"
import { Address } from "viem"
import { z } from "zod"
import { pnlSchema } from "./schemas"

export type VaultWhitelist = {
  manager: string
  address: Address
  description: string
  descriptionBonus: string
  strategyType: string
  market: MarketParams
  socials: {
    x: string
    website: string
  }
}

export type Vault = {
  symbol: string
  incentivesData?: z.infer<typeof incentiveResponseSchema> | null
  incentivesApr: number
  apr: number
  chainId?: number
  decimals: number
  mintedAmount: bigint
  managementFee: number
  totalRewards: number
  performanceFee: number
  address: Address
  market: MarketParams
  totalBase: bigint
  totalQuote: bigint
  balanceBase: bigint
  balanceQuote: bigint
  pnlData?: z.infer<typeof pnlSchema>
  tvl: bigint
  baseDollarPrice: number
  quoteDollarPrice: number
  strategist: string
  type: string
  isActive: boolean
  userBaseBalance: bigint
  userQuoteBalance: bigint
}
