"use client"
import { Vault, VaultWhitelist } from "@/app/earn/(shared)/types"

import {
  parseAbi,
  zeroAddress,
  type Address,
  type MulticallParameters,
  type PublicClient,
} from "viem"
import * as z from "zod"
import { getVaultAPR } from "../../[address]/_service/vault"

export const VaultABI = parseAbi([
  "function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)",
  "function totalSupply() public view returns (uint)",
  "function balanceOf(address account) public view returns (uint)",
  "function feeData() external view returns (uint16 performanceFee, uint16 managementFee, address feeRecipient)",
  "function market() external view returns (address base, address quote, uint256 tickSpacing)",
  "function getTotalInQuote() public view returns (uint256 quoteAmount, uint256 tick)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)",
  "function lastTotalInQuote() public view returns (uint256)",
  "function lastTimestamp() public view returns (uint256)",
])

// const addressSchema = z.custom<Address>((v) => isAddress(v))

const multicallSchema = z.object({
  totalInQuote: z.tuple([z.bigint(), z.bigint()]),
  underlyingBalances: z.tuple([z.bigint(), z.bigint()]),
  totalSupply: z.bigint(),
  balanceOf: z.bigint(),
  feeData: z.tuple([z.number(), z.number(), z.string()]),
  market: z.tuple([z.string(), z.string(), z.bigint()]),
  symbol: z.string(),
  decimals: z.number(),
  lastTotalInQuote: z.bigint(),
  lastTimestamp: z.bigint(),
})

const priceSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  symbol: z.string(),
})

export async function getVaultsInformation(
  client: PublicClient,
  vaults: VaultWhitelist[],
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
          {
            address: v.address,
            abi: VaultABI,
            functionName: "symbol",
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "decimals",
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "lastTotalInQuote",
          },
          {
            address: v.address,
            abi: VaultABI,
            functionName: "lastTimestamp",
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

      const [baseDollarPrice, quoteDollarPrice] = await Promise.all([
        fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${client.chain?.id}&address=${market[0]}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))
          .then((data) => data.price)
          .catch(() => 1),
        fetch(
          `https://price.mgvinfra.com/price-by-address?chain=${client.chain?.id}&address=${market[1]}`,
        )
          .then((res) => res.json())
          .then((data) => priceSchema.parse(data))
          .then((data) => data.price)
          .catch(() => 1),
      ])

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
      const feeShares =
        totalInQuote[0] <= 0n
          ? 0n
          : (fee * totalSupply) / (totalInQuote[0] - fee)
      const newTotalSupply = totalSupply + feeShares

      const userBaseBalance =
        newTotalSupply <= 0n
          ? 0n
          : (underlyingBalances[0] * balanceOf) / newTotalSupply
      const userQuoteBalance =
        newTotalSupply <= 0n
          ? 0n
          : (underlyingBalances[1] * balanceOf) / newTotalSupply

      const totalBase = underlyingBalances[0] || 0n
      const totalQuote = underlyingBalances[1] || 0n
      let balanceBase =
        totalSupply > 0n ? (totalBase * balanceOf) / totalSupply : 0n
      let balanceQuote =
        totalSupply > 0n ? (totalQuote * balanceOf) / totalSupply : 0n
      balanceBase -= (balanceBase * BigInt(feeData[1])) / 10_000n
      balanceQuote -= (balanceQuote * BigInt(feeData[1])) / 10_000n

      const apr = await getVaultAPR(client, v.address as Address)

      return {
        ...v,
        symbol,
        apr,
        decimals,
        mintedAmount: balanceOf,
        performanceFee: (Number(feeData[0]) / 1e5) * 100,
        managementFee: (Number(feeData[1]) / 1e5) * 100,
        totalBase,
        totalQuote,
        balanceBase,
        balanceQuote,
        pnl: 0,
        chainId: client.chain?.id,
        tvl: totalInQuote[0],
        baseDollarPrice,
        quoteDollarPrice,
        strategist: v.manager,
        type: v.strategyType,
        isActive: userBaseBalance > 0n || userQuoteBalance > 0n,
        userBaseBalance,
        userQuoteBalance,
      }
    }),
  )
}
