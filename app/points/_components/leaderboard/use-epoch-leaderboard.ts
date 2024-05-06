import { env } from "@/env.mjs"
import { getErrorMessage } from "@/utils/errors"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { parseEpochLeaderboard } from "../../schemas/epoch-history"
import { parseLeaderboard } from "../../schemas/leaderboard"

type Params = {
  epoch: "total" | `epoch-${number}`
  account?: string
  filters?: {
    first?: number
    skip?: number
  }
}

export function useEpochLeaderboard({
  epoch,
  account,
  filters: { first = 10, skip = 0 } = {},
}: Params) {
  return useQuery({
    queryKey: ["epoch-leaderboard", first, skip, epoch, account],
    queryFn: async () => {
      try {
        let url = `${env.NEXT_PUBLIC_MANGROVE_JSON_SERVER_HOST}/${epoch}?_start=${skip}&_limit=${first}`
        if (account) {
          url += `&account=${account}`
        }
        const res = await fetch(url)
        const leaderboard = await res.json()
        const totalCount = res.headers.get("X-Total-Count")
        return {
          leaderboard:
            epoch === "total"
              ? parseLeaderboard(leaderboard)
              : parseEpochLeaderboard(leaderboard),
          totalCount,
        }
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
