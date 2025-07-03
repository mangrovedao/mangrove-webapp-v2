import useMarket from "@/providers/market"
import { useQuery } from "@tanstack/react-query"
import { Address, Hex } from "viem"
import { useDefaultChain } from "../use-default-chain"

export enum ProtocolType {
  PancakeSwapV3 = "PancakeSwapV3",
  Slipstream = "Slipstream",
  UniswapV3 = "UniswapV3",
  UniswapV2 = "UniswapV2",
  JellyverseV2 = "JELLYVERSE_V2",
}

export type SlipstreamProtocol = {
  type: ProtocolType.Slipstream
  tickSpacings: number[]
  factory: Address
  quoter: Address
  router: Address
}

export type UniOrPancakeProtocol = {
  type:
    | ProtocolType.UniswapV3
    | ProtocolType.PancakeSwapV3
    | ProtocolType.UniswapV2
  fees: number[]
  factory: Address
  quoter: Address
  router: Address
}

export type JellyverseV2Protocol = {
  type: ProtocolType.JellyverseV2
  vault: Address
  poolIds: Hex[]
}

export type Protocol =
  | SlipstreamProtocol
  | UniOrPancakeProtocol
  | JellyverseV2Protocol

export interface TickSpacingPool {
  tickSpacing: number
  protocol: SlipstreamProtocol
  pool: Address
  token0Balance: string
  token1Balance: string
  liquidity: string
}

export interface FeePool {
  fee: number
  protocol: UniOrPancakeProtocol
  pool: Address
  token0Balance: string
  token1Balance: string
  liquidity: string
}

export interface JellyverseV2Pool {
  tickSpacing: number
  protocol: JellyverseV2Protocol
  pool: Address
  poolId: Hex
  token0Balance: string
  token1Balance: string
  liquidity: string // TODO: verify this is correct
}

export type Pool = TickSpacingPool | FeePool | JellyverseV2Pool

async function getPools(
  tokenIn: Address,
  tokenOut: Address,
  chainId: number,
): Promise<Pool[]> {
  const params = new URLSearchParams()
  params.set("tokenIn", tokenIn)
  params.set("tokenOut", tokenOut)
  params.set("chainId", chainId.toString())
  const data = await fetch(
    `https://api.mgvinfra.com/pool-finder/pool?${params.toString()}`,
  )

  return data.json() as Promise<Pool[]>
}

export function usePools() {
  const { defaultChain } = useDefaultChain()
  const { currentMarket: market } = useMarket()

  return useQuery({
    queryKey: [
      "pools",
      defaultChain?.id,
      market?.base.address,
      market?.quote.address,
    ],
    queryFn: async (): Promise<Pool[]> => {
      if (!market || defaultChain.testnet) return []

      try {
        return getPools(
          market.base.address,
          market.quote.address,
          defaultChain?.id,
        )
      } catch (error) {
        return []
      }
    },
  })
}

export function usePool() {
  const { data: pools = [], isLoading: isPoolsLoading } = usePools()

  return {
    isLoading: isPoolsLoading,
    pool:
      pools.length > 0
        ? pools.sort((a, b) =>
            Number(BigInt(b.liquidity) - BigInt(a.liquidity)),
          )[0]
        : null,
  }
}
