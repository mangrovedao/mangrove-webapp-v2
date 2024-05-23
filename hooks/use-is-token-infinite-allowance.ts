import { Token } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"

export const useIsTokenInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: DefaultTradeLogics | DefaultStrategyLogics,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.address, spender, logic?.id],
    queryFn: async () => {
      return false
      // if (!(token && spender && generalClient && address)) return null

      // if (logic) {
      //   const tokenToApprove = await logic.overlying(token)
      //   if (tokenToApprove instanceof Token) {
      //     return await tokenToApprove.allowanceInfinite({ spender })
      //   } else {
      //     // TODO: erc721 approve for all
      //     return
      //   }
      // } else {
      //   return token.allowanceInfinite({ spender })
      // }
    },
    enabled: !!(token && spender),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
