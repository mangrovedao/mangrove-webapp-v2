"use client"

/**
 * Types and dependencies imports
 */
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import {
  zeroAddress,
  type Address,
  type MulticallParameters,
  type PublicClient,
} from "viem"
import { VaultLPProgram } from "../_hooks/use-vaults-incentives"
import { multicallSchema } from "../schemas"
import {
  VaultABI,
  calculateFees,
  fetchPnLData,
  fetchTokenPrices,
} from "../utils"
import { getVaultAPR } from "./vault-apr"
import { getVaultIncentives } from "./vault-incentives-rewards"
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
  incentives?: VaultLPProgram,
): Promise<(Vault & VaultWhitelist)[]> {
  // Build multicall contracts array
  const contracts = vaults.flatMap(
    (v) =>
      [
        { address: v.address, abi: VaultABI, functionName: "getTotalInQuote" },
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
        { address: v.address, abi: VaultABI, functionName: "lastTotalInQuote" },
        { address: v.address, abi: VaultABI, functionName: "lastTimestamp" },
      ] satisfies MulticallParameters["contracts"],
  )

  const result = await client.multicall({ contracts, allowFailure: false })

  // Process each vault's data
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
      ] = result.slice(i * 10)

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

      // Parallel fetches
      const [
        [baseDollarPrice, quoteDollarPrice] = [1, 1],
        pnlData = undefined,
        apr = { totalAPR: 0, incentivesApr: 0 },
        incentivesData = null,
      ] = await Promise.all([
        fetchTokenPrices(client, market),
        fetchPnLData(client, v.address, user),
        getVaultAPR(client, v.address as Address, incentives),
        getVaultIncentives(client, user, incentives),
      ])

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
