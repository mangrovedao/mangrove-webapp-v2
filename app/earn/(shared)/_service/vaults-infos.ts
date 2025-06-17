/**
 * Types and dependencies imports
 */
import {
  zeroAddress,
  type Address,
  type MulticallParameters,
  type PublicClient,
} from "viem"

import { kandelSchema, multicallSchema } from "../schemas"
import { CompleteVault, VaultList } from "../types"
import {
  calculateFees,
  fetchPnLData,
  fetchTokenPrices,
  VaultABI,
} from "../utils"
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
  vaults: VaultList[],
  user?: Address,
  incentivesRewards?: { vault: Address; total: number }[],
): Promise<CompleteVault[]> {
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

  // Step 4: Process Kandel APR calculations in parallel for all vaults
  const kandelAprPromises = vaults.map(async (v, i) => {
    const vaultAddress = v.address as Address

    try {
      // Get kandel address from multicall results
      const kandelResult = results[i * 11 + 10] // kandel is the 11th call (index 10)
      const kandelAddress = kandelResult.result as Address

      if (
        !kandelAddress ||
        kandelAddress === "0x0000000000000000000000000000000000000000"
      ) {
        return { address: vaultAddress, kandelApr: 0 }
      }

      const apiAPR = await fetch(
        `https://api.mgvinfra.com/kandel/apr/${client.chain?.id}/${kandelAddress}`,
      )

      if (!apiAPR.ok) {
        return { address: vaultAddress, kandelApr: 0 }
      }

      const kandelData = await apiAPR.json()
      const parsedKandelData = kandelSchema.parse(kandelData)
      const { mangroveKandelAPR, aaveAPR } = parsedKandelData.apr
      const apr = (mangroveKandelAPR + aaveAPR) * 100

      return { address: vaultAddress, kandelApr: apr }
    } catch (e) {
      console.error(`Failed to get Kandel APR for ${vaultAddress}:`, e)
      return { address: vaultAddress, kandelApr: 0 }
    }
  })

  // Wait for all Kandel APR calculations to complete
  const kandelAprResults = await Promise.all(kandelAprPromises)

  // Step 5: Process all vaults data in parallel with optimizations
  return Promise.all(
    vaults.map(async (v, i): Promise<CompleteVault> => {
      // Extract and parse multicall results (11 calls per vault)
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
        _kandel,
      ] = results.slice(i * 11)

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
        kandel,
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
        kandel: _kandel.result,
      })

      // Get token prices from cache
      const basePriceKey = `${v.market.base.address}_${client.chain?.id}`
      const quotePriceKey = `${v.market.quote.address}_${client.chain?.id}`

      const baseDollarPrice = tokenPriceCache.get(basePriceKey) || 1
      const quoteDollarPrice = tokenPriceCache.get(quotePriceKey) || 1

      // Get Kandel APR from parallel calculation
      const kandelApr = kandelAprResults[i]?.kandelApr || 0

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
      const hasPosition = userBaseBalance > 0n || userQuoteBalance > 0n

      // Create result without expensive operations
      const result: CompleteVault = {
        ...v,
        totalInQuote: totalInQuote[0],
        underlyingBalances,
        symbol,
        lastTotalInQuote,
        lastTimestamp,
        totalSupply,
        balanceOf,
        feeData: feeData.map((f) => BigInt(f)),
        kandelApr,
        kandel: kandel as Address,
        decimals,
        mintedAmount: balanceOf,
        performanceFee: (Number(feeData[0]) / 1e5) * 100,
        managementFee: (Number(feeData[1]) / 1e5) * 100,
        totalBase,
        totalQuote,
        totalRewards:
          incentivesRewards && Array.isArray(incentivesRewards)
            ? (incentivesRewards.find(
                (i) => i.vault.toLowerCase() === v.address.toLowerCase(),
              )?.total ?? 0)
            : 0,
        balanceBase,
        balanceQuote,
        tvl: totalInQuote[0],
        baseDollarPrice,
        quoteDollarPrice,
        hasPosition,
        userBaseBalance,
        userQuoteBalance,
        pnlData: null,
        incentivesData: null,
      }

      // Fetch user-specific incentives data
      try {
        result.incentivesData = await getUserVaultIncentives(
          client,
          v.address,
          user,
          v.incentives,
        )
      } catch (e) {
        console.error(`Failed to fetch incentives for ${v.address}:`, e)
      }

      // Only fetch PnL data if user is connected and has a position (do this last as it's expensive)
      if (user && hasPosition) {
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
      }

      return result
    }),
  )
}
