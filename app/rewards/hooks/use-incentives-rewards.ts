import { Address } from "viem"
import { useAccount } from "wagmi"
import { z } from "zod"

import { useVaultsIncentives } from "@/app/earn/(shared)/_hooks/use-vaults-incentives"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getChainObjectById } from "@/utils/chains"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { useQuery } from "@tanstack/react-query"

// --------- Types ---------
const vaultIncentivesResponseSchema = z.object({
  leaderboard: z.array(
    z.object({
      position: z.number(),
      user: z.string(),
      vault: z.string(),
      rewards: z.number(),
      currentRewardsPerSecond: z.number(),
    }),
  ),
  nPages: z.number(),
  nElements: z.number(),
  isOver: z.boolean(),
  timestamp: z.number(),
})

type VaultIncentivesApiResponse = z.infer<typeof vaultIncentivesResponseSchema>

interface LeaderboardEntry {
  position: number
  user: string
  vault: string
  rewards: number
}

// --------- Constants ---------
const TIME_RANGE = {
  start: 1672531200, // Jan 1, 2023
  end: () => Math.floor(Date.now() / 1000), // Current time
}

// --------- Helper Functions ---------

/**
 * Fetches vault incentives data for a single vault.
 * @param chainId The chain ID
 * @param vaultAddress The vault address
 * @param startTimestamp The start timestamp
 * @param endTimestamp The end timestamp
 * @param rewardRate The reward rate
 * @param maxRewards The maximum rewards
 * @returns The vault incentives data or null if the request fails
 */
const fetchVaultIncentivesData = async (
  chainId: number,
  vaultAddress: Address,
  startTimestamp: number,
  endTimestamp: number,
  rewardRate: number,
  maxRewards: number,
): Promise<VaultIncentivesApiResponse | null> => {
  try {
    const url = `${getIndexerUrl(getChainObjectById(chainId.toString()))}/incentives/vaults/${chainId}/${vaultAddress}?startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}&rewardRate=${rewardRate}&maxRewards=${maxRewards}&page=0&pageSize=100`

    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Failed to fetch incentives for vault ${vaultAddress}`)
      return null
    }

    const data = await response.json()
    return vaultIncentivesResponseSchema.parse(data)
  } catch (error) {
    console.error(`Error fetching incentives for vault ${vaultAddress}:`, error)
    return null
  }
}

/**
 * Builds a consolidated leaderboard from multiple vault responses.
 * @param responses The API responses for multiple vaults
 * @returns The consolidated leaderboard
 */
const buildConsolidatedLeaderboard = (
  responses: (VaultIncentivesApiResponse | null)[],
): LeaderboardEntry[] => {
  // Aggregate rewards by user
  const userRewardsMap: Record<string, number> = {}

  responses.forEach((response) => {
    if (!response) return

    response.leaderboard.forEach((entry) => {
      userRewardsMap[entry.user] =
        (userRewardsMap[entry.user] || 0) + entry.rewards
    })
  })

  // Create sorted leaderboard array
  const leaderboard = Object.entries(userRewardsMap)
    .map(
      ([user, rewards]): LeaderboardEntry => ({
        user,
        vault: "", // Combined across all vaults, so no specific vault
        rewards,
        position: 0, // Temporary placeholder
      }),
    )
    .sort((a, b) => b.rewards - a.rewards)

  // Assign positions
  leaderboard.forEach((entry, index) => {
    entry.position = index + 1
  })

  return leaderboard
}

// --------- Hook ---------
/**
 * Hook to fetch and aggregate vault incentives across all vaults.
 * @returns Query result with the consolidated leaderboard
 */
export const useIncentivesRewards = () => {
  const { address: user } = useAccount()
  const { defaultChain } = useDefaultChain()
  const vaultIncentives = useVaultsIncentives()

  return useQuery({
    queryKey: [
      "incentives-rewards",
      vaultIncentives.length,
      defaultChain.id,
      user,
    ],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      try {
        if (!vaultIncentives.length) {
          console.info("No vault incentives found for this chain")
          return []
        }

        // Fetch data for all vaults in parallel
        const responses = await Promise.all(
          vaultIncentives.map((incentive) =>
            fetchVaultIncentivesData(
              defaultChain.id,
              incentive.vault as Address,
              incentive.startTimestamp,
              incentive.endTimestamp,
              incentive.rewardRate,
              incentive.maxRewards,
            ),
          ),
        )

        // Build and return consolidated leaderboard
        return buildConsolidatedLeaderboard(responses)
      } catch (error) {
        console.error("Error fetching vault incentives:", error)
        return []
      }
    },
    enabled: Boolean(defaultChain) && vaultIncentives.length > 0,
  })
}
