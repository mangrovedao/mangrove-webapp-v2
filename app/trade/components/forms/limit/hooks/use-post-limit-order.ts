import { useMutation, useQueryClient } from "@tanstack/react-query"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import type { Market } from "@mangrovedao/mangrove.js"
import { TradeAction } from "../../enums"
import { TimeInForce } from "../enums"
import type { Form } from "../types"
import { estimateTimestamp } from "../utils"

export function usePostLimitOrder() {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      if (!mangrove || !market) return
      const {
        tradeAction,
        send,
        receive,
        timeInForce,
        timeToLive,
        timeToLiveUnit,
      } = form
      const isBuy = tradeAction === TradeAction.BUY
      let orderParams: Market.TradeParams = {
        wants: receive,
        gives: send,
      }

      const isGoodTilTime = timeInForce === TimeInForce.GOOD_TIL_TIME
      if (isGoodTilTime) {
        orderParams = {
          ...orderParams,
          expiryDate: estimateTimestamp({
            timeToLiveUnit,
            timeToLive,
          }),
        }
      }

      orderParams = {
        ...orderParams,
        restingOrder: {},
        forceRoutingToMangroveOrder: true,
        fillOrKill: timeInForce === TimeInForce.FILL_OR_KILL,
      }

      const order = isBuy
        ? await market.buy(orderParams)
        : await market.sell(orderParams)
      const orderResult = await order.result
      // handleOrderResultToastMessages(orderResult, tradeAction, market)
      return orderResult
    },
    meta: {
      error: "Failed to post the limit order",
    },
    onSuccess: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.refetchQueries({ queryKey: ["orders"] })
      }, 1000)
    },
  })
}
