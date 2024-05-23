import { useLogics, useMangroveAddresses } from "@/hooks/use-addresses"
import { useBalances } from "@/hooks/use-balances"
import { useGeneralClient } from "@/hooks/use-client"
import { useMarketClient } from "@/hooks/use-market"
import { BS } from "@mangrovedao/mgv/lib"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
type Props = {
  bs: BS
  user?: Address
  userRouter?: Address
  logic?: string
}

export const useLimitSteps = ({ bs, user, userRouter, logic }: Props) => {
  const addresses = useMangroveAddresses()
  const marketClient = useMarketClient()
  const generalClient = useGeneralClient()
  const logics = useLogics()
  const balances = useBalances()
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["spenderAddress", bs, user, userRouter, marketClient],
    queryFn: async () => {
      if (!marketClient || !user || !userRouter) return

      if (logic && logics && generalClient) {
        const logicToken = balances.balances?.overlying.find(
          (item) => item.logic.name === logic,
        )

        if (!logicToken) return

        const steps = await marketClient.getLimitOrderSteps({
          bs,
          user,
          userRouter,
          logic: logicToken,
        })
        return steps
      } else {
        const steps = await marketClient.getLimitOrderSteps({
          bs,
          user,
          userRouter,
        })
        return steps
      }
    },
    enabled: !!marketClient,
  })
}
