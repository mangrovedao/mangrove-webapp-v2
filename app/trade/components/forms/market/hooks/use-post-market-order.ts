import { useMutation, useQueryClient } from "@tanstack/react-query"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import type { Market } from "@mangrovedao/mangrove.js"
import { TradeAction } from "../../enums"
import type { Form } from "../types"

export function usePostMarketOrder() {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      if (!mangrove || !market) return
      const { tradeAction, send, receive } = form
      const isBuy = tradeAction === TradeAction.BUY

      const orderParams: Market.TradeParams = {
        wants: receive,
        gives: send,
      }

      const order = isBuy
        ? await market.buy(orderParams)
        : await market.sell(orderParams)
      return await order.result
    },
    meta: {
      error: "Failed to post the market order",
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.refetchQueries({ queryKey: ["orders"] })
      }, 1000)
    },
  })
}
