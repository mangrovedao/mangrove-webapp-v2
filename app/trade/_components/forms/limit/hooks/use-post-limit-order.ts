import useMarket from "@/providers/market.new"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TransactionReceipt, parseEther } from "viem"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useLogics, useMangroveAddresses } from "@/hooks/use-addresses"
import { useBook } from "@/hooks/use-book"
import { useMarketClient } from "@/hooks/use-market"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { useLoadingStore } from "@/stores/loading.store"
import { limitOrderResultFromLogs } from "@mangrovedao/mgv"

import { BS } from "@mangrovedao/mgv/lib"
import { usePublicClient, useWalletClient } from "wagmi"
import { TradeMode } from "../../enums"
import { successToast } from "../../utils"
import type { Form } from "../types"

type Props = {
  onResult?: (result: TransactionReceipt) => void
}

export function usePostLimitOrder({ onResult }: Props = {}) {
  const { currentMarket: market } = useMarket()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const marketClient = useMarketClient()
  const { book } = useBook()
  const logics = useLogics()
  const addresses = useMangroveAddresses()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      try {
        if (
          !market ||
          !marketClient ||
          !book ||
          !walletClient ||
          !publicClient ||
          !addresses
        )
          throw new Error("Failed to post limit order")

        const {
          bs,
          send: gives,
          receive: wants,
          orderType,
          timeToLive,
          sendFrom,
          receiveTo,
        } = form

        const takerGivesLogic = logics.find(
          (item) => item.name === sendFrom,
        )?.logic

        const takerWantsLogic = logics.find(
          (item) => item.name === receiveTo,
        )?.logic

        const { request } = await marketClient.simulateLimitOrder({
          baseAmount: parseEther(gives),
          quoteAmount: parseEther(wants),
          bs,
          book,
          orderType,
          // If expiry date is ignored, then it will not expire
          expiryDate: BigInt(timeToLive), // 1 hour
          restingOrderGasreq: 0n,
          // logics can be left to undefined (meaning no logic)
          takerGivesLogic,
          takerWantsLogic,
        })

        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })

        const result = limitOrderResultFromLogs(
          { ...addresses, ...market },
          market,
          {
            logs: receipt.logs,
            user: walletClient.account.address,
            bs: BS.buy,
          },
        )

        successToast(TradeMode.LIMIT, bs, market.base, gives, result)
        return { result, receipt }
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: "Failed to post the limit order",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { receipt } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      onResult?.(receipt)
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])

        await resolveWhenBlockIsIndexed.mutateAsync({
          blockNumber: Number(receipt.blockNumber),
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
