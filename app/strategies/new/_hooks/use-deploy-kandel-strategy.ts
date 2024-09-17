import { kandelSeederActions } from "@mangrovedao/mgv"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAccount, useClient, usePublicClient, useWalletClient } from "wagmi"

import { useKandelSeeder } from "@/hooks/use-addresses"
import useMarket from "@/providers/market"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
import { BaseError, ContractFunctionExecutionError } from "viem"

export function useCreateKandelStrategy() {
  const { address } = useAccount()
  const { currentMarket } = useMarket()
  const client = useClient()
  const kandelSeeder = useKandelSeeder()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (
          !kandelSeeder ||
          !address ||
          !client ||
          !currentMarket ||
          !walletClient
        )
          return

        const kandelActions = kandelSeederActions(currentMarket, kandelSeeder)
        const seeder = kandelActions(client)

        const { request, result } = await seeder.simulateSow({
          account: address,
        })
        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient?.waitForTransactionReceipt({
          hash,
        })

        toast.success("Kandel strategy instance successfully created")
        return { kandelAddress: result, receipt }
      } catch (error) {
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
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
        throw new Error(description)
      }

      // TODO: invalidate strategies query
    },
    meta: { disableGenericError: true },
  })
}
