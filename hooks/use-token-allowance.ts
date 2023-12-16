import type { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"

export const useTokenAllowance = (token?: Token, spender?: string | null) => {
  return useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["tokenAllowance", token?.id, spender],
    queryFn: () => {
      if (!(token && spender)) return null
      return token.allowance({ spender })
    },
    enabled: !!token && !!spender,
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
