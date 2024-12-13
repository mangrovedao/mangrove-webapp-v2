"use client"

import { Ms1PointsRow } from "@/app/rewards/types"
import { useQuery } from "@tanstack/react-query"
import { Address, isAddress } from "viem"
import { useAccount } from "wagmi"
import * as z from "zod"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Ms1PointsRow[]) => T
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

export function useMs1Points<T = Ms1PointsRow[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address: user, chainId } = useAccount()

  const { data, ...rest } = useQuery({
    queryKey: ["ms1-points", user, first, skip],
    queryFn: async (): Promise<Ms1PointsRow[]> => {
      try {
        const url = `https://ms1.mgvinfra.com/leaderboard?count=1000000&offset=${skip}&sort=total&sort_direction=desc&include_user=${user?.toLowerCase()}`
        const { data: leaderboard, totalRows } = await fetch(url).then((res) =>
          res.json(),
        )

        const pointsData: Ms1PointsRow[] = leaderboard.map(
          (row: LeaderboardRow) => {
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
          },
        )

        // Move user's row to the front if it exists
        const userAddress = user?.toLowerCase()
        if (userAddress) {
          const userPoints = pointsData.find((row) => {
            const rowAddress =
              typeof row.address === "string"
                ? row.address.toLowerCase()
                : row.address
            return rowAddress === userAddress
          })

          if (userPoints) {
            pointsData.unshift(userPoints)
          }
        }
        return pointsData
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!user,
  })
  return {
    data: (select
      ? select(data ?? ([] as Ms1PointsRow[]))
      : data) as unknown as T,
    ...rest,
  }
}
