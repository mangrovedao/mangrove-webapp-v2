import { useMutation } from "@tanstack/react-query"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import useMangroveClient from "@/app/strategies/(shared)/_hooks/use-mangrove"

export function useDeploySmartRouter({ owner }: { owner?: `0x${string}` }) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const mangroveClient = useMangroveClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!publicClient || !address || !walletClient || !mangroveClient)
          return

        const { request } = await mangroveClient.simulateDeployRouter({
          user: address,
        })

        const tx = await walletClient.writeContract(request)
        const res = await publicClient.waitForTransactionReceipt({
          hash: tx,
        })
        return res
      } catch (error) {
        console.error(error)
        throw new Error("Smart router deployment failed")
      }
    },
    meta: {
      error: "Smart router deployment failed",
      success: "Smart router deployed successfully",
    },
  })
}
