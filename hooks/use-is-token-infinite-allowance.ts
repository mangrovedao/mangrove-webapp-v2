import type { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"

export const useIsTokenInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender],
    queryFn: () => {
      if (!(token && spender)) return null
      return token.allowanceInfinite({ spender })
    },
    enabled: !!token && !!spender,
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
