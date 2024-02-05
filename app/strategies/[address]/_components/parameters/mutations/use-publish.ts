import { GeometricKandelInstance } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export function usePublish({
  stratInstance,
  mergedOffers,
  volumes,
}: {
  stratInstance?: GeometricKandelInstance
  mergedOffers: any
  volumes: { baseAmount: string; quoteAmount: string }
}) {
  return useMutation({
    mutationFn: async () => {
      try {
        console.log(0)
        if (!stratInstance || !mergedOffers) {
          throw new Error("Strategy Instance could not be fetched")
        }

        const { baseAmount, quoteAmount } = volumes

        const bids = mergedOffers.filter(
          (x: any) => x.offerType === "bids" && x.live == true,
        )
        const asks = mergedOffers.filter(
          (x: any) => x.offerType === "asks" && x.live == true,
        )
        console.log(JSON.stringify({ bids, asks }))
        // Invalid distribution: number of bids does not match number of price points and step size at GeneralKandelDistribution
        const newDistribution =
          await stratInstance.calculateDistributionWithUniformlyChangedVolume({
            // @ts-ignore
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
