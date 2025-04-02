"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

/**
 * Type definition for pool data returned from the API
 */
interface PoolData {
  tokenOut: string
  tokenIn: string
  chainId: number
  pools: Array<{
    address: string
    fee: number
    liquidity: string
    sqrtPriceX96: string
    tick: number
    token0: string
    token1: string
  }>
}

/**
 * Hook to fetch pool data from the Mangrove pools API
 */
export function usePools({
  tokenOut,
  tokenIn,
  chainId,
}: {
  tokenOut: string
  tokenIn: string
  chainId: number
}) {
  const { chain } = useAccount()

  return useQuery<PoolData>({
    queryKey: ["pools", tokenOut, tokenIn, chainId || chain?.id],
    queryFn: async () => {
      const response = await fetch(
        `https://pools.mgvinfra.com/pool?tokenOut=${tokenOut}&tokenIn=${tokenIn}&chainId=${
          chainId || chain?.id
        }`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch pool data")
      }

      return await response.json()
    },
    enabled: !!(tokenOut && tokenIn && (chainId || chain?.id)),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
}
