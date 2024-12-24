import { kandelSeederActions } from "@mangrovedao/mgv"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAccount, useClient, usePublicClient, useWalletClient } from "wagmi"

import { useAaveKandelSeeder, useKandelSeeder } from "@/hooks/use-addresses"
import useMarket from "@/providers/market"
import { printEvmError } from "@/utils/errors"
import { getTitleDescriptionErrorMessages } from "@/utils/tx-error-messages"
type Props = {
  liquiditySourcing?: string
}
export function useCreateKandelStrategy({ liquiditySourcing }: Props) {
  const { address } = useAccount()
  const { currentMarket } = useMarket()
  const client = useClient()
  const kandelSeeder = useKandelSeeder()
  const kandelAaveSeeder = useAaveKandelSeeder()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const kandelSeederAddress =
    liquiditySourcing === "Aave" ? kandelAaveSeeder : kandelSeeder

  return useMutation({
    mutationFn: async () => {
      try {
        if (
          !kandelSeederAddress ||
          !address ||
          !client ||
          !currentMarket ||
          !walletClient
        )
          return

        const kandelActions = kandelSeederActions(
          currentMarket,
          kandelSeederAddress,
        )

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
        printEvmError(error)
        const { description } = getTitleDescriptionErrorMessages(error as Error)
        toast.error(description)
        throw new Error(description)
      }

      // TODO: invalidate strategies query
    },
    meta: { disableGenericError: true },
  })
}
