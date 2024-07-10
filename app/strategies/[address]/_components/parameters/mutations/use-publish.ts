import { OfferParsed } from "@mangrovedao/mgv"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import useKandelInstance from "@/app/strategies/(shared)/_hooks/use-kandel-instance"
import { BA } from "@mangrovedao/mgv/lib"

export function usePublish({
  kandelInstance,
  mergedOffers,
  volumes,
}: {
  kandelInstance?: ReturnType<typeof useKandelInstance>
  mergedOffers: OfferParsed[]
  volumes: { baseAmount: string; quoteAmount: string }
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!kandelInstance || !mergedOffers) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const { baseAmount, quoteAmount } = volumes

        const bids = mergedOffers
          .filter((x: OfferParsed) => x.ba === BA.bids)
          .map((offer) => ({
            tick: offer.tick,
            index: offer.index,
            gives: offer.gives,
          }))

        const asks = mergedOffers
          .filter((x: OfferParsed) => x.ba === BA.asks)
          .map((offer) => ({
            tick: offer.tick,
            index: offer.index,
            gives: offer.gives,
          }))
        // note: to re-implement

        // const newDistribution =
        //   await kandelInstance.calculateDistributionWithUniformlyChangedVolume({
        //     explicitOffers: { asks, bids },
        //     baseDelta: baseAmount,
        //     quoteDelta: quoteAmount,
        //   })

        // if (!newDistribution) {
        //   throw new Error("Error calculating new distribution")
        // }

        // const txs = await kandelInstance.populateGeneralChunks(newDistribution)

        // const res = txs && (await Promise.all(txs.map((tx) => tx.wait())))

        toast.success("Published successfully")
      } catch (err) {
        console.error(err)
        toast.error("Failed to publish")
        throw new Error("Failed to publish")
      }
    },
    meta: {
      error: "Failed to publish",
    },
    onSuccess() {
      try {
        queryClient.invalidateQueries({ queryKey: ["strategy-status"] })
        queryClient.invalidateQueries({ queryKey: ["strategy"] })
      } catch (error) {
        console.error(error)
      }
    },
  })
}
