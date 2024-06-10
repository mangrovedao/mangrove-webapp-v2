import useMarket from "@/providers/market.new"
import { useMutation } from "@tanstack/react-query"
import { Address } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import useKandelInstance from "./use-kandel-instance"

export function useActivateKandelLogics(kandelAddress?: string) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { currentMarket } = useMarket()
  const { data: walletClient } = useWalletClient()

  const kandelClient = useKandelInstance({
    address: kandelAddress,
    base: currentMarket?.base.address,
    quote: currentMarket?.quote.address,
  })

  return useMutation({
    mutationFn: async ({
      logic,
      gasreq,
    }: {
      logic: string
      gasreq: number
    }) => {
      try {
        if (!publicClient || !address || !walletClient || !kandelClient) return
        const { request } = await kandelClient.simulateSetLogics({
          account: address as Address,
          baseLogic: logic as Address,
          quoteLogic: logic as Address,
          gasreq: BigInt(gasreq),
        })
        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient?.waitForTransactionReceipt({
          hash,
        })
        return receipt
      } catch (error) {
        console.error(error)
        throw new Error("Could not set liquidity sourcing.")
      }
    },
    meta: {
      error: "Could not set liquidity sourcing.",
      success: "Liquidity sourcing has been set successfully.",
    },
  })
}
