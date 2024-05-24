import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address } from "viem"

import { useMarketClient } from "@/hooks/use-market"

type Props = {
  bs: BS
  user?: Address
  sendAmount?: string
}

export const useMarketSteps = ({ bs, user, sendAmount }: Props) => {
  const marketClient = useMarketClient()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["spenderAddress", bs, user, marketClient],
    queryFn: async () => {
      try {
        if (!marketClient || !user || !sendAmount)
          throw new Error("Market order steps missing params")

        const steps = await marketClient.getMarketOrderSteps({
          bs,
          user,
          sendAmount: BigInt(sendAmount),
        })

        return steps
      } catch (error) {
        console.error(error)
        toast.error("Error while fetching market order steps")
      }
    },
    enabled: !!marketClient,
  })
}
