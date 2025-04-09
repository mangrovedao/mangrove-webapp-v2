import { BS } from "@mangrovedao/mgv/lib"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useMarketClient } from "@/hooks/use-market"

import { useLoadingStore } from "@/stores/loading.store"
import { printEvmError } from "@/utils/errors"
import { MarketParams } from "@mangrovedao/mgv"
import type { Order } from "../schema"

type Props = {
  offerId?: string
  market?: MarketParams
  onCancel?: () => void
}

export function useCancelOrder({ offerId, market, onCancel }: Props = {}) {
  const queryClient = useQueryClient()
  const { address } = useAccount()

  const [startLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])
  const { data: walletClient } = useWalletClient()
  const marketClient = useMarketClient({ market })
  const publicClient = usePublicClient()

  return useMutation({
    /*
     * We introduce a mutationKey to the useCancelOrder hook. This allows us to
     * handle multiple order retractions simultaneously, without them sharing the
     * same mutation state. This is crucial for maintaining independent states
     * for each retraction operation.
     */
    mutationKey: ["retractOrder", offerId],
    mutationFn: async ({ order }: { order: Order }) => {
      try {
        if (!offerId || !walletClient || !publicClient || !marketClient)
          throw new Error("Retract order missing params")

        const { request } = await marketClient.simulateRemoveOrder({
          offerId: BigInt(offerId),
          bs: order.isBid ? BS.buy : BS.sell,
          account: address,
        })

        const tx = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: tx,
        })

        return receipt
      } catch (error) {
        printEvmError(error)
        toast.error(`Failed to retract the order ${offerId ?? ""}`)
      }
    },
    onSuccess: async (data) => {
      if (!data) return
      const { blockNumber } = data
      onCancel?.()
      try {
        startLoading(TRADE.TABLES.ORDERS)

        queryClient.invalidateQueries({ queryKey: ["orders"] })
      } catch (error) {
        console.error(error)
      }
    },
    meta: {
      error: `Failed to retract the order ${offerId ?? ""}`,
      // success: `The order ${offerId ?? ""} has been successfully retracted`,
    },
  })
}
