import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { NewStratStore } from "../../../new/_stores/new-strat.store"

type FormValues = Pick<
  NewStratStore,
  | "baseDeposit"
  | "quoteDeposit"
  | "numberOfOffers"
  | "stepSize"
  | "bountyDeposit"
> & {
  distribution: GeometricKandelDistribution | undefined
  kandelAddress?: string
}

export function useEditKandelStrategy() {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()

  return useMutation({
    mutationFn: async ({
      baseDeposit,
      quoteDeposit,
      distribution,
      bountyDeposit,
      stepSize,
      numberOfOffers,
      kandelAddress,
    }: FormValues) => {
      try {
        if (!(market && kandelStrategies && distribution && kandelAddress))
          return

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        const populateTxs = await kandelInstance.populateGeometricDistribution({
          distribution,
          funds: bountyDeposit,
          parameters: {
            pricePoints: Number(numberOfOffers) + 1,
            stepSize: Number(stepSize),
          },
        })

        await Promise.all(populateTxs.map((x) => x.wait()))
        toast.success("Kandel strategy successfully edited")
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    meta: { disableGenericError: true },
  })
}
