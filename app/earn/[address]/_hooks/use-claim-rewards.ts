import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Address, parseAbi } from "viem"
import { simulateContract, waitForTransactionReceipt } from "viem/actions"
import { useAccount, useWalletClient } from "wagmi"

const rewardsAbi = parseAbi([
  "function claim(address account, address reward, uint256 amount, bytes32[] proof)",
])

const rewardDistributorAddress = "0xDb6A3A20743f5878732EF73623a51033c80DBB10"

export function useClaimRewards() {
  const { defaultChain } = useDefaultChain()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const queryClient = useQueryClient()
  const client = useNetworkClient()

  return useMutation({
    mutationFn: async ({
      rewardToken,
      amount,
      proof,
    }: {
      rewardToken: Address
      amount: string
      proof: `0x${string}`[]
    }) => {
      try {
        if (!address) throw new Error("No address connected")

        const { request } = await simulateContract(client, {
          address: rewardDistributorAddress,
          abi: rewardsAbi,
          functionName: "claim",
          args: [address, rewardToken, BigInt(amount), proof],
        })

        const tx = await walletClient?.writeContract(request)
        if (!tx) throw new Error("Transaction failed")
        const receipt = await waitForTransactionReceipt(client, { hash: tx })
        if (receipt.status === "success") {
          toast.success("Rewards claimed successfully")
          return receipt
        } else {
          throw new Error("Transaction failed")
        }
      } catch (error) {
        printEvmError(error)
        toast.error("Transaction failed")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rewards-proofs", address, defaultChain.id],
      })
    },
    onError: (error) => {
      printEvmError(error)
    },
  })
}
