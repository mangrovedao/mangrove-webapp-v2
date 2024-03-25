import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market"

import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"

export function useRetractOffers({
  kandelAddress,
}: {
  kandelAddress?: string
}) {
  const { market } = useMarket()
  const { kandelStrategies } = useKandel()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!(market && kandelStrategies && kandelAddress))
          throw new Error("Could not retract offers")

        const kandelInstance = await kandelStrategies.instance({
          address: kandelAddress,
          market,
          type: "smart",
        })

        const txs = await kandelInstance.retractAndWithdraw()
        await Promise.all(txs.map((x) => x.wait()))

        toast.success("Kandel offers successfully retracted")
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
