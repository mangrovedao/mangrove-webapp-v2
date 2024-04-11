import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import { Address, erc721Abi } from "viem"
import { useAccount, usePublicClient } from "wagmi"

import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"

export const useIsTokenInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: DefaultTradeLogics | DefaultStrategyLogics,
) => {
  const publicClient = usePublicClient()
  const { address: owner } = useAccount()

  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender, logic?.id],
    queryFn: async () => {
      try {
        if (!(token && spender && publicClient && owner)) return null

        if (logic?.id) {
          const tokenToApprove = await logic.overlying(token)
          if (tokenToApprove instanceof Token) {
            return await tokenToApprove.allowanceInfinite({ spender })
          } else {
            return await publicClient.readContract({
              address: tokenToApprove as Address,
              abi: erc721Abi,
              functionName: "isApprovedForAll",
              args: [owner as Address, spender as Address],
            })
          }
        } else {
          return token.allowanceInfinite({ spender })
        }
      } catch (error) {
        console.error(error)
      }
    },
    enabled: !!(token && spender),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
