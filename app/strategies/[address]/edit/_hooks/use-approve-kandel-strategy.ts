import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"

import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<NewStratStore, "baseDeposit" | "quoteDeposit">

export function useApproveKandelStrategy({
  kandelAddress,
}: {
  kandelAddress?: string
}) {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()
  return useMutation({
    mutationFn: async ({ baseDeposit, quoteDeposit }: FormValues) => {
      try {
        if (!(market && kandelStrategies && kandelAddress)) return

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
        })

        const approvalTxs = await kandelInstance.approveIfHigher(
          Number(baseDeposit),
          Number(quoteDeposit),
        )

        // waiting for all approvals
        await Promise.all(approvalTxs.map((tx) => tx?.wait()))

        toast.success("Kandel strategy successfully approved")
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }

      // TODO: invalidate strategies query
    },
    meta: { disableGenericError: true },
  })
}
