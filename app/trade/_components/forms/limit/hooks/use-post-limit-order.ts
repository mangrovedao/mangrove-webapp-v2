import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import type { Market } from "@mangrovedao/mangrove.js"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../../constants"
import { TradeAction, TradeMode } from "../../enums"
import { DefaultTradeLogics } from "../../types"
import { successToast } from "../../utils"
import { TimeInForce } from "../enums"
import type { Form } from "../types"
import { estimateTimestamp } from "../utils"

type Props = {
  onResult?: (result: Market.OrderResult) => void
}

export function usePostLimitOrder({ onResult }: Props = {}) {
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
      try {
        if (!mangrove || !market) return
        const {
          tradeAction,
          send: gives,
          receive: wants,
          timeInForce,
          timeToLive,
          timeToLiveUnit,
        } = form

        const logics = Object.values(mangrove.logics)
        const isBuy = tradeAction === TradeAction.BUY
        const { base } = market

        const takerGivesLogic = logics.find(
          (logic) => logic?.id === form.sendFrom,
        ) as DefaultTradeLogics

        const takerWantsLogic = logics.find(
          (logic) => logic?.id === form.receiveTo,
        ) as DefaultTradeLogics

        const restingOrderGasreq = Math.max(
          takerGivesLogic?.gasOverhead || 200_000,
          takerWantsLogic?.gasOverhead || 200_000,
        )

        const orderParams: Market.TradeParams = {
          wants,
          gives,
          restingOrder: {
            restingOrderGasreq,
          },
          forceRoutingToMangroveOrder: true,
          fillOrKill: timeInForce === TimeInForce.FILL_OR_KILL,
          takerGivesLogic,
          takerWantsLogic,
          gasLowerBound: 20_000_000,
          expiryDate:
            timeInForce === TimeInForce.GOOD_TIL_TIME
              ? estimateTimestamp({
                  timeToLiveUnit,
                  timeToLive,
                })
              : undefined,
        }

        const [baseValue] = TRADEMODE_AND_ACTION_PRESENTATION.limit[
          tradeAction
        ].sendReceiveToBaseQuote(gives, wants)

        const order = isBuy
          ? await market.buy(orderParams)
          : await market.sell(orderParams)
        const result = await order.result

        successToast(TradeMode.LIMIT, tradeAction, base, baseValue, result)
        return { order, result }
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: "Failed to post the limit order",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { order, result } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      onResult?.(result)
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
        const { blockNumber } = await (await order.response).wait()
        await resolveWhenBlockIsIndexed.mutateAsync({
          blockNumber,
        })
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.invalidateQueries({ queryKey: ["fills"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
