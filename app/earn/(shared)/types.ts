import { MarketParams } from "@mangrovedao/mgv"
import { Address } from "viem"

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
  apr?: number
  pnlData?: {
    currentShares: number
    pnl: number
    realizedPnl: number
  }
  chainId?: number
  decimals: number
  mintedAmount: bigint
  managementFee: number
  performanceFee: number
  address: Address
  market: MarketParams
  totalBase: bigint
  totalQuote: bigint
  balanceBase: bigint
  balanceQuote: bigint
  tvl: bigint
  baseDollarPrice: number
  quoteDollarPrice: number
  strategist: string
  type: string
  isActive: boolean
  userBaseBalance: bigint
  userQuoteBalance: bigint
}
