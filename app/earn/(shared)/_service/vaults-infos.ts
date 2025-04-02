/**
 * Types and dependencies imports
 */
import {
  zeroAddress,
  type Address,
  type MulticallParameters,
  type PublicClient,
} from "viem"

import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { VaultLPProgram } from "../_hooks/use-vaults-incentives"
import { multicallSchema } from "../schemas"
import {
  VaultABI,
  calculateFees,
  fetchPnLData,
  fetchTokenPrices,
} from "../utils"
import { getVaultAPR } from "./vault-apr"
import { getUserVaultIncentives } from "./vault-incentives-rewards"

// Cache for token prices to avoid redundant fetches
const tokenPriceCache = new Map<string, [number, number]>()

// Helper for creating a consistent cache key for token pairs
const getTokenPriceCacheKey = (market: any) => `${market.base}_${market.quote}`

// Cache for APR data with TTL of 5 minutes
const aprCache = new Map<
  string,
  { data: { totalAPR: number; incentivesApr: number }; timestamp: number }
>()
const APR_CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

// ============= MAIN FUNCTION =============

/**
 * Fetches and processes information for multiple vaults
 * @param client - The web3 client used for blockchain interactions
 * @param vaults - Array of vault whitelist entries to fetch data for
 * @param user - Optional user address to fetch user-specific data
 * @returns Array of processed vault information combining whitelist and on-chain data
 */
