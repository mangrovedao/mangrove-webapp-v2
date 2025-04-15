import { Address } from "viem"

export type Ms2PointsRow = {
  rank: number
  address: string
  makerReward: number
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

export type LeaderboardRow = {
  user: string
  rewards: number
}
