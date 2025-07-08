import { AddressSchema } from "@/utils/schema"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { useChainId } from "wagmi"
import { z } from "zod/v4"
import { useSelectedPool } from "./use-selected-pool"


const UniswapV3ProtocolSchema = z.object({
  type: z.literal("UNISWAP_V3"),
  factory: AddressSchema,
  router: AddressSchema,
  quoter: AddressSchema,
  fees: z.array(z.number()),
})

const SlipstreamProtocolSchema = z.object({
  type: z.literal("Slipstream"),
  factory: AddressSchema,
  router: AddressSchema,
  quoter: AddressSchema,
  tickSpacings: z.array(z.number()),
})

const JellyVerseV2ProtocolSchema = z.object({
  type: z.literal("JELLYVERSE_V2"),
  vault: AddressSchema,
  poolIds: z.array(z.string()),
})

const BasePoolSchema = z.object({
  token0Balance: z.string(),
  token1Balance: z.string(),
  liquidity: z.string(),
})

const UniswapV3PoolSchema = BasePoolSchema.extend({
  protocol: UniswapV3ProtocolSchema,
  fee: z.number(),
  pool: AddressSchema,
})

const SlipstreamPoolSchema = BasePoolSchema.extend({
  protocol: SlipstreamProtocolSchema,
  tickSpacing: z.number(),
  pool: AddressSchema,
})

const JellyVerseV2PoolSchema = BasePoolSchema.extend({
  protocol: JellyVerseV2ProtocolSchema,
  poolId: z.string(),
  tokens: z.array(AddressSchema),
})

export const PoolSchema = z.discriminatedUnion("protocol.type", [
  UniswapV3PoolSchema,
  SlipstreamPoolSchema,
  JellyVerseV2PoolSchema,
])

export type UniswapV3Pool = z.infer<typeof UniswapV3PoolSchema>
export type SlipstreamPool = z.infer<typeof SlipstreamPoolSchema>
export type JellyVerseV2Pool = z.infer<typeof JellyVerseV2PoolSchema>
export type Pool = z.infer<typeof PoolSchema>

type UsePoolProps = {
  token0?: Address
  token1?: Address
}

export function usePools({ token0, token1 }: UsePoolProps) {
  const chainId = useChainId()
  return useQuery({
    queryKey: ["pools", token0, token1, chainId],
    queryFn: async () => {
      if (!token0 || !token1) return []
      const url = new URL("https://api.mgvinfra.com/pool-finder/pool")
      url.searchParams.set("tokenIn", token0)
      url.searchParams.set("tokenOut", token1)
      url.searchParams.set("chainId", chainId.toString())
      const response = await fetch(url)
      const data = await response.json()

      return data as Pool[]
    },
  })
}
