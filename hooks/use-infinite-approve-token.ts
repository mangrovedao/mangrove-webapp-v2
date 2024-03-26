import { DefaultStrategyLogics } from "@/app/strategies/(shared)/type"
import { DefaultTradeLogics } from "@/app/trade/_components/forms/types"
import { Token } from "@mangrovedao/mangrove.js"
import { useMutation } from "@tanstack/react-query"

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
              return
            }
          } catch (error) {
            return
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
