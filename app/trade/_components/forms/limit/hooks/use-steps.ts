import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, Client } from "viem"

import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useBalances } from "@/hooks/use-balances"
import { useMarketClient } from "@/hooks/use-market"
import { useNetworkClient } from "@/hooks/use-network-client"
import { getUserRouter } from "@mangrovedao/mgv/actions"

type Props = {
  bs: BS
  user?: Address
  logic?: string
}

export const useLimitSteps = ({ bs, user, logic }: Props) => {
  const marketClient = useMarketClient()
  const balances = useBalances()
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
        if (!marketClient?.name || !user || !addresses) return null
        console.log("marketClient?.key", {
          bs,
          user,
          addresses,
          marketClient: marketClient?.key,
          networkClient: networkClient?.chain?.id,
        })
        const userRouter = await getUserRouter(
          networkClient as Client,
          addresses,
          {
            user,
          },
        )

        const logicToken = balances.balances?.overlying.find(
          (item) => item.logic.name === logic,
        )

        const steps = await marketClient.getLimitOrderSteps({
          bs,
          user,
          userRouter,
          logic: logicToken,
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
