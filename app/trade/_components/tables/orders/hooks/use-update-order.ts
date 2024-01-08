import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { Form } from "../types"

type useUpdateOrderProps = {
  form: Form
  offerId?: string
  onResult?: (tx: string) => void
}

export function useUpdateOrder({ offerId, onResult }: useUpdateOrderProps) {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      if (!mangrove || !market) return
      const { isBid, limitPrice: price, send: volume } = form

      const updateOrder = isBid
        ? await market.updateRestingOrder("bids", {
            offerId: Number(offerId),
            volume,
            price,
          })
        : await market.updateRestingOrder("asks", {
            offerId: Number(offerId),
            volume,
            price,
          })

      await updateOrder.result

      return { updateOrder }
    },
    meta: {
      error: "Failed to update the limit order",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { updateOrder } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])

        const { blockNumber, transactionHash } = await (
          await updateOrder.response
        ).wait()

        onResult?.(transactionHash)

        await resolveWhenBlockIsIndexed.mutateAsync({
          blockNumber,
        })
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        // queryClient.invalidateQueries({ queryKey: ["fills"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
