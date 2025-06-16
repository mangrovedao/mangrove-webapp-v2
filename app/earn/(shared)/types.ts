import { incentiveResponseSchema } from "@/app/rewards/schemas/rewards-configuration"
import { Address } from "viem"
import { z } from "zod"
import { IncentiveSchema, pnlSchema, VaultSchema } from "./schemas"

// export type VaultWhitelist = {
//   isDeprecated?: boolean
//   manager: string
//   address: Address
//   oracle: Address
//   description: string
//   descriptionBonus: string
//   strategyType: string
//   market: MarketParams
//   socials: {
//     x: string
//     website: string
//   }
// }

// export type Vault = {
//   symbol: string
//   incentivesData?: z.infer<typeof incentiveResponseSchema> | null
//   incentivesApr: number
//   apr: number
//   chainId?: number
//   deprecated?: boolean
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
//   kandel: Address
// }

export type VaultMulticall = {
  totalInQuote: bigint
  underlyingBalances: bigint[]
  totalSupply: bigint
  balanceOf: bigint
  feeData: bigint[]
  symbol: string
  decimals: number
  lastTotalInQuote: bigint
  lastTimestamp: bigint
  kandel: Address
  kandelApr?: number
  mintedAmount?: bigint
  performanceFee?: number
  managementFee?: number
  totalBase?: bigint
  totalQuote?: bigint
  balanceBase?: bigint
  balanceQuote?: bigint
  tvl?: bigint
  baseDollarPrice?: number
  quoteDollarPrice?: number
  hasPosition?: boolean
  userBaseBalance?: bigint
  userQuoteBalance?: bigint
  pnlData?: z.infer<typeof pnlSchema> | null
  incentivesData?: z.infer<typeof incentiveResponseSchema> | null
  totalRewards?: number
}

export type VaultList = Omit<z.infer<typeof VaultSchema>, "incentives"> & {
  incentives?: z.infer<typeof IncentiveSchema> | undefined
}

export type VaultIncentive = z.infer<typeof IncentiveSchema>

export type CompleteVault = VaultList & VaultMulticall
