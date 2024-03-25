import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<
  NewStratStore,
  "baseDeposit" | "quoteDeposit" | "pricePoints" | "stepSize" | "bountyDeposit"
> & {
  distribution: GeometricKandelDistribution | undefined
  kandelAddress?: string
  hasLiveOffers?: boolean
}

export function useEditKandelStrategy() {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({
      baseDeposit,
      quoteDeposit,
      distribution,
      bountyDeposit,
      stepSize,
      pricePoints,
      kandelAddress,
      hasLiveOffers,
    }: FormValues) => {
      try {
        if (!(market && kandelStrategies && distribution && kandelAddress))
          return

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        if (hasLiveOffers) {
          const retractTXs = await kandelInstance.retractAndWithdraw()
          retractTXs && (await Promise.all(retractTXs.map((x) => x.wait())))
        }

        const approvalTxs = await kandelInstance.approveIfHigher(
          baseDeposit,
          quoteDeposit,
        )
        await Promise.all(approvalTxs.map((tx) => tx?.wait()))

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
