import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address } from "viem"

import { useBalances } from "@/hooks/use-balances"
import { useMarketClient } from "@/hooks/use-market"
import { useSpenderAddress } from "../../hooks/use-spender-address"

type Props = {
  bs: BS
  user?: Address
  userRouter?: Address
  logic?: string
}

export const useLimitSteps = ({ bs, user, logic }: Props) => {
  const marketClient = useMarketClient()
  const balances = useBalances()
  const { data: userRouter } = useSpenderAddress("limit")

  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["limitOrderSteps", bs, user, userRouter, marketClient?.name],
    queryFn: async () => {
      try {
        if (!marketClient?.name || !user || !userRouter)
          throw new Error("Limit order steps missing params")

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
        console.log(error)
        toast.error("Error while fetching limit order steps")
      }
    },
    enabled: !!marketClient?.name,
  })
}
