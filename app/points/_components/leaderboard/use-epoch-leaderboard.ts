"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { env } from "@/env.mjs"
import { getErrorMessage } from "@/utils/errors"
import { parseEpochLeaderboard } from "../../schemas/epoch-history"

export type Epoch = "1"

type Params = {
  epoch?: Epoch
  filters?: {
    first?: number
    skip?: number
  }
}

export function useEpochLeaderboard({
  epoch = "1",
  filters: { first = 10, skip = 0 } = {},
}: Params = {}) {
  return useQuery({
    queryKey: ["epoch-leaderboard", first, skip, epoch],
    queryFn: async () => {
      try {
        const res = await fetch(
          `${env.NEXT_PUBLIC_MANGROVE_JSON_SERVER_HOST}/epoch-${epoch}?_start=${skip}&_limit=${first}`,
        )
        const leaderboard = await res.json()
        return parseEpochLeaderboard(leaderboard)
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error()
      }
    },
    meta: {
      error: `Unable to retrieve epoch-${epoch} leaderboard`,
    },
    retry: false,
    staleTime: Infinity, // 1 minute
    placeholderData: keepPreviousData,
  })
}
