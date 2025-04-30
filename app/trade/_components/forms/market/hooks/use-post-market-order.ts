import { MarketParams, tickFromVolumes } from "@mangrovedao/mgv"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, TransactionReceipt, parseUnits } from "viem"
import { useWalletClient } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { trade } from "@/hooks/ghostbook/lib/trade"
import { useMarketClient } from "@/hooks/use-market"

import { useRegistry } from "@/hooks/ghostbook/hooks/use-registry"
import { ProtocolType, TickSpacingPool } from "@/hooks/new_ghostbook/pool"
import { useSelectedPool } from "@/hooks/new_ghostbook/use-selected-pool"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { printEvmError } from "@/utils/errors"
import { TradeMode } from "../../enums"
import { successToast } from "../../utils"
import type { Form } from "../types"

// Helper function to calculate the max tick based on price and slippage
const calculateMaxTick = (
  inbound: bigint,
  outbound: bigint,
  slippage: number,
): bigint => {
  // average tick from tickFromVolumes()
  // if slippage is 5% add to average tick 500n  (5%*10000) = maxtick

  const averageTick = tickFromVolumes(inbound, outbound)
  const formattedSlippage = (slippage / 100) * 10000
  const maxTick = averageTick + BigInt(Math.round(formattedSlippage))
  return maxTick
}

type Props = {
  onResult?: (result: TransactionReceipt) => void
}

export function usePostMarketOrder({ onResult }: Props = {}) {
  const { currentMarket: market } = useMarket()
  const { data: walletClient } = useWalletClient()
  const { selectedPool: pool } = useSelectedPool()
  const { mangroveChain } = useRegistry()

  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  const uniModuleAddress = {
    [ProtocolType.UniswapV3]: "0xAf31bEb21d2b1f8C3BdD211eC02470265A21ea3f",
    [ProtocolType.PancakeSwapV3]: "0xAf31bEb21d2b1f8C3BdD211eC02470265A21ea3f",
    [ProtocolType.Slipstream]: "0x922F0E2fa80F7dc2E22dBcE5EB3B423E09CE013B",
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

        const { bs, send: gives, receive: wants, slippage } = form
        const contextMarket = swapMarket ? swapMarket : market

        const { base, quote } = contextMarket

        const receiveToken = bs === "buy" ? base : quote
        const sendToken = bs === "buy" ? quote : base

        const sendAmount = parseUnits(gives, sendToken.decimals)
        const receiveAmount = parseUnits(wants, receiveToken.decimals)

        // Calculate max tick based on current price and slippage
        const maxTick = calculateMaxTick(sendAmount, receiveAmount, slippage)

        const { got, gave, bounty, feePaid, receipt } = await trade({
          client: walletClient,
          ghostbook: mangroveChain?.ghostbook as Address,
          market,
          bs,
          sendAmount,
          router: pool?.protocol.router,
          module: uniModuleAddress[pool?.protocol.type] as Address,
          fee: 500,
          maxTick,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
          protocol: pool?.protocol.type,
          tickSpacing:
            pool?.protocol.type === ProtocolType.Slipstream
              ? (pool as TickSpacingPool)?.tickSpacing
              : 0,
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
