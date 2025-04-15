"use client"

import { useFeesRewards } from "@/app/rewards/hooks/use-fees-rewards"
import { useIncentivesRewards } from "@/app/rewards/hooks/use-incentives-rewards"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { getExactWeiAmount } from "@/utils/regexp"
import { useInfiniteQuery } from "@tanstack/react-query"
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

// Define the leaderboard page type
type LeaderboardPage = {
  data: LeaderboardEntry[]
  meta: {
    hasNextPage: boolean
    page: number
  }
}

export type LeaderboardParams<T = LeaderboardEntry[]> = {
  pageSize?: number
  select?: (data: LeaderboardEntry[]) => T
}

/**
 * Hook to create a leaderboard combining volume rewards and vault rewards
 */
export const useLeaderboard = <T = LeaderboardEntry[]>({
  pageSize = 10,
  select,
}: LeaderboardParams<T> = {}) => {
  const { address: userAddress } = useAccount()
  const { defaultChain } = useDefaultChain()
  const { data: feesRewards, isLoading: isLoadingFees } = useFeesRewards()
  const { data: vaultRewards, isLoading: isLoadingVaults } =
    useIncentivesRewards()

  return useInfiniteQuery<LeaderboardPage, Error, T>({
    queryKey: [
      "combined-leaderboard",
      defaultChain.id,
      userAddress,
      feesRewards?.length,
      vaultRewards?.length,
      pageSize,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      // Return empty array if neither fee rewards nor vault rewards are available
      if (
        (!feesRewards || !Array.isArray(feesRewards)) &&
        (!vaultRewards || !Array.isArray(vaultRewards))
      ) {
        return {
          data: [],
          meta: {
            hasNextPage: false,
            page: pageParam as number,
          },
        }
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
          return {
            address,
            volumeRewards: rewards.volumeRewards,
            vaultRewards: rewards.vaultRewards,
            totalRewards: rewards.volumeRewards + rewards.vaultRewards,
            rank: 0, // Will be assigned after sorting
            formattedVolumeRewards: getExactWeiAmount(
              rewards.volumeRewards.toString(),
              8,
            ),
            formattedVaultRewards: getExactWeiAmount(
              rewards.vaultRewards.toString(),
              8,
            ),
            formattedTotalRewards: getExactWeiAmount(
              (rewards.volumeRewards + rewards.vaultRewards).toString(),
              8,
            ),
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

      // Find the user entry in the complete sorted leaderboard
      let userEntry = undefined
      if (userAddress) {
        userEntry = sortedLeaderboard.find(
          (entry) => entry.address.toLowerCase() === userAddress.toLowerCase(),
        )
      }

      // If this is the first page and we found the user, ensure they appear first
      if (pageParam === 0 && userEntry && userAddress) {
        // Create a new array without the user entry
        const leaderboardWithoutUser = sortedLeaderboard.filter(
          (entry) => entry.address.toLowerCase() !== userAddress.toLowerCase(),
        )

        // Create a paginated array starting with the user followed by other entries
        const start = (pageParam as number) * pageSize
        const end = start + pageSize - 1 // Subtract 1 to make room for the user entry

        let pageData = [userEntry, ...leaderboardWithoutUser.slice(start, end)]

        return {
          data: pageData,
          meta: {
            hasNextPage: end < leaderboardWithoutUser.length,
            page: pageParam as number,
          },
        }
      } else {
        // Process normal paging for other pages
        const start = (pageParam as number) * pageSize
        const end = start + pageSize
        const pageData = sortedLeaderboard.slice(start, end)

        return {
          data: pageData,
          meta: {
            hasNextPage: end < sortedLeaderboard.length,
            page: pageParam as number,
          },
        }
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) return undefined
      return lastPage.meta.page + 1
    },
    enabled: (!isLoadingFees || !isLoadingVaults) && !!defaultChain,
    select: (data) => {
      // Apply custom selector if provided, otherwise flatten pages
      if (select) {
        const flatData = data.pages.flatMap((page) => page.data)
        return select(flatData) as T
      }

      // Default behavior: flatten pages
      return {
        ...data,
        pages: data.pages,
        flattened: data.pages.flatMap((page) => page.data),
      } as unknown as T
    },
  })
}
