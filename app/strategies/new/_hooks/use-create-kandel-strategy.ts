import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"

import useKandel from "@/providers/kandel-strategies"
import useMarket from "@/providers/market"
import { toast } from "sonner"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<
  NewStratStore,
  "baseDeposit" | "quoteDeposit" | "pricePoints" | "stepSize" | "bountyDeposit"
> & {
  distribution: GeometricKandelDistribution
}

type Params = {
  onApproveSuccess: () => void
}

export function useCreateKandelStrategy({ onApproveSuccess }: Params) {
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
    }: FormValues) => {
      if (!(market && kandelStrategies && distribution)) return

      const { result } = await kandelStrategies.seeder.sow({
        market,
        onAave: false,
        liquiditySharing: false,
      })
      const kandelInstance = await result

      const approvalTxs = await kandelInstance.approveIfHigher(
        baseDeposit,
        quoteDeposit,
      )
      // waiting for all approvals
      await Promise.all(approvalTxs.map((tx) => tx?.wait()))

      onApproveSuccess()

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
      toast.success("Kandel strategy successfuly launched")
      // TODO: invalidate strategies query
    },
    meta: {
      error: "Failed to create kandel strategy",
    },
  })
}
