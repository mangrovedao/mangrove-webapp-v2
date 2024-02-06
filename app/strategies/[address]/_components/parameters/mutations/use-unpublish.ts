import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { MergedOffer, MergedOffers } from "../../../_utils/inventory"

export function useUnPublish({
  stratInstance,
  mergedOffers,
  volumes,
}: {
  stratInstance?: GeometricKandelInstance
  mergedOffers: MergedOffers
  volumes: { baseAmount: string; quoteAmount: string }
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!stratInstance || !mergedOffers) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const { baseAmount, quoteAmount } = volumes

        const bids = mergedOffers
          .filter((x: MergedOffer) => x.offerType === "bids")
          .map((offer) => ({
            tick: offer.tick,
            index: offer.index,
            gives: offer.gives,
          }))

        const asks = mergedOffers
          .filter((x: MergedOffer) => x.offerType === "asks")
          .map((offer) => ({
            tick: offer.tick,
            index: offer.index,
            gives: offer.gives,
          }))

        const newDistribution =
          await stratInstance.calculateDistributionWithUniformlyChangedVolume({
            explicitOffers: { asks, bids },
            baseDelta: baseAmount,
            quoteDelta: quoteAmount,
          })

        if (!newDistribution) {
          throw new Error("Error calculating new distribution")
        }

        const txs = await stratInstance.populateGeneralChunks(newDistribution)

        const res = txs && (await Promise.all(txs.map((tx) => tx.wait())))

        toast.success("UnPublished successfully")
      } catch (err) {
        console.error(err)
        toast.error("Failed to unpublish")
        throw new Error("Failed to unppublish")
      }
    },
    meta: {
      error: "Failed to unpublish",
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
