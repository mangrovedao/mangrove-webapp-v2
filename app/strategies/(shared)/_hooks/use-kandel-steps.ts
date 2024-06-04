import { kandelSeederActions } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import { useSmartKandel } from "@/hooks/use-addresses"
import useMarket from "@/providers/market.new"
import { getErrorMessage } from "@/utils/errors"
import { Address } from "viem"
import { useAccount, useClient } from "wagmi"

export function useKandelSteps() {
  const { address } = useAccount()
  const { currentMarket } = useMarket()
  const client = useClient()
  const smartKandel = useSmartKandel()

  return useQuery({
    queryKey: ["kandel-steps", client?.account],
    queryFn: async () => {
      try {
        if (
          !smartKandel ||
          !address ||
          !client?.account ||
          !currentMarket?.tickSpacing
        )
          return

        const kandelSeeder = kandelSeederActions(currentMarket, smartKandel)
        const seeder = kandelSeeder(client)

        const currentSteps = await seeder.getKandelSteps({
          user: address as Address,
          userRouter: address as Address,
        })
        return currentSteps
      } catch (e) {
        console.error(getErrorMessage(e))
        throw new Error("Unable to retrieve kandel steps")
      }
    },
    enabled: !!client?.account,
    meta: {
      error: "Unable to retrieve kandel steps",
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}
