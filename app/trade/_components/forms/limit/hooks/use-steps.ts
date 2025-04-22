import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, Client } from "viem"

import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useMarketClient } from "@/hooks/use-market"
import { useNetworkClient } from "@/hooks/use-network-client"
import { getUserRouter } from "@mangrovedao/mgv/actions"

type Props = {
  bs: BS
  user?: Address
}

export const useLimitSteps = ({ bs, user }: Props) => {
  const marketClient = useMarketClient()
  const addresses = useMangroveAddresses()
  const networkClient = useNetworkClient()

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "limitOrderSteps",
      bs,
      user,
      addresses,
      marketClient?.key,
      networkClient?.chain?.id,
    ],
    queryFn: async () => {
      try {
        if (!marketClient?.key || !user || !addresses) return null

        const userRouter = await getUserRouter(
          networkClient as Client,
          addresses,
          {
            user,
          },
        )

        const steps = await marketClient.getLimitOrderSteps({
          bs,
          user,
          userRouter,
        })

        return steps
      } catch (error) {
        console.error(error)
        toast.error("Error while fetching limit order steps")
      }
    },
    enabled: !!marketClient?.name,
  })
}
