"use client"

import { PointsRow } from "@/app/rewards/types"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: { data: PointsRow[]; totalRows: number }) => T
}

export function usePoints<T = { data: PointsRow[]; totalRows: number }>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address: user } = useAccount()
  const { data, ...rest } = useQuery({
    queryKey: ["points", user, first, skip],
    queryFn: async (): Promise<{ data: PointsRow[]; totalRows: number }> => {
      try {
        const url = `https://ms1.mgvinfra.com/leaderboard?count=100&offset=${skip ?? 0}&sort=total&sort_direction=desc&include_user=${user?.toLowerCase()}`
        const { data: leaderboard, totalRows } = await fetch(url).then((res) =>
          res.json(),
        )

        const pointsData = leaderboard.map((row) => {
          return {
            address: row.account,
            totalPoints: row.total,
            tradingPoints: row.taker,
            lpPoints: row.maker,
            rank: row.rank,
            communityPoints: row.community,
          }
        })

        return { data: pointsData, totalRows }
      } catch (error) {
        console.error(error)
        return { data: [], totalRows: 0 }
      }
    },
    enabled: !!user,
    initialData: { data: [], totalRows: 0 },
  })
  return {
    data: (select ? select(data) : data) as unknown as T,
    ...rest,
  }
}
