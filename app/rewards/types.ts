import { Address } from "viem"

export type PointsRow = {
  address: Address
  rank: number
  lpPoints: number
  tradingPoints: number
  referralPoints: number
  communityPoints: number
  totalPoints: number
}
