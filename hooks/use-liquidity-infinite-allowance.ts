import { Logic, Token } from "@mangrovedao/mgv"
import { useQuery } from "@tanstack/react-query"

export const useIsLiquidityInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: Logic,
) => {
  return useQuery({
    queryKey: [
      "isTokenInfiniteAllowance",
      token?.address,
      spender,
      logic?.name,
    ],
    queryFn: async () => {
      // if (!(token && spender && logic)) return null
      // const tokenToApprove = await logic.overlying(token)
      // if (tokenToApprove instanceof Token) {
      //   return await tokenToApprove.allowanceInfinite({ spender })
      // } else {
      //   // TODO: erc721 approve for all
      //   return
      // }
    },
    enabled: !!(token && spender && logic),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
