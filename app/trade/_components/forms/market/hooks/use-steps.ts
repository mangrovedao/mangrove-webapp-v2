import { Token } from "@mangrovedao/mgv"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, parseUnits } from "viem"

import { useMarketClient } from "@/hooks/use-market"

type Props = {
  bs: BS
  user?: Address
  sendAmount?: string
  sendToken?: Token | null
}

export const useMarketSteps = ({ bs, user, sendAmount, sendToken }: Props) => {
  const marketClient = useMarketClient()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["marketOrderSteps", bs, user, marketClient?.name],
    queryFn: async () => {
      try {
        if (!marketClient?.name || !user || !sendAmount || !sendToken)
          throw new Error("Market order steps missing params")

        const steps = await marketClient.getMarketOrderSteps({
          bs,
          user,
          sendAmount: parseUnits(sendAmount, sendToken.decimals),
        })

        return steps
      } catch (error) {
        console.error(error)
        toast.error("Error while fetching market order steps")
      }
    },
    enabled: !!marketClient?.name,
  })
}
