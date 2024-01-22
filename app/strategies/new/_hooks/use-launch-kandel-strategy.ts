import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<
  NewStratStore,
  "baseDeposit" | "quoteDeposit" | "pricePoints" | "stepSize" | "bountyDeposit"
> & {
  distribution: GeometricKandelDistribution | undefined
  kandelAddress: string
}

export function useLaunchKandelStrategy() {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()
  return useMutation({
    mutationFn: async ({
      baseDeposit,
      quoteDeposit,
      distribution,
      bountyDeposit,
      stepSize,
      pricePoints,
      kandelAddress,
    }: FormValues) => {
      try {
        if (!(market && kandelStrategies && distribution)) return

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
        })

        const populateTxs = await kandelInstance.populateGeometricDistribution({
          distribution,
          depositBaseAmount: baseDeposit,
          depositQuoteAmount: quoteDeposit,
          funds: bountyDeposit,
          parameters: {
            pricePoints: Number(pricePoints),
            stepSize: Number(stepSize),
          },
        })

        await Promise.all(populateTxs.map((x) => x.wait()))
        toast.success("Kandel strategy successfully launched")
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
