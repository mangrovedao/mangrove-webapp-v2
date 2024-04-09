import { Token } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"

import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"

export function useInfiniteApproveToken() {
  return useMutation({
    mutationFn: async ({
      token,
      spender,
      logic,
    }: {
      token?: Token
      logic?: DefaultTradeLogics | DefaultStrategyLogics
      spender?: string | null
    }) => {
      try {
        if (!(token && spender)) return
        if (logic) {
          try {
            const tokenToApprove = await logic.overlying(token)
            if (tokenToApprove instanceof Token) {
              const result = await tokenToApprove.approve(spender)
              return result.wait()
            } else {
              // TODO: implement logic for erc721
              return undefined
            }
          } catch (error) {
            throw new Error(`Could set approval for ${logic.id} sourcing`)
          }
        } else {
          const result = await token.approve(spender)
          return result.wait()
        }
      } catch (error) {
        console.error(error)
        throw new Error("Failed the approval")
      }
    },
    meta: {
      error: "Failed the approval",
      success: "The approval has been successfully set",
    },
  })
}
