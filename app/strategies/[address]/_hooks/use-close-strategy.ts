import type { KandelStrategies, Market } from "@mangrovedao/mangrove.js"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { useLoadingStore } from "@/stores/loading.store"

type Props = {
  strategyAddress?: string
}

export function useCloseStrategy({ strategyAddress }: Props) {
  const router = useRouter()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useMutation({
    mutationFn: async ({
      base,
      quote,
      kandelStrategies,
      getMarketFromAddresses,
    }: {
      base?: string
      quote?: string
      kandelStrategies?: KandelStrategies
      getMarketFromAddresses: (
        base: string,
        quote: string,
      ) => Promise<Market> | undefined
    }) => {
      if (!base || !quote) return
      const market = await getMarketFromAddresses(base, quote)

      if (!market || !strategyAddress) return
      const stratInstance = await kandelStrategies?.instance({
        address: strategyAddress,
        market,
      })

      const txs = await stratInstance?.retractAndWithdraw()
      const result = txs && (await Promise.all(txs.map((tx) => tx?.wait())))

      toast.success("Strategy closed with success")
      return { result }
    },
    meta: {
      error: "Failed to close strategy",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { result } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */

      try {
        queryClient.invalidateQueries({ queryKey: ["strategies"] })
      } catch (error) {
        console.error(error)
      }

      return setTimeout(() => {
        router.push("/strategies")
      }, 5000)
    },
    onError(error, variables, context) {
      console.error(error)
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
