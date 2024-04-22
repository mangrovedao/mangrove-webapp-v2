import { Token } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"

import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"
import { Address, erc721Abi } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

export function useInfiniteApproveToken() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { address: owner } = useAccount()

  return useMutation({
    mutationFn: async ({
      token,
      spender,
      logic,
    }: {
      token?: Token
      logic?: DefaultTradeLogics | DefaultStrategyLogics
      spender?: string | null
    }) => {
      try {
        if (!(token && spender && walletClient && publicClient && owner)) return
        if (logic) {
          try {
            const tokenToApprove = await logic.overlying(token)

            if (tokenToApprove instanceof Token) {
              const result = await tokenToApprove.approve(spender)
              const receipt = await result.wait()
              // const isInfinite = await tokenToApprove.allowanceInfinite({
              //   spender,
              // })
              // if (!isInfinite)
              //   throw new Error(
              //     "We need atleast twice the amount to be approved.",
              //   )
              return receipt
            } else {
              const { request } = await publicClient.simulateContract({
                account: owner,
                address: tokenToApprove as Address,
                abi: erc721Abi,
                functionName: "setApprovalForAll",
                args: [spender as Address, true],
              })

              const hash = await walletClient.writeContract(request)
              const transaction = await publicClient.waitForTransactionReceipt({
                hash,
              })
              if (transaction.status === "reverted")
                throw new Error("Failed the approval")

              return transaction
            }
          } catch (error) {
            throw new Error(`Could set approval for ${logic.id} sourcing`)
          }
        } else {
          const result = await token.approve(spender)
          const receipt = result.wait()
          // const isInfinite = await token.allowanceInfinite({
          //   spender,
          // })
          // if (!isInfinite)
          //   throw new Error("We need atleast twice the amount to be approved.")

          return receipt
        }
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
