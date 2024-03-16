import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { useLoadingStore } from "@/stores/loading.store"
import Big from "big.js"
import { useRefillRequirements } from "../../[address]/_hooks/use-refill-requirements"
import useKandel from "../../[address]/_providers/kandel-strategy"
import { MergedOffer } from "../../[address]/_utils/inventory"
import useStrategyStatus from "./use-strategy-status"

type Props = {
  offer: MergedOffer
  onCancel?: () => void
}

export function useRefillOffer({ offer, onCancel }: Props) {
  const { strategyQuery, strategyStatusQuery, strategyAddress, mergedOffers } =
    useKandel()
  const { data } = useRefillRequirements({
    offer,
  })

  const { market } = strategyStatusQuery.data ?? {}

  const { data: strategy } = useStrategyStatus({
    address: strategyAddress,
    base: market?.base.symbol,
    quote: market?.quote.symbol,
    offers: strategyQuery.data?.offers,
  })

  const queryClient = useQueryClient()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const [startLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useMutation({
    /*
     * We introduce a mutationKey to the useCancelOrder hook. This allows us to
     * handle multiple order retractions simultaneously, without them sharing the
     * same mutation state. This is crucial for maintaining independent states
     * for each retraction operation.
     */
    mutationKey: ["refillOffer", offer.index],
    mutationFn: async () => {
      try {
        if (!strategy || !strategyQuery) return
        const { stratInstance } = strategy
  
        const singleOfferDistributionChunk = {
          bids:
            offer.offerType === "bids"
              ? [
                  {
                    index: offer.index,
                    tick: offer.tick,
                    gives: Big(data?.minimumVolume || 1),
                  },
                ]
              : [],
          asks:
            offer.offerType === "asks"
              ? [
                  {
                    index: offer.index,
                    tick: offer.tick,
                    gives: Big(data?.minimumVolume || 1),
                  },
                ]
              : [],
        }
  
        const transaction = await stratInstance?.populateGeneralChunks({
          distributionChunks: [singleOfferDistributionChunk],
        })

        const result = await Promise.all(transaction.map((tx) => tx?.wait()))
  
        return { lastTx: result[result.length - 1] }
      } catch (error) {
        console.error(error)
      }
    },
    onSuccess: async (data) => {
      try {
        if (!data) return
        const { lastTx } = data
        onCancel?.()
        // await resolveWhenBlockIsIndexed.mutateAsync({
        //   blockNumber: lastTx?.blockNumber,
        // })
        // queryClient.invalidateQueries({ queryKey: ["orders"] })
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: `Failed to refill the offer`,
      success: `The offer has been successfully refilled`,
    },
  })
}
