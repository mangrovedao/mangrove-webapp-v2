import { AddressSchema } from "@/utils/schema"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { z } from "zod/v4"

const KandelAprSchema = z.object({
  kandelAddress: AddressSchema,
  apr: z.object({
    mangroveKandelAPR: z.number(),
    aaveAPR: z.number(),
    baseTokenAaveAPR: z.number(),
    quoteTokenAaveAPR: z.number(),
    baseTokenTVL: z.string(),
    quoteTokenTVL: z.string(),
    data: z.object({
      address: AddressSchema,
      baseToken: AddressSchema,
      quoteToken: AddressSchema,
      baseTokenTVL: z.string(),
      quoteTokenTVL: z.string(),
      trades: z.object({
        baseReceived: z.string(),
        quoteReceived: z.string(),
      }),
      tickOffset: z.string(),
      tick: z.string(),
      chainId: z.number(),
      type: z.string(),
    }),
  }),
  timestamp: z.number(),
})

export function useKandelApr(kandel?: Address, chainId?: number) {
  return useQuery({
    queryKey: ["kandel-apr", kandel, chainId],
    queryFn: async () => {
      if (!kandel || !chainId) {
        throw new Error("Kandel or chainId is not defined")
      }
      const url = new URL(
        `https://api.mgvinfra.com/kandel/apr/${chainId}/${kandel}`,
      )
      const response = await fetch(url)
      const data = await response.json()
      return KandelAprSchema.parse(data)
    },
    enabled: !!kandel && !!chainId,
  })
}
