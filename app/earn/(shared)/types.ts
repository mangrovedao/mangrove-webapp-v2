import { userIncentiveResponseSchema } from "@/app/rewards/schemas/rewards-configuration"
import { Address } from "viem"
import { z } from "zod"
import { IncentiveSchema, pnlSchema, VaultSchema } from "./schemas"

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
  userIncentives?: z.infer<typeof userIncentiveResponseSchema> | null
}

export type VaultList = Omit<z.infer<typeof VaultSchema>, "incentives"> & {
  incentives?: z.infer<typeof IncentiveSchema> | undefined
}

export type VaultIncentive = z.infer<typeof IncentiveSchema>

export type CompleteVault = VaultList & VaultMulticall
