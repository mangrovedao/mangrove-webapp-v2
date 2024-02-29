import type { Token } from "@mangrovedao/mangrove.js"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import { useQuery } from "@tanstack/react-query"

export const useIsTokenInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: SimpleLogic | SimpleAaveLogic | OrbitLogic,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender, logic?.id],
    queryFn: async () => {
      if (!(token && spender)) return null
      if (logic) {
        const tokenToApprove = await logic.overlying(token)
        return await tokenToApprove.allowanceInfinite({ spender })
      } else {
        return token.allowanceInfinite({ spender })
      }
    },
    enabled: !!token && !!spender,
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
