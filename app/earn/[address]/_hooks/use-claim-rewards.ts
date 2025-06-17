import { useDefaultChain } from "@/hooks/use-default-chain"
import { useNetworkClient } from "@/hooks/use-network-client"
import { printEvmError } from "@/utils/errors"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Address, parseUnits } from "viem"
import { simulateContract, waitForTransactionReceipt } from "viem/actions"
import { useAccount, useWalletClient } from "wagmi"

const rewardsAbi = [
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "reward", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "proof", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

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
      amount: number
      proof: `0x${string}`[]
    }) => {
      try {
        if (!address) throw new Error("No address connected")

        const { request } = await simulateContract(client, {
          address: rewardDistributorAddress,
          abi: rewardsAbi,
          functionName: "claim",
          args: [
            address,
            rewardToken,
            parseUnits(amount.toString(), 18),
            proof,
          ],
        })

        const tx = await walletClient?.writeContract(request)
        if (!tx) throw new Error("Transaction failed")
        const receipt = await waitForTransactionReceipt(client, { hash: tx })
        if (receipt.status === "success") {
          return receipt
        } else {
          throw new Error("Transaction failed")
        }
      } catch (error) {
        printEvmError(error)
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
