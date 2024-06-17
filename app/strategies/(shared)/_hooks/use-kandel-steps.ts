import { kandelSeederActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import { useMangroveAddresses, useSmartKandel } from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { getUserRouter } from "@mangrovedao/mgv/actions"
import { useRouter } from "next/navigation"
import { useAccount, useClient, usePublicClient } from "wagmi"

export function useKandelSteps() {
  const { address } = useAccount()
  const { currentMarket } = useMarket()
  const client = useClient()
  const smartKandel = useSmartKandel()

  const addresses = useMangroveAddresses()
  const publicClient = usePublicClient()
  const router = useRouter()

  return useQuery({
    queryKey: ["kandel-steps", smartKandel, address],
    queryFn: async () => {
      try {
        if (!currentMarket) router.push("/strategies")

        if (
          !smartKandel ||
          !address ||
          !publicClient ||
          !addresses ||
          !client ||
          !currentMarket?.tickSpacing
        )
          throw new Error("Could not fetch kandel steps, missing params")

        const userRouter = await getUserRouter(publicClient, addresses, {
          user: address,
        })
        const kandelSeeder = kandelSeederActions(currentMarket, smartKandel)
        const seeder = kandelSeeder(client)

        const currentSteps = await seeder.getKandelSteps({
          user: address,
          userRouter: userRouter,
        })

        return currentSteps
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel steps")
      }
    },
    enabled: !!smartKandel && !!address,
    meta: {
      error: "Unable to retrieve kandel steps",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
