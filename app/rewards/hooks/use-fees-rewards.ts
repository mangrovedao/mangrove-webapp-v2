import { useDefaultChain } from "@/hooks/use-default-chain"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { Token } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"
import { base } from "viem/chains"
import { useAccount } from "wagmi"
import { z } from "zod"

// --------- Types ---------
const feesResponseSchema = z.object({
  leaderboard: z.array(
    z.object({
      position: z.number(),
      user: z.string(),
      rewards: z.number(),
    }),
  ),
  nPages: z.number(),
  nElements: z.number(),
  isOver: z.boolean(),
  timestamp: z.number(),
})

type FeesApiResponse = z.infer<typeof feesResponseSchema>

interface LeaderboardEntry {
  position: number
  user: string
  rewards: number
}

// --------- Constants ---------
const MULTIPLIER = 1.5
const TIME_RANGE = {
  start: 1672531200, // Jan 1, 2023
  end: () => Math.floor(Date.now() / 1000), // Current time
}

// Token budget configuration by category
enum TokenCategory {
  BTC = "BTC",
  ETH = "ETH",
  STABLECOIN = "STABLECOIN",
  OTHER = "OTHER",
}

const BUDGETS: Record<TokenCategory, number> = {
  [TokenCategory.BTC]: 2_160_000,
  [TokenCategory.ETH]: 43_200,
  [TokenCategory.STABLECOIN]: 27,
  [TokenCategory.OTHER]: 0,
}

// --------- Helper Functions ---------
/**
 * Categorize a token based on its symbol.
 * @param token The token to categorize
 * @returns The token category
 */
const categorizeToken = (token: Token): TokenCategory => {
  const symbol = token.symbol.toUpperCase()

  if (symbol.includes("BTC") || symbol.includes("CBTC")) {
    return TokenCategory.BTC
  }

  if (symbol.includes("TH")) {
    return TokenCategory.ETH
  }

  if (
    symbol.includes("USDC") ||
    symbol.includes("USDT") ||
    symbol.includes("DAI") ||
    symbol.includes("EURC")
  ) {
    return TokenCategory.STABLECOIN
  }

  return TokenCategory.OTHER
}

/**
 * Get the budget for a token on a specific chain.
 * @param token The token
 * @param chainId The chain ID
 * @returns The budget for the token
 */
const getTokenBudget = (token: Token, chainId: number): number => {
  if (chainId !== base.id) return BUDGETS[TokenCategory.OTHER]

  const category = categorizeToken(token)
  return BUDGETS[category]
}

/**
 * Fetches fee rewards data for a single token.
 * @param chainId The chain ID
 * @param token The token
 * @param budget The budget for the token
 * @param startTimestamp The start timestamp
 * @param endTimestamp The end timestamp
 * @returns The fee rewards data or null if the request fails
 */
const fetchTokenFeesData = async (
  chainId: number,
  token: Token,
  budget: number,
  startTimestamp: number,
  endTimestamp: number,
): Promise<FeesApiResponse | null> => {
  try {
    const response = await fetch(
      `${getIndexerUrl()}/incentives/fees/${chainId}/${token.address}?start=${startTimestamp}&end=${endTimestamp}&budget=${budget}&multiplier=${MULTIPLIER}`,
    )

    if (!response.ok) {
      console.warn(`Failed to fetch rewards for token ${token.symbol}`)
      return null
    }

    const data = await response.json()
    return feesResponseSchema.parse(data)
  } catch (error) {
    console.error(`Error fetching rewards for token ${token.symbol}:`, error)
    return null
  }
}

/**
 * Builds a consolidated leaderboard from multiple token responses.
 * @param responses The API responses for multiple tokens
 * @returns The consolidated leaderboard
 */
const buildConsolidatedLeaderboard = (
  responses: (FeesApiResponse | null)[],
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
 * Hook to fetch and aggregate fees rewards across tokens.
 * @returns Query result with the consolidated leaderboard
 */
export const useFeesRewards = () => {
  const { address: user } = useAccount()
  const { defaultChain } = useDefaultChain()
  const { tokens } = useOpenMarkets()

  return useQuery({
    queryKey: ["fees-rewards", defaultChain.id, user, tokens.length],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      try {
        if (!tokens.length) return []

        // Calculate budgets and filter tokens
        const tokensWithBudgets = tokens
          .map((token) => ({
            token,
            budget: getTokenBudget(token, defaultChain.id),
          }))
          .filter(({ budget }) => budget > 0)

        if (tokensWithBudgets.length === 0) {
          console.info("No tokens with budgets found for this chain")
          return []
        }

        // Fetch data for all relevant tokens in parallel
        const startTimestamp = TIME_RANGE.start
        const endTimestamp = TIME_RANGE.end()

        const responses = await Promise.all(
          tokensWithBudgets.map(({ token, budget }) =>
            fetchTokenFeesData(
              defaultChain.id,
              token,
              budget,
              startTimestamp,
              endTimestamp,
            ),
          ),
        )

        // Build and return consolidated leaderboard
        return buildConsolidatedLeaderboard(responses)
      } catch (error) {
        console.error("Error fetching fee rewards:", error)
        return []
      }
    },
    enabled: Boolean(defaultChain) && tokens.length > 0,
  })
}
