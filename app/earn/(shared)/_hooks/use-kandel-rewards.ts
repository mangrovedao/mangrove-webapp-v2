import { getIndexerUrl } from "@/utils/get-indexer-url"
import { AddressSchema } from "@/utils/schema"
import { useQueries } from "@tanstack/react-query"
import { z } from "zod/v4"
import { useVaultWhiteList } from "./use-vault-whitelist"

const LeaderboardEntrySchema = z.object({
  position: z.number(),
  user: AddressSchema,
  vault: AddressSchema,
  rewards: z.number(),
  currentRewardsPerSecond: z.number(),
})

const LeaderboardSchema = z.object({
  leaderboard: z.array(LeaderboardEntrySchema),
  nPages: z.number(),
  nElements: z.number(),
  isOver: z.boolean(),
  timestamp: z.number(),
  token: z.string(),
  program: z.string(),
  vault: z.string(),
  incentiveId: z.string(),
})

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>
export type Leaderboard = z.infer<typeof LeaderboardSchema>

export function useLeaderboards() {
  const indexerUrl = getIndexerUrl()
  const { data: whitelist } = useVaultWhiteList()
  return useQueries({
    queries: (whitelist ?? []).flatMap((vault) => {
      return vault.incentives.map((incentive) => ({
        queryKey: ["leaderboard", vault.chainId, vault.address, incentive.id],
        queryFn: async () => {
          const url = new URL(
            `${indexerUrl}/incentives/vaults/${vault.chainId}/${vault.address}`,
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
            (incentive.rewardRatePerSecond * 24 * 3600).toString(),
          )
          url.searchParams.set("maxRewards", incentive.maxRewards.toString())
          url.searchParams.set("page", "0")
          url.searchParams.set("pageSize", "1000") // 1000 to get all the rewards
          const response = await fetch(url)
          const data = await response.json()
          return LeaderboardSchema.parse({
            ...data,
            token: incentive.token,
            program: incentive.name,
            vault: vault.address,
            incentiveId: incentive.id,
          })
        },
      }))
    }),
    combine(result) {
      const totals = result
        .map((r) => r.data)
        .filter(Boolean)
        .map((r) => {
          const [total, currentRewardsPerSecond] = r!.leaderboard.reduce(
            ([total, currentRewardsPerSecond], l) => {
              return [
                total + l.rewards,
                currentRewardsPerSecond + l.currentRewardsPerSecond,
              ]
            },
            [0, 0],
          )
          return { total, currentRewardsPerSecond, ...r! }
        })
      return {
        data: result
          .map((r) => r.data)
          .filter(Boolean)
          .map((r) => r!),
        totals,
        isLoading: result.some((r) => r.isLoading),
      }
    },
  })
}
