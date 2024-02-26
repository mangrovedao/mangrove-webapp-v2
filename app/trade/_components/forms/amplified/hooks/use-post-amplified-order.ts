import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { useEthersSigner } from "@/utils/adapters"
import { MangroveAmplifier, type Market } from "@mangrovedao/mangrove.js"
import type { Form } from "../types"

type Props = {
  onResult?: (result: Market.OrderResult) => void
}

export function usePostAmplifiedOrder({ onResult }: Props = {}) {
  const { mangrove } = useMangrove()
  const signer = useEthersSigner()
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

      const amp = new MangroveAmplifier({ mgv: mangrove })
    },
    meta: {
      error: "Failed to post the limit order",
    },
    onSuccess: async (data) => {
      // if (!data) return
      // const { order, result } = data
      // /*
      //  * We use a custom callback to handle the success message once it's ready.
      //  * This is because the onSuccess callback from the mutation will only be triggered
      //  * after all the preceding logic has been executed.
      //  */
      // onResult?.(result)
      // try {
      //   // Start showing loading state indicator on parts of the UI that depend on
      //   startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
      //   const { blockNumber } = await (await order.response).wait()
      //   await resolveWhenBlockIsIndexed.mutateAsync({
      //     blockNumber,
      //   })
      //   queryClient.invalidateQueries({ queryKey: ["orders"] })
      //   queryClient.invalidateQueries({ queryKey: ["fills"] })
      // } catch (error) {
      //   console.error(error)
      // }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
