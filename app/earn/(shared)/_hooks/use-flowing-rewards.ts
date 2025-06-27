import { useQueries } from "@tanstack/react-query"
import { Address } from "viem"
import { z } from "zod/v4"

import { getIndexerUrl } from "@/utils/get-indexer-url"
import { AddressSchema } from "@/utils/schema"
import { Incentive } from "./use-vault-whitelist"

const RewardsSchema = z.object({
  vault: AddressSchema,
  rewards: z.number(),
  currentRewardsPerSecond: z.number(),
  timestamp: z.number(),
  token: z.string(),
})

export type Rewards = z.infer<typeof RewardsSchema>

export function useFlowingRewards(
  vault?: Address,
  user?: Address,
  chainId?: number,
  incentivesPrograms?: Incentive[],
) {
  const indexerUrl = getIndexerUrl()
  return useQueries({
    queries:
      incentivesPrograms?.map((incentive) => ({
        queryKey: ["rewards", vault, user, incentive, indexerUrl, chainId],
        queryFn: async () => {
          if (!vault || !user || !chainId) {
            throw new Error("Vault, user and chainId are required")
          }
          const url = new URL(
            `${indexerUrl}/incentives/vaults/${chainId}/${vault}/${user}`,
          )
          url.searchParams.set(
            "startTimestamp",
            incentive.startTimestamp.toString(),
          )
          url.searchParams.set(
            "endTimestamp",
            incentive.endTimestamp.toString(),
          )
          url.searchParams.set(
            "rewardRate",
            (incentive.rewardRatePerSecond * 3600 * 24).toString(),
          )
          url.searchParams.set("maxRewards", incentive.maxRewards.toString())
          const response = await fetch(url)
          const data = await response.json()
          return RewardsSchema.parse({ ...data, token: incentive.token })
        },
        enabled: !!user && !!vault && !!chainId,
      })) ?? [],
    combine(results) {
      return {
        data: results.filter(Boolean).map((result) => result.data!),
        isLoading: results.some((result) => result.isLoading),
        subscribe: (callback: (data: Record<string, number>) => void) => {
          const abortController = new AbortController()
          function update() {
            if (abortController.signal.aborted) return
            const currentSeconds = Date.now() / 1000
            const currentPerToken = results.reduce(
              (acc, result) => {
                if (!result.data) return acc
                if (!acc[result.data.token]) {
                  acc[result.data.token] = 0
                }

                // @ts-expect-error
                acc[result.data.token] +=
                  result.data.rewards +
                  result.data.currentRewardsPerSecond *
                    (currentSeconds - result.data.timestamp)
                return acc
              },
              {} as Record<string, number>,
            )
            callback(currentPerToken)
            requestAnimationFrame(update)
          }
          update()
          return () => abortController.abort()
        },
      }
    },
  })
}
