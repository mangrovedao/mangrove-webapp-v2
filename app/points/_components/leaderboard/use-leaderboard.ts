"use client"

import { useQuery } from "@tanstack/react-query"

import { getErrorMessage } from "@/utils/errors"
import { useAccount } from "wagmi"
import { parseLeaderboard, type Leaderboard } from "./schema"

type Params<T> = {
  filters?: {
    first?: number
    skip?: number
  }
  select?: (data: Leaderboard[]) => T
}

export function useLeaderboard<T = Leaderboard[]>({
  filters: { first = 100, skip = 0 } = {},
  select,
}: Params<T> = {}) {
  return useQuery({
    queryKey: ["leaderboard", first, skip],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LEADERBOARD_API}/incentives/leaderboard`,
        )
        const leaderboard = await res.json()
        return parseLeaderboard(leaderboard)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    select,
    meta: {
      error: "Unable to retrieve leaderboard",
    },
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useUserRank() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ["user-leaderboard", address],
    queryFn: async () => {
      try {
        if (!address) return []
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LEADERBOARD_API}/incentives/points/${address}`, // TODO: unmock with user address
        )
        const leaderboard = await res.json()
        return parseLeaderboard(leaderboard)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: "Unable to retrieve user rank data",
    },
    enabled: !!address,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
