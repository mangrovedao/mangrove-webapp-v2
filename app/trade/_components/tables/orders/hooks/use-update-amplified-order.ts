import { MangroveAmplifier } from "@mangrovedao/mangrove.js"
import { Token } from "@mangrovedao/mgv"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { parseUnits } from "viem"

import { TRADE } from "@/app/trade/_constants/loading-keys"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { useLoadingStore } from "@/stores/loading.store"
import { AmplifiedForm } from "../types"

type useUpdateOrderProps = {
  form: AmplifiedForm & { sendToken: Token }
  bundleId?: string
  onResult?: (tx: string) => void
}

export function useUpdateAmplifiedOrder({
  bundleId,
  onResult,
}: useUpdateOrderProps) {
  const { mangrove } = useMangrove()
  const { market } = useMarket()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()
  const queryClient = useQueryClient()
  const [startLoading, stopLoading] = useLoadingStore((state) => [
    state.startLoading,
    state.stopLoading,
  ])

  return useMutation({
    mutationFn: async ({
      form,
    }: {
      form: AmplifiedForm & { sendToken: Token }
    }) => {
      try {
        if (!mangrove || !market || !bundleId) return
        const { send: volume } = form
        const amp = new MangroveAmplifier({ mgv: mangrove })
        const parsedVolume = parseUnits(volume, form.sendToken.decimals)

        const editBundle = await amp.updateBundle({
          bundleId,
          expiryDate: form.timeToLive,
          outboundToken: form.sendToken.address,
          outboundVolume: parsedVolume,
          updateExpiry: false,
        })

        const tx = (await editBundle.response).wait()
        const hash = await tx
        toast.success("Amplified order updated successfully")
        return { tx: hash }
      } catch (error) {
        console.error(error)
        toast.error("Failed to update the amplified order")
      }
    },
    meta: {
      error: "Failed to update the amplified limit order",
    },
    onSuccess: async (data) => {
      if (!data) return
      const { tx } = data
      /*
       * We use a custom callback to handle the success message once it's ready.
       * This is because the onSuccess callback from the mutation will only be triggered
       * after all the preceding logic has been executed.
       */
      try {
        // Start showing loading state indicator on parts of the UI that depend on
        startLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
        const blockNumber = tx.blockNumber
        onResult?.(tx.transactionHash)

        await resolveWhenBlockIsIndexed.mutateAsync({
          blockNumber,
        })
        queryClient.invalidateQueries({ queryKey: ["fills"] })
        queryClient.invalidateQueries({ queryKey: ["orders"] })
        queryClient.invalidateQueries({ queryKey: ["amplified"] })
      } catch (error) {
        console.error(error)
      }
    },
    onSettled: () => {
      stopLoading([TRADE.TABLES.ORDERS, TRADE.TABLES.FILLS])
    },
  })
}
