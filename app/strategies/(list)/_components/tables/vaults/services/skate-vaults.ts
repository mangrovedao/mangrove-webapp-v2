import type { Vault, VaultInfos } from "@/app/strategies/(list)/_schemas/vaults"
import { blastMarkets } from "@mangrovedao/mgv/addresses"
import {
  isAddress,
  isAddressEqual,
  parseAbi,
  zeroAddress,
  type Address,
  type MulticallParameters,
  type PublicClient,
} from "viem"
import { blast } from "viem/chains"
import * as z from "zod"
export const skateVaultABI = parseAbi([
  "function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)",
  "function totalSupply() public view returns (uint)",
  "function balanceOf(address account) public view returns (uint)",
  "function managingFee() public view returns (uint)",
  "function token0() public view returns (address)",
  "function token1() public view returns (address)",
])

const addressSchema = z.custom<Address>((v) => isAddress(v))

const multicallSchema = z.object({
  underlyingBalances: z.bigint().array().length(2).readonly(),
  totalSupply: z.bigint(),
  balanceOf: z.bigint(),
  managingFee: z.bigint(),
  token0: addressSchema,
  token1: addressSchema,
})

export function getChainVaults(chainId: number): VaultInfos[] {
  switch (chainId) {
    case blast.id:
      return [
        {
          address: "0xbC766847aB3b36F7012037f11Cd05B187F51Fc23",
          kandel: "0x2341561eaC01D79e184eaCF09f380EB8A0e3408b",
          market: blastMarkets[0],
          strategist: "Skate.fi",
        },
      ]
    default:
      return []
  }
}

export async function getVaultsInformation(
  client: PublicClient,
  vaults: VaultInfos[],
  user?: Address,
): Promise<Vault[]> {
  const result = await client.multicall({
    contracts: vaults.flatMap(
      (v) =>
        [
          {
            address: v.address,
            abi: skateVaultABI,
            functionName: "getUnderlyingBalances",
          },
          {
            address: v.address,
            abi: skateVaultABI,
            functionName: "totalSupply",
          },
          {
            address: v.address,
            abi: skateVaultABI,
            functionName: "balanceOf",
            args: [user || zeroAddress],
          },
          {
            address: v.address,
            abi: skateVaultABI,
            functionName: "managingFee",
          },
          {
            address: v.address,
            abi: skateVaultABI,
            functionName: "token0",
          },
          {
            address: v.address,
            abi: skateVaultABI,
            functionName: "token1",
          },
        ] satisfies MulticallParameters["contracts"],
    ),
    allowFailure: false,
  })

  return vaults.map((v, i): Vault => {
    const [
      _underlyingBalances,
      _totalSupply,
      _balanceOf,
      _managingFee,
      _token0,
      _token1,
    ] = result.slice(i * 6)

    const { underlyingBalances, totalSupply, balanceOf, managingFee, token0 } =
      multicallSchema.parse({
        underlyingBalances: _underlyingBalances,
        totalSupply: _totalSupply,
        balanceOf: _balanceOf,
        managingFee: _managingFee,
        token0: _token0,
        token1: _token1,
      })

    const isBaseToken0 = isAddressEqual(
      token0 as Address,
      v.market.base.address,
    )

    const totalBase =
      (isBaseToken0 ? underlyingBalances[0] : underlyingBalances[1]) || 0n
    const totalQuote =
      (isBaseToken0 ? underlyingBalances[1] : underlyingBalances[0]) || 0n
    let balanceBase =
      totalSupply > 0n ? (totalBase * balanceOf) / totalSupply : 0n
    let balanceQuote =
      totalSupply > 0n ? (totalQuote * balanceOf) / totalSupply : 0n
    balanceBase -= (balanceBase * managingFee) / 10_000n
    balanceQuote -= (balanceQuote * managingFee) / 10_000n

    // const baseTotal

    return {
      ...v,
      fees: Number(managingFee) / 10_000,
      totalBase,
      totalQuote,
      balanceBase,
      balanceQuote,
      pnl: 0,
      baseIsToken0: isBaseToken0,
    }
  })
}
