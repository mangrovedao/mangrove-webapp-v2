import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import useKandelInstance from "@/app/strategies/(shared)/_hooks/use-kandel-instance"
import { useResolveWhenBlockIsIndexed } from "@/hooks/use-resolve-when-block-is-indexed"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { KandelParams } from "@mangrovedao/mgv"
import { Address, parseEther } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

type FormValues = {
  kandelParams?: KandelParams
  bountyDeposit: string
}

export function useEditKandelStrategy(
  kandelClient?: ReturnType<typeof useKandelInstance>,
) {
  const queryClient = useQueryClient()
  const resolveWhenBlockIsIndexed = useResolveWhenBlockIsIndexed()

  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return useMutation({
    mutationFn: async ({ kandelParams, bountyDeposit }: FormValues) => {
      try {
        if (!(kandelParams && kandelClient && walletClient && publicClient))
          throw new Error("Could not launch strategy, missing params")

        const { request } = await kandelClient.simulatePopulate({
          ...kandelParams,
          account: address as Address,
          value: parseEther(bountyDeposit),
        })

        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })

        toast.success("Kandel strategy successfully edited")
        return receipt
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    onSuccess: async (data) => {
      try {
        // if (!data) return
        // const { txs } = data
        // await Promise.all(
        //   txs.map(async (tx) => {
        //     await resolveWhenBlockIsIndexed.mutateAsync({
        //       blockNumber: tx?.blockNumber,
        //     })
        //   }),
        // )
        queryClient.invalidateQueries({ queryKey: ["strategy-status"] })
        queryClient.invalidateQueries({ queryKey: ["strategy"] })
      } catch (error) {
        console.error(error)
      }
    },
    meta: { disableGenericError: true },
  })
}
