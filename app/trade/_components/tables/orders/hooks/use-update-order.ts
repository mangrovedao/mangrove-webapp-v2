import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useBook } from "@/hooks/use-book"
import { useMarketClient } from "@/hooks/use-market"

import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { printEvmError } from "@/utils/errors"
import { BS } from "@mangrovedao/mgv/lib"
import { parseUnits } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { Form } from "../types"

type useUpdateOrderProps = {
  form: Form
  offerId?: string
  onResult?: (tx: string) => void
}

export function useUpdateOrder({ offerId, onResult }: useUpdateOrderProps) {
  const { currentMarket: market } = useMarket()
  const { book } = useBook()
  const { address } = useAccount()
  const { currentMarket } = useMarket()

  const marketClient = useMarketClient()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      try {
        if (
          !offerId ||
          !walletClient ||
          !publicClient ||
          !market ||
          !marketClient ||
          !book
        )
          throw new Error("Could not update order, missing params")

        const { isBid, limitPrice: price, send, receive } = form

        const { request } = await marketClient.simulateUpdateOrder({
          offerId: BigInt(Number(offerId)),
          baseAmount: isBid
            ? parseUnits(receive, currentMarket?.base.decimals || 18)
            : parseUnits(send, currentMarket?.base.decimals || 18),
          quoteAmount: isBid
            ? parseUnits(send, currentMarket?.quote.decimals || 18)
            : parseUnits(receive, currentMarket?.quote.decimals || 18),
          bs: isBid ? BS.buy : BS.sell,
          book: book,
          restingOrderGasreq: 250_000n,
          account: address,
        })

        const tx = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: tx,
        })
        return { receipt }
      } catch (error) {
        printEvmError(error)
        throw new Error("Failed to update the limit order")
      }
    },
    meta: {
      error: "Failed to update the limit order",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { receipt } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.ORDER_HISTORY])
        const { blockNumber, transactionHash } = receipt
        onResult?.(transactionHash)

        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.invalidateQueries({ queryKey: ["order-history"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.ORDER_HISTORY])
    },
  })
}
