import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"

import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"

export const useIsTokenInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: DefaultTradeLogics | DefaultStrategyLogics,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender, logic?.id],
    queryFn: async () => {
      if (!(token && spender)) return null
      if (logic) {
        const tokenToApprove = await logic.overlying(token)
        if (tokenToApprove instanceof Token) {
          return await tokenToApprove.allowanceInfinite({ spender })
        } else {
          console.log("nft")
          // TODO: erc721 approve for all
          return
        }
      } else {
        return token.allowanceInfinite({ spender })
      }
    },
    enabled: !!(token && spender),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
