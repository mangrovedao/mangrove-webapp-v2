import { DefaultLogics } from "@/app/trade/_components/forms/types"
import type { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"

export const useIsLiquidityInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: DefaultLogics,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender, logic?.id],
    queryFn: async () => {
      if (!(token && spender && logic)) return null
      const tokenToApprove = await logic.overlying(token)
      return await tokenToApprove.allowanceInfinite({ spender })
    },
    enabled: !!(token && spender && logic),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
