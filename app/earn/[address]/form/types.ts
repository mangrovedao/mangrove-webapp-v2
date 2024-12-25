import { MarketParams } from "@mangrovedao/mgv"
import { Address } from "viem"

export type VaultInfos = {
  address: Address
  kandel: Address
  market: MarketParams
  strategist: string
}

export type Vault = {
  address: Address
  kandel: Address
  market: MarketParams
  fees: number
  totalBase: bigint
  totalQuote: bigint
  balanceBase: bigint
  balanceQuote: bigint
  pnl: number
  strategist: string
  baseIsToken0: boolean
}
