import type { Market } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../../constants"
import { TradeAction, TradeMode } from "../../enums"
import { successToast } from "../../utils"
import type { Form } from "../types"

type Props = {
  onResult?: (result: Market.OrderResult) => void
}

export function usePostMarketOrder({ onResult }: Props = {}) {
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
      const { base } = market
      const { tradeAction, send: gives, receive: wants, slippage } = form
      const isBuy = tradeAction === TradeAction.BUY

      const orderParams: Market.TradeParams = {
        wants,
        gives,
        slippage,
        gasLowerBound: 20_000_000,
      }

      const [baseValue] = TRADEMODE_AND_ACTION_PRESENTATION.market[
        tradeAction
      ].sendReceiveToBaseQuote(gives, wants)

      const order = isBuy
        ? await market.buy(orderParams)
        : await market.sell(orderParams)
      const result = await order.result

      successToast(TradeMode.MARKET, tradeAction, base, baseValue, result)
      return { order, result }
    },
    meta: {
      error: "Failed to post the market order",
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
