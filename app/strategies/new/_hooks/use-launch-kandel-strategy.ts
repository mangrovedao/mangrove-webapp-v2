import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { KandelParams } from "@mangrovedao/mgv"
import { Address, parseEther } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import useKandelInstance from "../../(shared)/_hooks/use-kandel-instance"

type FormValues = {
  kandelParams?: KandelParams
  bountyDeposit: string
}

export function useLaunchKandelStrategy(kandelAddress?: string) {
  const router = useRouter()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { currentMarket: market } = useMarket()

  const kandelClient = useKandelInstance({
    address: kandelAddress,
    base: market?.base.address,
    quote: market?.quote.address,
  })

  return useMutation({
    mutationFn: async ({ kandelParams, bountyDeposit }: FormValues) => {
      try {
        if (!(kandelParams && kandelClient && walletClient && publicClient))
          throw new Error("Could not launch strategy, missing params")

        const { request } = await kandelClient.simulatePopulate({
          ...kandelParams,
          fromIndex: 0n,
          toIndex: kandelParams.pricePoints,
          account: address as Address,
          value: parseEther(bountyDeposit),
        })

        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })

        toast.success("Kandel strategy successfully launched")
        router.push("/strategies")
        return receipt
      } catch (error) {
        printEvmError(error)
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        throw new Error(description)
      }
    },
    meta: { disableGenericError: true },
  })
}
