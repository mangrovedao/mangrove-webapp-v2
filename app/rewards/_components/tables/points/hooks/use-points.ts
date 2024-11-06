"use client"

import { PointsRow } from "@/app/rewards/types"
import { useQuery } from "@tanstack/react-query"
import { Address, isAddress } from "viem"
import { useAccount } from "wagmi"
import * as z from "zod"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: { data: PointsRow[]; totalRows: number }) => T
}
const addressSchema = z.custom<Address>((v) => isAddress(v))
const leaderboardSchema = z.object({
  account: z.union([addressSchema, z.string()]),
  total: z.number(),
  taker: z.number(),
  maker: z.number(),
  rank: z.number(),
  community: z.number(),
})
type LeaderboardRow = z.infer<typeof leaderboardSchema>

export function usePoints<T = { data: PointsRow[]; totalRows: number }>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address: user } = useAccount()

  const { data, ...rest } = useQuery({
    queryKey: ["points", user, first, skip],
    queryFn: async (): Promise<{ data: PointsRow[]; totalRows: number }> => {
      try {
        if (!user) {
          return {
            data: [],
            totalRows: 0,
          }
        }
        console.log("filters", user, first, skip)
        const url = `https://ms1.mgvinfra.com/leaderboard?count=100&offset=${skip ?? 0}&sort=total&sort_direction=desc&include_user=${user?.toLowerCase()}`
        const { data: leaderboard, totalRows } = await fetch(url).then((res) =>
          res.json(),
        )

        const pointsData = leaderboard.map((row: LeaderboardRow) => {
          const parsedRow = leaderboardSchema.parse(row)
          return {
            address: parsedRow.account,
            totalPoints: parsedRow.total,
            tradingPoints: parsedRow.taker,
            lpPoints: parsedRow.maker,
            rank: parsedRow.rank,
            referralPoints: 0,
            communityPoints: parsedRow.community,
          }
        })
        return { data: pointsData, totalRows }

        const fakeData = Array.from({ length: 20 }, (_, i) => ({
          address: `0x${Math.random().toString(16).slice(2, 42)}` as Address,
          totalPoints: Math.floor(Math.random() * 1000000),
          tradingPoints: Math.floor(Math.random() * 500000),
          lpPoints: Math.floor(Math.random() * 300000),
          rank: i + 1,
          referralPoints: Math.floor(Math.random() * 100000),
          communityPoints: Math.floor(Math.random() * 100000),
        }))
        return { data: fakeData, totalRows: 100 }
      } catch (error) {
        return { data: [], totalRows: 0 }
      }
    },
    enabled: !!user,
  })
  return {
    data: data ?? { data: [], totalRows: 0 },
    ...rest,
  }
}
