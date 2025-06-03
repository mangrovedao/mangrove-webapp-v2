import { useNetworkClient } from "@/hooks/use-network-client"
import { Token } from "@mangrovedao/mgv"
import { useMutation } from "@tanstack/react-query"
import { Address, maxUint256 } from "viem"
import { useWalletClient } from "wagmi"
import { approveAmount } from "../lib/allowance"

export function useApproveAmount({
  token,
  spender,
  sendAmount,
}: {
  token?: Token
  spender?: string
  sendAmount: string
}) {
  const publicClient = useNetworkClient()

  const { data: walletClient } = useWalletClient()

  return useMutation({
    mutationFn: async () => {
      try {
        if (!token) throw new Error("Token is not defined")
        if (!spender) throw new Error("Spender address is not defined")
        if (!publicClient) throw new Error("Network client is not connected")
        if (!walletClient) throw new Error("Wallet is not connected")
        if (!walletClient.account) throw new Error("No account connected")

        const tokenToApprove = token.address

        const receipt = await approveAmount(
          walletClient,
          spender as Address,
          tokenToApprove,
          maxUint256,
        )

        return receipt
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    meta: {
      error: "Failed the approval",
      success: "The approval has been successfully set",
    },
  })
}
