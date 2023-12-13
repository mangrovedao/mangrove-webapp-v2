import type { Market } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Order } from "./schema"

export function useRetractOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ order, market }: { order: Order; market: Market }) => {
      const result = await market.retractRestingOrder(
        order.isBid ? "bids" : "asks",
        Number(order.offerId),
        true,
      )
      return result.result
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.refetchQueries({ queryKey: ["orders"] })
      }, 1000)
    },
    meta: {
      error: "The order has not be retracted",
      success: "The order has been successfully retracted",
    },
  })
}
