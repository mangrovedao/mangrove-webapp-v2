import {
  MangroveAmplifier,
  TickPriceHelper,
  Token,
  type Market,
} from "@mangrovedao/mangrove.js"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { useEthersSigner } from "@/utils/adapters"
import { parseUnits } from "viem"
import { TimeInForce } from "../enums"
import type { Form } from "../types"
import { estimateTimestamp } from "../utils"

type Props = {
  onResult?: (result: Market.OrderResult) => void
}

export function usePostAmplifiedOrder({ onResult }: Props = {}) {
  const { mangrove, marketsInfoQuery } = useMangrove()
  const signer = useEthersSigner()
  const { market } = useMarket()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  return useMutation({
    mutationFn: async ({
      form,
    }: {
      form: Form & {
        selectedToken?: Token
        firstAssetToken?: Token
        secondAssetToken?: Token
        selectedSource?: SimpleLogic | SimpleAaveLogic
        sendAmount: string
      }
    }) => {
      try {
        if (
          !mangrove ||
          !market ||
          !form.selectedToken ||
          !form.selectedSource ||
          !form.firstAssetToken
        )
          return
        const { data: openMarkets } = marketsInfoQuery

        const amp = new MangroveAmplifier({ mgv: mangrove })

        const assets = [
          {
            inboundTokenAddress: form.firstAssetToken.address,
            inboundTokenId: form.firstAssetToken.id,
            inboundLogic: form.selectedSource,
            tickspacing: market.tickSpacing,
            limitPrice: form.firstAsset.limitPrice,
          },
        ]

        if (form.secondAssetToken) {
          assets.push({
            inboundTokenAddress: form.secondAssetToken.address,
            inboundTokenId: form.secondAssetToken.id,
            inboundLogic: form.selectedSource,
            tickspacing: market.tickSpacing,
            limitPrice: form.secondAsset.limitPrice,
          })
        }

        const inboundTokens = assets.map((token) => {
          const market = openMarkets?.find((market) => {
            return (
              (market.base.id === token.inboundTokenId &&
                market.quote.id === form.selectedToken?.id) ||
              (market.quote.id === token.inboundTokenId &&
                market.base.id === form.selectedToken?.id)
            )
          })

          const ba = market?.base.id === token.inboundTokenId ? "bids" : "asks"
          const priceHelper = new TickPriceHelper(ba, market!)
          const tick = priceHelper.tickFromPrice(token.limitPrice, "nearest")

          return {
            inboundToken: token.inboundTokenAddress,
            inboundLogic: token.inboundLogic,
            tickSpacing: token.tickspacing,
            tick,
          }
        })

        if (!assets) return

        const order = await amp.addBundle({
          outboundToken: form.selectedToken.address,
          outboundVolume: parseUnits(
            form.sendAmount,
            form.selectedToken.decimals,
          ),
          outboundLogic: form.selectedSource,
          expiryDate:
            form.timeInForce === TimeInForce.GOOD_TIL_TIME
              ? estimateTimestamp({
                  timeToLiveUnit: form.timeToLiveUnit,
                  timeToLive: form.timeToLive,
                })
              : 0,
          inboundTokens,
        })

        //TODO: check why we don't have tx hash
        return order
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: "Failed to post the limit order",
    },
    onSuccess: async (data) => {
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      // onResult?.(data)
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
        // const { blockNumber } = await (await order.response).wait()
        // await resolveWhenBlockIsIndexed.mutateAsync({
        //   blockNumber,
        // })
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
