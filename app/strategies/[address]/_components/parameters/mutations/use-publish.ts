import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { MergedOffers } from "../../../_utils/inventory"

export function usePublish({
  stratInstance,
  mergedOffers,
  volumes,
}: {
  stratInstance?: GeometricKandelInstance
  mergedOffers: MergedOffers
  volumes: { baseAmount: string; quoteAmount: string }
}) {
  return useMutation({
    mutationFn: async () => {
      try {
        if (!stratInstance || !mergedOffers) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const { baseAmount, quoteAmount } = volumes

        const bids = mergedOffers
          .filter((x: any) => x.offerType === "bids")
          .map((offer) => ({
            tick: offer.tick,
            index: offer.index,
            gives: offer.gives,
          }))

        const asks = mergedOffers
          .filter((x: any) => x.offerType === "asks")
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

        toast.success("Published successfully")
      } catch (err) {
        console.error(err)
        toast.error("Failed to publish")
      }
    },
    meta: {
      error: "Failed to publish",
    },
  })
}
