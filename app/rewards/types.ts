import { Address } from "viem"

export type Ms2PointsRow = {
  address: string
  makerReward: number
  kandelReward: number
  takerReward: number
  vaultReward: number
  total: number
}

export type Ms1PointsRow = {
  address: Address
  rank: number
  lpPoints: number
  tradingPoints: number
  referralPoints: number
  communityPoints: number
  totalPoints: number
}
