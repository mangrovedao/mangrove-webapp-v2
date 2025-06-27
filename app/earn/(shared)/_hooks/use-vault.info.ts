import { AddressSchema } from "@/utils/schema"
import { useMemo } from "react"
import {
  Address,
  erc20Abi,
  parseAbi,
  ReadContractParameters,
  zeroAddress,
} from "viem"
import { useAccount, useReadContracts } from "wagmi"
import { z } from "zod/v4"
import { useVaultWhiteList } from "./use-vault-whitelist"

const abi = parseAbi([
  "function kandel() view returns (address)",
  "function getUnderlyingBalances() public view returns (uint256 baseAmount, uint256 quoteAmount)",
  "function getTotalInQuote() public view returns (uint256 quoteAmount, int256 tick)",
  "function feeData() external view returns (uint16 performanceFee, uint16 managementFee, address feeRecipient)",
])

const RawInfosSchema = z
  .object({
    kandel: AddressSchema,
    supply: z.bigint(),
    balance: z.bigint(),
    balances: z.tuple([z.bigint(), z.bigint()]),
    totalInQuoteAndTick: z.tuple([z.bigint(), z.bigint()]),
    feeData: z.tuple([z.bigint(), z.bigint(), AddressSchema]),
  })
  .transform((data) => ({
    ...data,
    totalInQuote: data.totalInQuoteAndTick[0],
    tick: data.totalInQuoteAndTick[1],
  }))

export type VaultInfos = {
  vault: Address
  kandel: Address
  userBaseBalance: bigint
  userQuoteBalance: bigint
  userBalance: bigint
  TVL: bigint
  performanceFee: number
  managementFee: number
}

const QUERIES_PER_VAULT = 6

export function useVaultsInfos(vaults: Address[], user?: Address) {
  return useReadContracts({
    contracts: vaults.flatMap(
      (vault) =>
        [
          {
            address: vault,
            abi,
            functionName: "kandel",
          },
          {
            address: vault,
            abi: erc20Abi,
            functionName: "totalSupply",
          },
          {
            address: vault,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [user ?? zeroAddress],
          },
          {
            address: vault,
            abi,
            functionName: "getUnderlyingBalances",
          },
          {
            address: vault,
            abi,
            functionName: "getTotalInQuote",
          },
          { address: vault, abi, functionName: "feeData" },
        ] as const satisfies ReadContractParameters[],
    ),
    query: {
      enabled: !!user,
      select(data) {
        const vaultsInfos: VaultInfos[] = []
        for (let i = 0; i < data.length; i += QUERIES_PER_VAULT) {
          const [
            kandel,
            totalSupply,
            balance,
            balances,
            totalInQuote,
            feeData,
          ] = data.slice(i, i + QUERIES_PER_VAULT)
          if (
            kandel?.status === "failure" ||
            totalSupply?.status === "failure" ||
            balance?.status === "failure" ||
            balances?.status === "failure" ||
            totalInQuote?.status === "failure" ||
            feeData?.status === "failure"
          ) {
            console.error(
              `Error while fetching vault infos for ${
                vaults[i / QUERIES_PER_VAULT]
              }`,
            )
            continue
          }
          const rawInfos = RawInfosSchema.parse({
            kandel: kandel?.result,
            supply: totalSupply?.result,
            balance: balance?.result,
            balances: balances?.result,
            totalInQuoteAndTick: totalInQuote?.result,
            feeData: feeData?.result,
          })
          const userBaseBalance =
            (rawInfos.balances[0] * rawInfos.balance) / rawInfos.supply
          const userQuoteBalance =
            (rawInfos.balances[1] * rawInfos.balance) / rawInfos.supply

          vaultsInfos.push({
            vault: vaults[i / QUERIES_PER_VAULT] as Address,
            kandel: rawInfos.kandel,
            userBaseBalance,
            userQuoteBalance,
            userBalance: rawInfos.balance,
            TVL: rawInfos.totalInQuote,
            performanceFee: (Number(rawInfos.feeData[0]) / 1e5) * 100,
            managementFee: (Number(rawInfos.feeData[1]) / 1e5) * 100,
          })
        }
        return vaultsInfos
      },
    },
  })
}

export function useCurrentVaultsInfos() {
  const whitelist = useVaultWhiteList()
  const { address } = useAccount()
  const vaults = useMemo(
    () => whitelist.data?.map((vault) => vault.address) ?? [],
    [whitelist.data],
  )
  return useVaultsInfos(vaults, address)
}
