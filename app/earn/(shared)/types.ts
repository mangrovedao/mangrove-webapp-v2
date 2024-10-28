import { MarketParams } from "@mangrovedao/mgv"
import { Address } from "viem"

export type VaultWhitelist = {
  manager: string
  address: Address
  description: string
  descriptionBonus: string
  strategyType: string
}

export type Vault = {
  symbol: string
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
  pnl: number
  tvl: bigint
  strategist: string
  type: string
  isActive: boolean
  userBaseBalance: bigint
  userQuoteBalance: bigint
}
