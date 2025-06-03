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

// Cache with TTL implementation
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class TimedCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  private ttl: number

  constructor(ttl: number) {
    this.ttl = ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    const now = Date.now()

    if (entry && now - entry.timestamp < this.ttl) {
      return entry.data
    }

    if (entry) {
      this.cache.delete(key) // Clean expired entries
    }

    return undefined
  }

  set(key: K, value: V): void {
    this.cache.set(key, { data: value, timestamp: Date.now() })
  }

  // Clear entire cache
  clear(): void {
    this.cache.clear()
  }
}

// Cache instances with different TTLs for different data types
const aprCache = new TimedCache<
  string,
  { totalAPR: number; incentivesApr: number }
>(5 * 60 * 1000) // 5 minutes
const tokenPriceCache = new TimedCache<string, number>(10 * 60 * 1000) // 10 minutes
const pnlCache = new TimedCache<string, any>(2 * 60 * 1000) // 2 minutes

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
  if (!vaults.length) return []

  // Step 1: Efficiently collect all unique markets first to batch token price fetching
  const uniqueMarkets = new Map()
  vaults.forEach((v) => {
    const marketKey = `${v.market.base.address}_${v.market.quote.address}`
    uniqueMarkets.set(marketKey, v.market)
  })

  // Step 2: Prefetch all token prices in parallel
  const pricePromises: Promise<[string, number]>[] = []
  uniqueMarkets.forEach((market, key) => {
    // Check if base price is cached
    const basePriceKey = `${market.base.address}_${client.chain?.id}`
    if (!tokenPriceCache.get(basePriceKey)) {
      pricePromises.push(
        fetchTokenPrices(client, market).then(([basePrice, quotePrice]) => [
          basePriceKey,
          basePrice,
        ]),
      )
    }

    // Check if quote price is cached
    const quotePriceKey = `${market.quote.address}_${client.chain?.id}`
    if (!tokenPriceCache.get(quotePriceKey)) {
      pricePromises.push(
        fetchTokenPrices(client, market).then(([basePrice, quotePrice]) => [
          quotePriceKey,
          quotePrice,
        ]),
      )
    }
  })

  // Fetch all prices in parallel and update cache
  if (pricePromises.length) {
    ;(await Promise.allSettled(pricePromises)).forEach((result) => {
      if (result.status === "fulfilled") {
        const [key, price] = result.value
        tokenPriceCache.set(key, price)
      }
    })
  }

  // Step 3: Build optimized multicall - use larger batch size for simple read operations
  const batchSize = 25 // Increased batch size for better throughput
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
          { address: v.address, abi: VaultABI, functionName: "kandel" },
        ] satisfies MulticallParameters["contracts"],
    )

    // Use Promise.allSettled to handle errors gracefully in multicalls
    const batchResult = await client.multicall({
      contracts,
      allowFailure: true, // Changed to true for more resilience
    })

    results.push(...batchResult)
  }

  // Step 4: Process APR calculations in parallel for all vaults
  const aprPromises = vaults.map(async (v) => {
    const vaultAddress = v.address as Address
    const aprCacheKey = `${vaultAddress}_${client.chain?.id}_${fdv}`

    const cachedApr = aprCache.get(aprCacheKey)
    if (cachedApr) return { address: vaultAddress, apr: cachedApr }

    // Calculate if not in cache
    try {
      const apr = await getVaultAPR(
        client,
        vaultAddress,
        incentives?.find(
          (item) => item.vault.toLowerCase() === v.address.toLowerCase(),
        ),
        fdv,
      )
      aprCache.set(aprCacheKey, apr)
      return { address: vaultAddress, apr }
    } catch (e) {
      console.error(`Failed to get APR for ${vaultAddress}:`, e)
      return { address: vaultAddress, apr: { totalAPR: 0, incentivesApr: 0 } }
    }
  })

  // Wait for all APR calculations to complete
  const aprResults = await Promise.allSettled(aprPromises)
  const aprMap = new Map<string, { totalAPR: number; incentivesApr: number }>()

  aprResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      aprMap.set(result.value.address, result.value.apr)
    } else {
      const vaultAddress = vaults[index]?.address || "unknown"
      aprMap.set(vaultAddress, { totalAPR: 0, incentivesApr: 0 })
    }
  })

  // Step 5: Process all vaults data in parallel with optimizations
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

      // Handle potential failures in multicall
      if (!_totalInQuote.result || !_underlyingBalances.result) {
        // Return default stub data for failed vault queries
        return {
          ...v,
          symbol: "",
          apr: 0,
          incentivesApr: 0,
          decimals: 18,
          mintedAmount: 0n,
          managementFee: 0,
          performanceFee: 0,
          isDeprecated: true,
          totalBase: 0n,
          totalQuote: 0n,
          totalRewards: 0,
          balanceBase: 0n,
          balanceQuote: 0n,
          chainId: client.chain?.id,
          tvl: 0n,
          baseDollarPrice: 0,
          quoteDollarPrice: 0,
          strategist: v.manager,
          type: v.strategyType,
          isActive: false,
          userBaseBalance: 0n,
          userQuoteBalance: 0n,
        }
      }

      // Safely extract data from results
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
        totalInQuote: _totalInQuote.result,
        underlyingBalances: _underlyingBalances.result,
        totalSupply: _totalSupply.result,
        balanceOf: _balanceOf.result,
        feeData: _feeData.result,
        market: _market.result,
        symbol: _symbol.result,
        decimals: _decimals.result,
        lastTotalInQuote: _lastTotalInQuote.result,
        lastTimestamp: _lastTimestamp.result,
      })

      // Get token prices from cache
      const basePriceKey = `${v.market.base.address}_${client.chain?.id}`
      const quotePriceKey = `${v.market.quote.address}_${client.chain?.id}`

      const baseDollarPrice = tokenPriceCache.get(basePriceKey) || 1
      const quoteDollarPrice = tokenPriceCache.get(quotePriceKey) || 1

      // Get APR from parallel calculation
      const apr = aprMap.get(v.address) || { totalAPR: 0, incentivesApr: 0 }

      // Calculate basic vault data
      const totalBase = underlyingBalances[0] || 0n
      const totalQuote = underlyingBalances[1] || 0n
      let balanceBase =
        totalSupply > 0n ? (totalBase * balanceOf) / totalSupply : 0n
      let balanceQuote =
        totalSupply > 0n ? (totalQuote * balanceOf) / totalSupply : 0n

      // Apply fee adjustments
      balanceBase -= (balanceBase * BigInt(feeData[1])) / 10_000n
      balanceQuote -= (balanceQuote * BigInt(feeData[1])) / 10_000n

      // Calculate user balances
      const { totalFee, newTotalSupply } = calculateFees(
        totalInQuote[0],
        lastTotalInQuote,
        lastTimestamp,
        feeData[0],
        feeData[1],
        totalSupply,
      )

      const userBaseBalance =
        newTotalSupply <= 0n
          ? 0n
          : (underlyingBalances[0] * balanceOf) / newTotalSupply
      const userQuoteBalance =
        newTotalSupply <= 0n
          ? 0n
          : (underlyingBalances[1] * balanceOf) / newTotalSupply
      const isActive = userBaseBalance > 0n || userQuoteBalance > 0n

      // Create result without expensive operations
      const result: Vault & VaultWhitelist = {
        ...v,
        symbol,
        apr: apr.totalAPR,
        incentivesApr: apr.incentivesApr,
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
        isActive,
        userBaseBalance,
        deprecated: v.isDeprecated,
        userQuoteBalance,
        pnlData: undefined,
        incentivesData: null,
      }

      // Only fetch PnL data if user is connected and has a position (do this last as it's expensive)
      if (user && isActive) {
        // Check PnL cache
        const pnlCacheKey = `${v.address}_${user}_${client.chain?.id}`
        let pnlData = pnlCache.get(pnlCacheKey)

        if (!pnlData) {
          try {
            pnlData = await fetchPnLData(client, v.address, user)
            if (pnlData) {
              pnlCache.set(pnlCacheKey, pnlData)
              result.pnlData = pnlData
            }
          } catch (e) {
            console.error(`Failed to fetch PnL data for ${v.address}:`, e)
          }
        } else {
          result.pnlData = pnlData
        }

        // Fetch user-specific incentives data
        try {
          result.incentivesData = await getUserVaultIncentives(
            client,
            user,
            incentives?.find(
              (item) => item.vault.toLowerCase() === v.address.toLowerCase(),
            ),
          )
        } catch (e) {
          console.error(`Failed to fetch incentives for ${v.address}:`, e)
        }
      }

      return result
    }),
  )
}