export async function getVaultsInformation(
  client: PublicClient,
  vaults: VaultWhitelist[],
  user?: Address,
  incentives?: VaultLPProgram[],
  fdv?: number,
  incentivesRewards?: { vault: Address; total: number }[],
): Promise<(Vault & VaultWhitelist)[]> {
  // Build multicall contracts array - more efficient chunking
  const batchSize = 10 // Process vaults in batches to improve performance
  const results: any[] = []

  // Process vaults in batches
  for (let i = 0; i < vaults.length; i += batchSize) {
    const batchVaults = vaults.slice(i, i + batchSize)

    const contracts = batchVaults.flatMap(
      (v) =>
        [
          {
            address: v.address,
            abi: VaultABI,
            functionName: "getTotalInQuote",
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "getUnderlyingBalances",
          },
          { address: v.address, abi: VaultABI, functionName: "totalSupply" },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "balanceOf",
            args: [user || zeroAddress],
          },
          { address: v.address, abi: VaultABI, functionName: "feeData" },
          { address: v.address, abi: VaultABI, functionName: "market" },
          { address: v.address, abi: VaultABI, functionName: "symbol" },
          { address: v.address, abi: VaultABI, functionName: "decimals" },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "lastTotalInQuote",
          },
          { address: v.address, abi: VaultABI, functionName: "lastTimestamp" },
        ] satisfies MulticallParameters["contracts"],
    )

    const batchResult = await client.multicall({
      contracts,
      allowFailure: false,
    })
    results.push(...batchResult)
  }

  // Process each vault's data in parallel for better performance
  return Promise.all(
    vaults.map(async (v, i): Promise<Vault & VaultWhitelist> => {
      // Extract and parse multicall results
      const [
        _totalInQuote,
        _underlyingBalances,
        _totalSupply,
        _balanceOf,
        _feeData,
        _market,
        _symbol,
        _decimals,
        _lastTotalInQuote,
        _lastTimestamp,
      ] = results.slice(i * 10)

      const {
        totalInQuote,
        underlyingBalances,
        totalSupply,
        balanceOf,
        feeData,
        market,
        symbol,
        decimals,
        lastTotalInQuote,
        lastTimestamp,
      } = multicallSchema.parse({
        totalInQuote: _totalInQuote,
        underlyingBalances: _underlyingBalances,
        totalSupply: _totalSupply,
        balanceOf: _balanceOf,
        feeData: _feeData,
        market: _market,
        symbol: _symbol,
        decimals: _decimals,
        lastTotalInQuote: _lastTotalInQuote,
        lastTimestamp: _lastTimestamp,
      })

      // Check cache for token prices
      const marketCacheKey = getTokenPriceCacheKey(market)
      let baseDollarPrice = 1
      let quoteDollarPrice = 1

      const cachedPrices = tokenPriceCache.get(marketCacheKey)
      if (cachedPrices) {
        ;[baseDollarPrice, quoteDollarPrice] = cachedPrices
      } else {
        // Fetch token prices if not in cache
        ;[baseDollarPrice, quoteDollarPrice] = await fetchTokenPrices(
          client,
          market,
        )
        tokenPriceCache.set(marketCacheKey, [baseDollarPrice, quoteDollarPrice])
      }

      // Check APR cache
      const vaultAddress = v.address as Address
      const aprCacheKey = `${vaultAddress}_${client.chain?.id}_${fdv}`
      let apr = { totalAPR: 0, incentivesApr: 0 }

      const cachedApr = aprCache.get(aprCacheKey)
      const now = Date.now()

      if (cachedApr && now - cachedApr.timestamp < APR_CACHE_TTL) {
        apr = cachedApr.data
      } else {
        // Calculate APR if not in cache or cache expired
        apr = await getVaultAPR(
          client,
          vaultAddress,
          incentives?.find(
            (item) => item.vault.toLowerCase() === v.address.toLowerCase(),
          ),
          fdv,
        )

        // Cache the APR result
        aprCache.set(aprCacheKey, { data: apr, timestamp: now })
      }

      // Fetch user-specific incentives data
      const incentivesData = user
        ? await getUserVaultIncentives(
            client,
            user,
            incentives?.find(
              (item) => item.vault.toLowerCase() === v.address.toLowerCase(),
            ),
          )
        : null

      // Calculate fees and shares
      const { totalFee, newTotalSupply } = calculateFees(
        totalInQuote[0],
        lastTotalInQuote,
        lastTimestamp,
        feeData[0],
        feeData[1],
        totalSupply,
      )

      // Calculate user balances
      const userBaseBalance =
        newTotalSupply <= 0n
          ? 0n
          : (underlyingBalances[0] * balanceOf) / newTotalSupply
      const userQuoteBalance =
        newTotalSupply <= 0n
          ? 0n
          : (underlyingBalances[1] * balanceOf) / newTotalSupply

      // Calculate total and balance amounts
      const totalBase = underlyingBalances[0] || 0n
      const totalQuote = underlyingBalances[1] || 0n
      let balanceBase =
        totalSupply > 0n ? (totalBase * balanceOf) / totalSupply : 0n
      let balanceQuote =
        totalSupply > 0n ? (totalQuote * balanceOf) / totalSupply : 0n

      // Apply fee adjustments
      balanceBase -= (balanceBase * BigInt(feeData[1])) / 10_000n
      balanceQuote -= (balanceQuote * BigInt(feeData[1])) / 10_000n

      // Fetch PnL data only if user is connected and has a position
      let pnlData = undefined
      if (user && (userBaseBalance > 0n || userQuoteBalance > 0n)) {
        pnlData = await fetchPnLData(client, v.address, user)
      }

      return {
        ...v,
        symbol,
        apr: apr.totalAPR,
        incentivesApr: apr.incentivesApr,
        pnlData,
        decimals,
        mintedAmount: balanceOf,
        performanceFee: (Number(feeData[0]) / 1e5) * 100,
        managementFee: (Number(feeData[1]) / 1e5) * 100,
        totalBase,
        totalQuote,
        totalRewards:
          incentivesRewards?.find(
            (i) => i.vault.toLowerCase() === v.address.toLowerCase(),
          )?.total ?? 0,
        balanceBase,
        balanceQuote,
        chainId: client.chain?.id,
        tvl: totalInQuote[0],
        baseDollarPrice,
        quoteDollarPrice,
        strategist: v.manager,
        type: v.strategyType,
        isActive: userBaseBalance > 0n || userQuoteBalance > 0n,
        userBaseBalance,
        userQuoteBalance,
        incentivesData,
      }
    }),
  )
}
