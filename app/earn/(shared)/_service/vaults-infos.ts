import { VAULTS_WHITELIST } from "@/app/earn/(shared)/_hooks/use-vaults-addresses"
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"
import { useMarkets } from "@/hooks/use-addresses"
import { MarketParams } from "@mangrovedao/mgv"

import {
  isAddress,
  maxUint128,
  parseAbi,
  zeroAddress,
  type Address,
  type MulticallParameters,
  type PublicClient,
} from "viem"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import * as z from "zod"

// // Get data onchain
// const balanceOf = parseEther("1");
// const totalSupply = parseEther("10")
// // getUnderlyingBalances()
// const baseBalance = parseEther("1"); // ETH
// const quoteBalance = parseEther("3000"); // DAI
// // lastTotalInQuote()
// const lastTotalInQuote = parseEther("10000");
// // getTotalInQuote()
// const totalInQuote = lastTotalInQuote + parseEther("1000");

export const VaultABI = parseAbi([
  "function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)",
  "function totalSupply() public view returns (uint)",
  "function balanceOf(address account) public view returns (uint)",
  "function feeData() external view returns (uint16 performanceFee, uint16 managementFee, address feeRecipient)",
  "function market() external view returns (address base, address quote, uint256 tickSpacing)",
  "function getTotalInQuote() public view returns (uint256 quoteAmount, uint256 tick)",
])

const addressSchema = z.custom<Address>((v) => isAddress(v))

const multicallSchema = z.object({
  totalInQuote: z.tuple([z.bigint(), z.bigint()]),
  underlyingBalances: z.tuple([z.bigint(), z.bigint()]),
  totalSupply: z.bigint(),
  balanceOf: z.bigint(),
  feeData: z.tuple([z.number(), z.number(), z.string()]),
  market: z.tuple([z.string(), z.string(), z.bigint()]),
})

export function getChainVaults(chainId: number): VaultWhitelist[] {
  switch (chainId) {
    case blast.id:
      return VAULTS_WHITELIST
    case arbitrum.id:
      return VAULTS_WHITELIST
    case baseSepolia.id:
      return VAULTS_WHITELIST
    default:
      return []
  }
}

export async function getVaultsInformation(
  client: PublicClient,
  vaults: VaultWhitelist[],
  markets: ReturnType<typeof useMarkets>,
  user?: Address,
): Promise<(Vault & VaultWhitelist)[]> {
  const result = await client.multicall({
    contracts: vaults.flatMap(
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
          {
            address: v.address,
            abi: VaultABI,
            functionName: "totalSupply",
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "balanceOf",
            args: [user || zeroAddress],
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "feeData",
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "market",
          },
        ] satisfies MulticallParameters["contracts"],
    ),
    allowFailure: false,
  })

  return Promise.all(
    vaults.map(async (v, i): Promise<Vault & VaultWhitelist> => {
      const [
        _totalInQuote,
        _underlyingBalances,
        _totalSupply,
        _balanceOf,
        _feeData,
        _market,
      ] = result.slice(i * 6)

      const {
        totalInQuote,
        underlyingBalances,
        totalSupply,
        balanceOf,
        feeData,
        market,
      } = multicallSchema.parse({
        totalInQuote: _totalInQuote,
        underlyingBalances: _underlyingBalances,
        totalSupply: _totalSupply,
        balanceOf: _balanceOf,
        feeData: _feeData,
        market: _market,
      })

      const storageValue = await client.getStorageAt({
        address: v.address,
        slot: "0xb",
      })

      if (!storageValue) {
        throw new Error("Failed to get storage")
      }

      // lastTotalInQuote()
      const lastTotalInQuote = BigInt(storageValue) & maxUint128

      // lastTimestamp()
      const lastTimestamp = BigInt(Math.floor(Date.now() / 1000 - 100))

      // feeData()
      const performanceFee = feeData[0]
      const managementFee = feeData[1]

      // offchain calculations
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))

      // first compute interest
      const interest = totalInQuote[0] - lastTotalInQuote

      // then perf compute fees
      const performanceFeeAmount =
        interest > 0n ? (interest * BigInt(performanceFee)) / 100_000n : 0n

      // 1 year in seconds
      const ONE_YEAR_IN_SECONDS = 60n * 60n * 24n * 365n

      // then management fee
      const managementFeeAmount =
        (totalInQuote[0] *
          BigInt(managementFee) *
          (currentTimestamp - lastTimestamp)) /
        (100_000n * ONE_YEAR_IN_SECONDS)

      // total fee
      const fee = performanceFeeAmount + managementFeeAmount

      // fee shares
      const feeShares = (fee * totalSupply) / (totalInQuote[0] - fee)
      const newTotalSupply = totalSupply + feeShares

      const userBaseBalance =
        (underlyingBalances[0] * balanceOf) / newTotalSupply
      const userQuoteBalance =
        (underlyingBalances[1] * balanceOf) / newTotalSupply

      const vaultMarket = {
        base: markets.find((item) => market[0] === item.base.address)?.base,
        quote: markets.find((item) => market[1] === item.quote.address)?.quote,
        tickSpacing: market[2],
      }

      const totalBase = underlyingBalances[0] || 0n
      const totalQuote = underlyingBalances[1] || 0n
      let balanceBase =
        totalSupply > 0n ? (totalBase * balanceOf) / totalSupply : 0n
      let balanceQuote =
        totalSupply > 0n ? (totalQuote * balanceOf) / totalSupply : 0n
      balanceBase -= (balanceBase * BigInt(feeData[1])) / 10_000n
      balanceQuote -= (balanceQuote * BigInt(feeData[1])) / 10_000n

      return {
        ...v,
        performanceFee: (Number(feeData[0]) / 1e5) * 100,
        managementFee: (Number(feeData[1]) / 1e5) * 100,
        totalBase,
        totalQuote,
        balanceBase,
        balanceQuote,
        market: vaultMarket as MarketParams,
        pnl: 0,
        tvl: totalInQuote[0],
        strategist: v.manager,
        type: v.strategyType,
        isActive: userBaseBalance > 0n || userQuoteBalance > 0n,
        userBaseBalance,
        userQuoteBalance,
      }
    }),
  )
}
