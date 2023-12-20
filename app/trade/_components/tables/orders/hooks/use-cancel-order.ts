import type { Market } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { useLoadingStore } from "@/stores/loading.store"
import type { Order } from "../schema"

type Props = {
  offerId?: string
  onCancel?: () => void
}

export function useCancelOrder({ offerId, onCancel }: Props = {}) {
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
    mutationKey: ["retractOrder", offerId],
    mutationFn: async ({ order, market }: { order: Order; market: Market }) => {
      const retract = await market.retractRestingOrder(
        order.isBid ? "bids" : "asks",
        Number(order.offerId),
        true,
      )
      // wait the transaction to be mined
      await retract.result
      return { retract }
    },
    onSuccess: async (data) => {
      if (!data) return
      const { retract } = data
      onCancel?.()
      try {
        startLoading(TRADE.TABLES.ORDERS)
        const { blockNumber } = await (await retract.response).wait()
        await resolveWhenBlockIsIndexed.mutateAsync({
          blockNumber,
        })
        queryClient.invalidateQueries({ queryKey: ["orders"] })
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: `Failed to retract the order ${offerId ?? ""}`,
      success: `The order ${offerId ?? ""} has been successfully retracted`,
    },
  })
}
