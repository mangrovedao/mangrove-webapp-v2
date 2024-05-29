import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market.new"

import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"
import { NewStratStore } from "../_stores/new-strat.store"

type FormValues = Pick<NewStratStore, "baseDeposit" | "quoteDeposit">

export function useCreateKandelStrategy({
  setKandelAddress,
}: {
  setKandelAddress: (address: string) => void
}) {
  const { currentMarket: market } = useMarket()
  const { kandelStrategies } = useKandel()
  return useMutation({
    mutationFn: async () => {
      try {
        if (!(market && kandelStrategies)) return

        // const { result } = await kandelStrategies.seeder.sow({
        //   market,
        //   type: "smart",
        //   liquiditySharing: false,
        // })

        // const kandelInstance = await result

        // setKandelAddress(kandelInstance.address)
        toast.success("Kandel strategy instance successfully created")
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
