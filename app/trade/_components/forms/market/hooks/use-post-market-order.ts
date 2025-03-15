import { MarketParams } from "@mangrovedao/mgv"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, TransactionReceipt, erc20Abi, parseUnits } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { trade } from "@/hooks/ghostbook/lib/trade"
import { useMangroveAddresses } from "@/hooks/use-addresses"
import { useMarketClient } from "@/hooks/use-market"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { printEvmError } from "@/utils/errors"
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
  const { uniClone, mangroveChain } = useRegistry()

  return useMutation({
    mutationFn: async ({
      form,
      swapMarket,
      swapMarketClient,
    }: {
      form: Form
      swapMarket?: MarketParams
      swapMarketClient?: ReturnType<typeof useMarketClient>
    }) => {
      try {
        if (
          !publicClient ||
          !walletClient ||
          !addresses ||
          !market ||
          !marketClient?.uid ||
          !address ||
          !uniClone?.pool ||
          !mangroveChain?.ghostbook ||
          !mangroveChain?.univ3Module
        )
          throw new Error("Market order post, is missing params")

        const { bs, send: gives, receive: wants, slippage } = form
        const contextMarket = swapMarket ? swapMarket : market
        const contextMarketClient = swapMarketClient
          ? swapMarketClient
          : marketClient

        const { base, quote } = contextMarket

        const receiveToken = bs === "buy" ? base : quote
        const sendToken = bs === "buy" ? quote : base

        // Check allowance before trade
        const allowance = await publicClient.readContract({
          address: sendToken.address as Address,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, uniClone?.pool],
        })

        const { got, gave, bounty, feePaid, receipt } = await trade({
          client: walletClient,
          ghostbook: mangroveChain.ghostbook,
          market,
          bs,
          sendAmount: parseUnits(gives, sendToken.decimals),
          router: uniClone.router,
          univ3Module: mangroveChain.univ3Module,
          fee: 500,
          async onTrade({ got, gave, bounty, feePaid }) {
            console.log("OnTrade callback:", {
              got,
              gave,
              bounty,
              feePaid,
            })
          },
        })

        const result = { takerGot: got, takerGave: gave, bounty, feePaid }
        successToast(
          TradeMode.MARKET,
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
        printEvmError(error)
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
        queryClient.invalidateQueries({ queryKey: ["mangroveTokenPrice"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
