import useMarket from "@/providers/market"
import { useQuery } from "@tanstack/react-query"
import { Address, Hex } from "viem"
import { useDefaultChain } from "../use-default-chain"
import { usePools } from "./use-pools"
import { useSelectedPool } from "./use-selected-pool"
import { useEffect } from "react"

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



export function usePool() {
  const { currentMarket } = useMarket()
  const { data: pools = [], isLoading: isPoolsLoading } = usePools({
    token0: currentMarket?.base.address,
    token1: currentMarket?.quote.address,
  })
  const { setSelectedPool } = useSelectedPool()


  const best_pool =  pools.length > 0
  ? pools.sort((a, b) =>
      Number(BigInt(b.liquidity) - BigInt(a.liquidity)),
    )[0]
  : null

  useEffect(() => {
    if (best_pool) {
      setSelectedPool(best_pool)
    } 
  }, [best_pool, setSelectedPool])

  return {
    isLoading: isPoolsLoading,
    pool: best_pool,
  }
}
