import useMarket from "@/providers/market"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { useDefaultChain } from "../use-default-chain"

export enum ProtocolType {
  PancakeSwapV3 = "PancakeSwapV3",
  Slipstream = "Slipstream",
  UniswapV3 = "UniswapV3",
}

export type SlipstreamProtocol = {
  type: ProtocolType.Slipstream
  tickSpacings: number[]
  factory: Address
  quoter: Address
  router: Address
}

export type UniOrPancakeProtocol = {
  type: ProtocolType.UniswapV3 | ProtocolType.PancakeSwapV3
  fees: number[]
  factory: Address
  quoter: Address
  router: Address
}

export type Protocol = SlipstreamProtocol | UniOrPancakeProtocol

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

export type Pool = TickSpacingPool | FeePool

async function getPools(
  token0: Address,
  token1: Address,
  chainId: number,
): Promise<Pool[]> {
  const params = new URLSearchParams()
  params.set("token0", token0)
  params.set("token1", token1)
  params.set("chainId", chainId.toString())
  const data = await fetch(
    `https://pools.mgvinfra.com/pool/?${params.toString()}`,
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
