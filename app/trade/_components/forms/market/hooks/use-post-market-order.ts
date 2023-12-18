import type { Market } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../../constants"
import { TradeAction, TradeMode } from "../../enums"
import type { Form } from "../types"
import { successToast } from "../utils"

export function usePostMarketOrder() {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      if (!mangrove || !market) return
      const { base } = market
      const { tradeAction, send, receive, slippage } = form
      const isBuy = tradeAction === TradeAction.BUY

      const orderParams: Market.TradeParams = {
        wants: receive,
        gives: send,
        slippage,
      }

      const [baseValue, quoteValue] = TRADEMODE_AND_ACTION_PRESENTATION.market[
        tradeAction
      ].sendReceiveToBaseQuote(send, receive)

      const order = isBuy
        ? await market.buy(orderParams)
        : await market.sell(orderParams)

      const result = await order.result

      successToast(
        TradeMode.MARKET,
        tradeAction,
        base,
        baseValue,
        quoteValue,
        result,
      )
      return result
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
