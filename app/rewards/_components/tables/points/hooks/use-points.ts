"use client"

import { PointsRow } from "@/app/rewards/types"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: PointsRow[]) => T
}

export function usePoints<T = PointsRow[]>({
  filters: { first = 10, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  const { address: user } = useAccount()
  const { data, ...rest } = useQuery({
    queryKey: ["points", user, first, skip],
    queryFn: async (): Promise<PointsRow[]> => {
      try {
        const { leaderboard } = await fetch(
          "https://points.mgvinfra.com/42161/maker-leaderboard",
        ).then((res) => res.json())

        const pointsData = await Promise.all(
          leaderboard.map(async (item: any, i) => {
            const tradingPoints = await fetch(
              `https://points.mgvinfra.com/42161/${item.makerAddress}/taker`,
            )
              .then((res) => res.json())
              .then((x) => x.takerRewardTotal.value.replace("n", ""))
            return {
              address: item.makerAddress,
              tradingPoints,
              lpPoints: item.reward,
              rank: i + 1,
              totalPoints: (
                BigInt(tradingPoints) + BigInt(item.reward)
              ).toString(),
            }
          }),
        )

        return pointsData
      } catch (error) {
        console.error(error)
        return []
      }
    },
    enabled: !!user,
    initialData: [],
  })
  return {
    data: (select ? select(data) : data) as unknown as T,
    ...rest,
  }
}
