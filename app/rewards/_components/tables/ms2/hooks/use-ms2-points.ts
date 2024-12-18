"use client"

import { Ms2PointsRow } from "@/app/rewards/types"
import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import * as z from "zod"

type Params<T> = {
  filters?: {
    page?: number
    first?: number
    skip?: number
    epochId?: number
  }
  select?: (data: Ms2PointsRow[]) => T
}

const leaderboardResponseSchema = z.object({
  chainId: z.number(),
  decimals: z.object({
    reward: z.number(),
  }),
  epochs: z.array(z.number()),
  page: z.number(),
  leaderboard: z.array(
    z.object({
      address: z.string(),
      makerReward: z.string(),
      takerReward: z.string(),
      vaultReward: z.string(),
      total: z.string(),
    }),
  ),
})

export function useMs2Points<T = Ms2PointsRow[]>({
  filters: { first = 10, skip = 0, epochId, page = 1 } = {},
  select,
}: Params<T> = {}) {
  const { address: user, chainId } = useAccount()
  const defaultChainId = chainId ?? arbitrum.id

  const { data, ...rest } = useQuery({
    queryKey: ["ms2-points", user, defaultChainId, epochId, first, skip],
    queryFn: async (): Promise<Ms2PointsRow[]> => {
      try {
        const url = `https://points.mgvinfra.com/${defaultChainId}/leaderboard?epoch=${[epochId]}&page=${page}`
        const response = await fetch(url)
        const leaderboard = leaderboardResponseSchema
          .parse(await response.json())
          .leaderboard.map((row) => ({
            makerReward: Number(
              formatUnits(BigInt(row.makerReward.replace("n", "")), 8),
            ),
            takerReward: Number(
              formatUnits(BigInt(row.takerReward.replace("n", "")), 8),
            ),
            vaultReward: Number(
              formatUnits(BigInt(row.vaultReward.replace("n", "")), 8),
            ),
            address: row.address,
            total: Number(formatUnits(BigInt(row.total.replace("n", "")), 8)),
          }))
        console.log(leaderboard)
        // Sort leaderboard by total rewards and add rank
        const rankedLeaderboard = leaderboard
          .sort((a, b) => b.total - a.total)
          .map((row, index) => ({
            ...row,
            rank: index + 1,
          }))

        let filteredLeaderBoard = rankedLeaderboard

        // Move user's row to the front if it exists
        const userAddress = user?.toLowerCase()
        if (userAddress) {
          const userPoints = rankedLeaderboard.find((row, index) => {
            if (index > 2) {
              const rowAddress = row.address.toLowerCase()
              return rowAddress === userAddress
            }
          })

          if (userPoints) {
            // Sort by total points in descending order
            rankedLeaderboard.sort((a, b) => Number(b.total) - Number(a.total))
            // Move user to front of array
            filteredLeaderBoard = [
              userPoints,
              ...rankedLeaderboard.filter(
                (row) => row.address.toLowerCase() !== userAddress,
              ),
            ]
          }
        }

        return skip === 0
          ? filteredLeaderBoard
          : filteredLeaderBoard.slice(skip, skip + first)
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!defaultChainId,
  })
  return {
    data: (select
      ? select(data ?? ([] as Ms2PointsRow[]))
      : data) as unknown as T,
    ...rest,
  }
}
