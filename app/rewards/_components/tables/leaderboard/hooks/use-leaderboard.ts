"use client"

import { useFeesRewards } from "@/app/rewards/hooks/use-fees-rewards"
import { useIncentivesRewards } from "@/app/rewards/hooks/use-incentives-rewards"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"

/**
 * Type for the leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number
  address: string
  volumeRewards: number
  vaultRewards: number
  totalRewards: number
  // Formatted values for display
  formattedVolumeRewards: string
  formattedVaultRewards: string
  formattedTotalRewards: string
}

// For backward compatibility with existing Ms2PointsRow
export interface Ms2PointsRow {
  rank: number
  address: string
  makerReward: number
  takerReward: number
  vaultReward: number
  total: number
}

export type LeaderboardParams<T = LeaderboardEntry[]> = {
  filters?: {
    page?: number
    first?: number
    skip?: number
  }
  select?: (data: LeaderboardEntry[]) => T
}

/**
 * Hook to create a leaderboard combining volume rewards and vault rewards
 */
export const useLeaderboard = <T = LeaderboardEntry[]>({
  filters = {},
  select,
}: LeaderboardParams<T> = {}) => {
  const { address: userAddress } = useAccount()
  const { defaultChain } = useDefaultChain()
  const { data: feesRewards, isLoading: isLoadingFees } = useFeesRewards()
  const { data: vaultRewards, isLoading: isLoadingVaults } =
    useIncentivesRewards()

  const { skip = 0, first = 10 } = filters

  const queryResult = useQuery({
    queryKey: [
      "combined-leaderboard",
      defaultChain.id,
      userAddress,
      feesRewards?.length,
      vaultRewards?.length,
      skip,
      first,
    ],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Return empty array if neither fee rewards nor vault rewards are available
      if (
        (!feesRewards || !Array.isArray(feesRewards)) &&
        (!vaultRewards || !Array.isArray(vaultRewards))
      ) {
        return []
      }

      // Create a map to combine rewards by address
      const combinedRewardsMap: Record<
        string,
        { volumeRewards: number; vaultRewards: number }
      > = {}

      // Add volume rewards from fees (if available)
      if (feesRewards && Array.isArray(feesRewards)) {
        feesRewards.forEach((entry) => {
          const address = entry.user.toLowerCase()
          if (!combinedRewardsMap[address]) {
            combinedRewardsMap[address] = { volumeRewards: 0, vaultRewards: 0 }
          }
          // Use non-null assertion operator to tell TypeScript we know this exists
          combinedRewardsMap[address]!.volumeRewards = entry.rewards
        })
      }

      // Add vault rewards (if available)
      if (vaultRewards && Array.isArray(vaultRewards)) {
        vaultRewards.forEach((entry) => {
          const address = entry.user.toLowerCase()
          if (!combinedRewardsMap[address]) {
            combinedRewardsMap[address] = { volumeRewards: 0, vaultRewards: 0 }
          }
          // Use non-null assertion operator to tell TypeScript we know this exists
          combinedRewardsMap[address]!.vaultRewards = entry.rewards
        })
      }

      // Convert map to array and add totals
      const leaderboard = Object.entries(combinedRewardsMap).map(
        ([address, rewards]) => {
          // Convert floating-point rewards to integers by multiplying by 10^8
          // This preserves 8 decimal places of precision when formatted
          const volumeRewardsInt = Math.round(rewards.volumeRewards * 1e8)
          const vaultRewardsInt = Math.round(rewards.vaultRewards * 1e8)
          const totalRewardsInt = volumeRewardsInt + vaultRewardsInt

          return {
            address,
            volumeRewards: rewards.volumeRewards,
            vaultRewards: rewards.vaultRewards,
            totalRewards: rewards.volumeRewards + rewards.vaultRewards,
            rank: 0, // Will be assigned after sorting
            formattedVolumeRewards: formatUnits(BigInt(volumeRewardsInt), 8),
            formattedVaultRewards: formatUnits(BigInt(vaultRewardsInt), 8),
            formattedTotalRewards: formatUnits(BigInt(totalRewardsInt), 8),
          }
        },
      )

      // Sort by total rewards
      const sortedLeaderboard = [...leaderboard].sort(
        (a, b) => b.totalRewards - a.totalRewards,
      )

      // Assign ranks
      sortedLeaderboard.forEach((entry, index) => {
        entry.rank = index + 1
      })

      // Apply pagination - start with one fewer than requested to leave room for user if needed
      let paginatedLeaderboard = sortedLeaderboard.slice(skip, skip + first)

      // If the user is connected, find their entry in the full leaderboard
      if (userAddress) {
        const userEntry = sortedLeaderboard.find(
          (entry) => entry.address.toLowerCase() === userAddress.toLowerCase(),
        )

        if (userEntry) {
          // Check if user is already in paginated results
          const userIndexInPaginated = paginatedLeaderboard.findIndex(
            (entry) =>
              entry.address.toLowerCase() === userAddress.toLowerCase(),
          )

          if (userIndexInPaginated !== -1) {
            // User is in the results, remove them from their current position
            paginatedLeaderboard.splice(userIndexInPaginated, 1)
          } else if (paginatedLeaderboard.length === first) {
            // User not in results and results are full, remove the last item
            paginatedLeaderboard.pop()
          }

          // Add user to the top
          paginatedLeaderboard = [userEntry, ...paginatedLeaderboard]
        }
      }

      return paginatedLeaderboard
    },
    enabled: (!isLoadingFees || !isLoadingVaults) && !!defaultChain,
  })

  // Apply selector if provided, otherwise return the data as is
  return {
    ...queryResult,
    data:
      select && queryResult.data
        ? select(queryResult.data)
        : (queryResult.data as unknown as T),
  }
}
