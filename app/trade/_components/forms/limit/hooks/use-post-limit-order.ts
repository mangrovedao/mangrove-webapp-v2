import useMarket from "@/providers/market"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Address, TransactionReceipt, parseUnits } from "viem"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useLogics, useMangroveAddresses } from "@/hooks/use-addresses"
import { useBook } from "@/hooks/use-book"
import { useMarketClient } from "@/hooks/use-market"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { useLoadingStore } from "@/stores/loading.store"
import {
  getDefaultLimitOrderGasreq,
  limitOrderResultFromLogs,
} from "@mangrovedao/mgv"

import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { BS } from "@mangrovedao/mgv/lib"
import { toast } from "sonner"
import { useAccount, useWalletClient } from "wagmi"
import { TradeMode } from "../../enums"
import { successToast } from "../../utils"
import { TimeInForce } from "../enums"
import type { Form } from "../types"
import { estimateTimestamp } from "../utils"

type Props = {
  onResult?: (result: TransactionReceipt) => void
}

export function usePostLimitOrder({ onResult }: Props = {}) {
  const { address: account } = useAccount()
  const { currentMarket: market } = useMarket()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  const networkClient = useNetworkClient()
  const { data: walletClient } = useWalletClient()
  const marketClient = useMarketClient()
  const { book } = useBook()
  const logics = useLogics()
  const addresses = useMangroveAddresses()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      try {
        console.log("0", {
          market,
          marketClient,
          book,
          walletClient,
          networkClient,
          addresses,
        })
        if (
          !market ||
          !marketClient ||
          !book ||
          !walletClient ||
          !networkClient ||
          !addresses
        )
          throw new Error("Failed to post limit order")

        const {
          bs,
          send: gives,
          receive: wants,
          timeInForce,
          timeToLive,
          sendFrom,
          receiveTo,
        } = form

        console.log("1")

        const { base, quote } = market
        const receiveToken = bs === "buy" ? base : quote
        const sendToken = bs === "buy" ? quote : base

        console.log("2")

        const takerGivesLogic = logics.find(
          (item) => item.name === sendFrom,
        )?.logic

        const takerWantsLogic = logics.find(
          (item) => item.name === receiveTo,
        )?.logic

        const restingOrderGasreq = getDefaultLimitOrderGasreq()

        console.log("3")

        const baseAmount =
          bs === "buy"
            ? parseUnits(wants, base.decimals)
            : parseUnits(gives, base.decimals)

        const quoteAmount =
          bs === "buy"
            ? parseUnits(gives, quote.decimals)
            : parseUnits(wants, quote.decimals)

        console.log("4")

        const { request } = await marketClient.simulateLimitOrder({
          account,
          fillWants: false,
          baseAmount,
          quoteAmount,
          bs,
          book,
          orderType: timeInForce as number,
          // If expiry date is ignored, then it will not expire
          expiryDate:
            timeInForce === TimeInForce.GTC || timeInForce === TimeInForce.PO
              ? BigInt(estimateTimestamp({ timeToLiveUnit: "Day", timeToLive }))
              : undefined, // 1 hour
          restingOrderGasreq,
          // logics can be left to undefined (meaning no logic)
          takerGivesLogic: takerGivesLogic as Address,
          takerWantsLogic: takerWantsLogic as Address,
          gas: 20_000_000n,
        })

        console.log("5")

        const hash = await walletClient.writeContract(request)
        const receipt = await networkClient.waitForTransactionReceipt({
          hash,
        })

        console.log("6")

        const result = limitOrderResultFromLogs(
          { ...addresses, ...market },
          market,
          {
            logs: receipt.logs,
            user: walletClient.account.address,
            bs: BS.buy,
          },
        )

        console.log("7")

        successToast(
          TradeMode.LIMIT,
          bs,
          base,
          quote,
          wants,
          result,
          receiveToken,
          sendToken,
        )

        return { result, receipt }
      } catch (error) {
        console.log("limit order error", error)
        printEvmError(error)
        toast.error("Failed to post the limit order")
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
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.ORDER_HISTORY])

        await resolveWhenBlockIsIndexed.mutateAsync({
          blockNumber: Number(receipt.blockNumber),
        })
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.invalidateQueries({ queryKey: ["order-history"] })
        queryClient.invalidateQueries({ queryKey: ["balances"] })
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
