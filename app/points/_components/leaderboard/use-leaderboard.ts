"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { getErrorMessage } from "@/utils/errors"
import { parseBoosts } from "../../schemas/boosts"
import { parseLeaderboard } from "../../schemas/leaderboard"
import { parsePoints } from "../../schemas/points"

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

export function useUserPoints() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ["user-points", address],
    queryFn: async () => {
      try {
        if (!address) return null
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/incentives/points/${address}`,
        )
        const points = await res.json()
        return parsePoints(points)
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

export function useUserBoosts() {
  const { address } = useAccount()
  return useQuery({
    queryKey: ["user-boosts", address],
    queryFn: async () => {
      try {
        if (!address) return null
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_MANGROVE_DATA_API_HOST}/incentives/boosts/${address}`,
        )
        const boosts = await res.json()
        return parseBoosts(boosts)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: "Unable to retrieve user boosts data",
    },
    enabled: !!address,
    retry: false,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
