import { marketOrderResultFromLogs } from "@mangrovedao/mgv"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TransactionReceipt, parseEther } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useMarketClient } from "@/hooks/use-market"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMarket from "@/providers/market.new"
import { useLoadingStore } from "@/stores/loading.store"
import { toast } from "sonner"
import { TradeMode } from "../../enums"
import { successToast } from "../../utils"
import type { Form } from "../types"

type Props = {
  onResult?: (result: TransactionReceipt) => void
}

export function usePostMarketOrder({ onResult }: Props = {}) {
  const { currentMarket: market } = useMarket()
  const { address } = useAccount()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const marketClient = useMarketClient()
  const addresses = useMangroveAddresses()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      try {
        if (
          !publicClient ||
          !walletClient ||
          !addresses ||
          !market ||
          !marketClient ||
          !address
        )
          throw new Error("Market order post is missing params")

        const { base, quote } = market
        const { bs, send: gives, receive: wants, slippage } = form

        const receiveToken = bs === "buy" ? base : quote
        const sendToken = bs === "buy" ? quote : base
        const baseAmount = bs === "buy" ? parseEther(wants) : parseEther(gives)
        const quoteAmount = bs === "buy" ? parseEther(gives) : parseEther(wants)
        const { request } =
          await marketClient.simulateMarketOrderByVolumeAndMarket({
            baseAmount,
            quoteAmount,
            bs,
            slippage,
            gas: 20_000_000n,
            account: address,
          })

        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })
        //note:  might need to remove marketOrderResultfromlogs function if simulateMarketOrder returns correct values
        const result = marketOrderResultFromLogs(
          { ...addresses, ...market },
          market,
          {
            logs: receipt.logs,
            taker: walletClient.account.address,
            bs,
          },
        )

        successToast(
          TradeMode.MARKET,
          bs,
          base,
          quote,
          result,
          receiveToken,
          sendToken,
        )
        return { result, receipt }
      } catch (error) {
        console.error(error)
        toast.error("Failed to post the market order")
      }
    },
    meta: {
      error: "Failed to post the market order",
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
        queryClient.invalidateQueries({ queryKey: ["balances"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
