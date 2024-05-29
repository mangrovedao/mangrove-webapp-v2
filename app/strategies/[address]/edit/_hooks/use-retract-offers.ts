import { useMutation } from "@tanstack/react-query"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import useMarket from "@/providers/market.new"

import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { toast } from "sonner"

export function useRetractOffers({
  kandelAddress,
}: {
  kandelAddress?: string
}) {
  const { currentMarket: market } = useMarket()
  const { kandelStrategies } = useKandel()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!(market && kandelStrategies && kandelAddress))
          throw new Error("Could not retract offers")

        // const kandelInstance = await kandelStrategies.instance({
        //   address: kandelAddress,
        //   market,
        //   type: "smart",
        // })

        // const txs = await kandelInstance.retractOffers()
        // await Promise.all(txs.map((x) => x.wait()))
        // toast.success("Kandel offers successfully retracted")
        // return txs
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    meta: { disableGenericError: true },
    onSuccess: async (data) => {
      // const { order, result } = data
      // /*
      //  * We use a custom callback to handle the success message once it's ready.
      //  * This is because the onSuccess callback from the mutation will only be triggered
      //  * after all the preceding logic has been executed.
      //  */
      // onResult?.(result)
      // try {
      //   // Start showing loading state indicator on parts of the UI that depend on
      //   startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
      //   const { blockNumber } = await (await order.response).wait()
      //   await resolveWhenBlockIsIndexed.mutateAsync({
      //     blockNumber,
      //   })
      //   queryClient.invalidateQueries({ queryKey: ["orders"] })
      //   queryClient.invalidateQueries({ queryKey: ["fills"] })
      // } catch (error) {
      //   console.error(error)
      // }
    },
  })
}
