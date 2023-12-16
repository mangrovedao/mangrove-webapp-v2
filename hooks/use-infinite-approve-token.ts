import type { Token } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"

export function useInfiniteApproveToken() {
  return useMutation({
    mutationFn: async ({
      token,
      spender,
    }: {
      token?: Token
      spender?: string | null
    }) => {
      if (!(token && spender)) return
      await token.approve(spender)
    },
    meta: {
      error: "Failed the approval",
      success: "The approval has been successfully set",
    },
  })
}
