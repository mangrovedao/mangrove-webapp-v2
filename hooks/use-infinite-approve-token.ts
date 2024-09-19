import { Logic, Token } from "@mangrovedao/mgv"
import { useMutation } from "@tanstack/react-query"
import { Address, erc20Abi, maxUint256 } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

import { useBalances } from "./use-balances"

export function useInfiniteApproveToken() {
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const balances = useBalances()
  console.log(1)

  return useMutation({
    mutationFn: async ({
      token,
      spender,
      logic,
    }: {
      token?: Token
      logic?: Logic
      spender?: string | null
    }) => {
      try {
        console.log(2, token, logic, spender)

        if (!(token && spender && publicClient && walletClient)) return

        console.log(3)
        const logicToken = balances.balances?.overlying.find(
          (item) => item.logic.name === logic?.name,
        )

        const tokenToApprove =
          logic && logicToken?.overlying
            ? logicToken?.overlying?.address
            : token.address

        const { request } = await publicClient.simulateContract({
          address: tokenToApprove,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender as Address, maxUint256],
          account: userAddress,
        })

        const hash = await walletClient.writeContract(request)
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
        })

        return receipt
      } catch (error) {
        console.error(error)
        throw new Error("Failed the approval")
      }
    },
    meta: {
      error: "Failed the approval",
      success: "The approval has been successfully set",
    },
  })
}
