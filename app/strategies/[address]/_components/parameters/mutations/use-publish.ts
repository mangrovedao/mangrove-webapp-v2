import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { MergedOffer, MergedOffers } from "../../../_utils/inventory"

export function usePublish({
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

        console.log(JSON.stringify({ asks, bids }), baseAmount, quoteAmount)

        // var tab = {
        //   asks: [
        //     { tick: "-60", index: 10, gives: "0.257166" },
        //     { tick: "-60", index: 6, gives: "0.257166" },
        //     { tick: "429", index: 7, gives: "0.257166" },
        //     { tick: "918", index: 8, gives: "0.257166" },
        //     { tick: "1407", index: 9, gives: "0.257166" },
        //   ],
        //   bids: [
        //     { tick: "2994", index: 0, gives: "0.219429" },
        //     { tick: "2505", index: 1, gives: "0.219429" },
        //     { tick: "2016", index: 2, gives: "0.219429" },
        //     { tick: "1527", index: 3, gives: "0.219429" },
        //     { tick: "1038", index: 4, gives: "0.243429" },
        //     { tick: "549", index: 5, gives: "0.019063" },
        //   ],
        // }

        const newDistribution =
          await stratInstance.calculateDistributionWithUniformlyChangedVolume({
            explicitOffers: { asks, bids },
            baseDelta: baseAmount,
            quoteDelta: quoteAmount,
          })

        console.log(
          JSON.stringify({
            offers: newDistribution.distribution.offers,
            totalBase: newDistribution.totalBaseChange,
            totalQuote: newDistribution.totalQuoteChange,
          }),
        )

        if (!newDistribution) {
          throw new Error("Error calculating new distribution")
        }

        const txs = await stratInstance.populateGeneralChunks(newDistribution)

        const res = txs && (await Promise.all(txs.map((tx) => tx.wait())))

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
