import { GeometricKandelDistribution } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import useKandel from "@/app/strategies/(list)/_providers/kandel-strategies"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
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
  const queryClient = useQueryClient()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()

  return useMutation({
    mutationFn: async ({
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

        toast.success("Kandel strategy successfully edited")
        return { txs: await Promise.all(populateTxs.map((x) => x.wait())) }
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    onSuccess: async (data) => {
      try {
        if (!data) return
        const { txs } = data
        await Promise.all(
          txs.map(async (tx) => {
            await resolveWhenBlockIsIndexed.mutateAsync({
              blockNumber: tx?.blockNumber,
            })
          }),
        )
        queryClient.invalidateQueries({ queryKey: ["strategy-status"] })
        queryClient.invalidateQueries({ queryKey: ["strategy"] })
      } catch (error) {
        console.error(error)
      }
    },
    meta: { disableGenericError: true },
  })
}
