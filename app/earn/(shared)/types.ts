import { MarketParams, Token } from "@mangrovedao/mgv"
import { Address } from "viem"

export type VaultWhitelist = {
  isDeprecated?: boolean
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
  market: string
  manager: string
  isDeprecated: boolean
  base: Token
  quote: Token
  apr: number
  tvl: bigint
  address: Address
  strategyType: string
}

// export type Vault = {
//   symbol: string
//   incentivesData?: z.infer<typeof incentiveResponseSchema> | null
//   incentivesApr: number
//   apr: number
//   chainId?: number
//   decimals: number
//   mintedAmount: bigint
//   managementFee: number
//   totalRewards: number
//   performanceFee: number
//   address: Address
//   market: MarketParams
//   totalBase: bigint
//   totalQuote: bigint
//   balanceBase: bigint
//   balanceQuote: bigint
//   pnlData?: z.infer<typeof pnlSchema>
//   tvl: bigint
//   baseDollarPrice: number
//   quoteDollarPrice: number
//   strategist: string
//   type: string
//   isActive: boolean
//   userBaseBalance: bigint
//   userQuoteBalance: bigint
// }
