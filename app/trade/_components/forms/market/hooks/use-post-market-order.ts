import { MarketParams } from "@mangrovedao/mgv"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { parseUnits } from "viem"
import { useWalletClient } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useMarketClient } from "@/hooks/use-market"

import { useSelectedPool } from "@/hooks/new_ghostbook/use-selected-pool"
import { useGhostBookTrade } from "@/hooks/new_ghostbook/use-trade"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { printEvmError } from "@/utils/errors"
import { TradeMode } from "../../enums"
import { useOptimisticCache } from "../../hooks/use-optimistic-cache"
import { successToast } from "../../utils"
import type { Form } from "../types"

// Helper function to calculate the max tick based on price and slippage
const calculateMaxTick = (
  maxTickEncountered: bigint,
  slippage: number,
): bigint => {
  const maxTick = maxTickEncountered + BigInt(Math.ceil(slippage * 100))
  return maxTick
}

export function usePostMarketOrder() {
  const { currentMarket: market } = useMarket()

  const { selectedPool: pool } = useSelectedPool()
  const { data: walletClient } = useWalletClient()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  const { addOptimisticOrder } = useOptimisticCache()
  const { trade, result } = useGhostBookTrade({ market })
  const { takerGot, takerGave, bounty, feePaid } = result || {}
  const parsedResult = {
    takerGot: takerGot || 0n,
    takerGave: takerGave || 0n,
    bounty: bounty || 0n,
    feePaid: feePaid || 0n,
  }

  return useMutation({
    mutationFn: async ({
      form,
      swapMarket,
    }: {
      form: Form
      swapMarket?: MarketParams
      swapMarketClient?: ReturnType<typeof useMarketClient>
    }) => {
      try {
        if (!pool || !market || !walletClient)
          throw new Error("Market order post, is missing params")


        
        console.log("ghostbook trade")

        const {
          bs,
          send: gives,
          receive: wants,
          slippage,
          maxTickEncountered,
        } = form

        const contextMarket = swapMarket ? swapMarket : market

        const { base, quote } = contextMarket

        const receiveToken = bs === "buy" ? base : quote
        const sendToken = bs === "buy" ? quote : base

        const sendAmount = parseUnits(gives, sendToken.decimals)

        const maxTick = calculateMaxTick(maxTickEncountered, slippage)

        const res = await trade({
          bs,
          sendAmount,
          maxTick,
        })

        const { receipt, hash } = res || {}

        // Add optimistic order to cache immediately
        await addOptimisticOrder({
          type: "market",
          side: bs,
          receipt,
          parsedResult,
          form: {
            send: gives,
            receive: wants,
            bs,
          },
        })

        successToast(
          TradeMode.MARKET,
          bs,
          base,
          quote,
          wants,
          parsedResult,
          receiveToken,
          sendToken,
        )

        return { result, receipt }
      } catch (error) {
        printEvmError(error)
        toast.error("Failed to post the market order")
      }
    },
    meta: {
      error: "Failed to post the market order",
    },
    onSuccess: async (data) => {
      if (!data) return
      // const { receipt } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      // onResult?.(receipt)
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.ORDER_HISTORY])
        // await resolveWhenBlockIsIndexed.mutateAsync({
        //   blockNumber: Number(receipt.blockNumber),
        // })

        // Note: We don't invalidate queries immediately anymore since we're using optimistic updates
        // The optimistic cache hook will handle the invalidation once indexer catches up

        // queryClient.invalidateQueries({ queryKey: ["orders"] })
        // queryClient.invalidateQueries({ queryKey: ["order-history"] })
        queryClient.invalidateQueries({ queryKey: ["trade-balances"] })
        queryClient.invalidateQueries({ queryKey: ["mangroveTokenPrice"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.ORDER_HISTORY])
    },
  })
}
