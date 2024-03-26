import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"

import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"

export const useIsLiquidityInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: DefaultTradeLogics | DefaultStrategyLogics,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender, logic?.id],
    queryFn: async () => {
      if (!(token && spender && logic)) return null
      const tokenToApprove = await logic.overlying(token)
      if (tokenToApprove instanceof Token) {
        return await tokenToApprove.allowanceInfinite({ spender })
      } else {
        // TODO: erc721 approve for all
        return
      }
    },
    enabled: !!(token && spender && logic),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
