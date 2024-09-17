import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { KandelParams } from "@mangrovedao/mgv"
import {
  Address,
  BaseError,
  ContractFunctionExecutionError,
  parseEther,
} from "viem"
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
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        console.error(error)
        throw new Error(description)
      }
    },
    meta: { disableGenericError: true },
  })
}
