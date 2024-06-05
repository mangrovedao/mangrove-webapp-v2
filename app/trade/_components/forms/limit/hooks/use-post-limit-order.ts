import useMarket from "@/providers/market.new"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  BaseError,
  ContractFunctionExecutionError,
  TransactionReceipt,
  parseEther,
} from "viem"

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

import { BS } from "@mangrovedao/mgv/lib"
import { toast } from "sonner"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { TradeMode } from "../../enums"
import { successToast } from "../../utils"
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

        const restingOrderGasreq = getDefaultLimitOrderGasreq()

        const baseAmount = bs === "buy" ? parseEther(wants) : parseEther(gives)
        const quoteAmount = bs === "buy" ? parseEther(gives) : parseEther(wants)
        const { request } = await marketClient.simulateLimitOrder({
          account,
          baseAmount,
          quoteAmount,
          bs,
          book,
          orderType,
          // If expiry date is ignored, then it will not expire
          expiryDate: BigInt(
            estimateTimestamp({ timeToLiveUnit: "Day", timeToLive }),
          ), // 1 hour
          restingOrderGasreq,
          // logics can be left to undefined (meaning no logic)
          takerGivesLogic,
          takerWantsLogic,
          gas: 20_000_000n,
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
        if (error instanceof BaseError) {
          const revertError = error.walk(
            (error) => error instanceof ContractFunctionExecutionError,
          )

          if (revertError instanceof ContractFunctionExecutionError) {
            console.log(
              revertError.cause,
              revertError.message,
              revertError.functionName,
              revertError.formattedArgs,
              revertError.details,
            )
          }
        }
        console.error(error)
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
