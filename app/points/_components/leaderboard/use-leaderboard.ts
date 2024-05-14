"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { getErrorMessage } from "@/utils/errors"
import { parseLeaderboard } from "../../schemas/leaderboard"
import { parseVolume } from "../../schemas/volume"


type Params = {
  filters?: {
    first?: number
    skip?: number
  }
}

export function useLeaderboard({
  filters: { first = 100, skip = 0 } = {},
}: Params = {}) {
  return useQuery({
    queryKey: ["leaderboard", first, skip],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/incentives/leaderboard?offset=${skip}&limit=${first}`,
        )
        const leaderboard = await res.json()
        return parseLeaderboard(leaderboard)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: "Unable to retrieve leaderboard",
    },
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    placeholderData: keepPreviousData,
  })
}

export function useUserVolume() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ["user-volume", address],
    queryFn: async () => {
      try {
        if (!address) return null
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/volumes-per-pair/last-epoch-volume/${address}`,
        )
        const volume = await res.json()
        return parseVolume(volume)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: "Unable to retrieve user volume data",
    },
    enabled: !!address,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}