import { DefaultLogics } from "@/app/trade/_components/forms/types"
import { Token } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"

export const useIsTokenInfiniteAllowance = (
  token?: Token,
  spender?: string | null,
  logic?: DefaultLogics,
) => {
  return useQuery({
    queryKey: ["isTokenInfiniteAllowance", token?.id, spender, logic?.id],
    queryFn: async () => {
      console.log({ spender, token })
      if (!(token && spender)) return null
      if (logic) {
        const tokenToApprove = await logic.overlying(token)
        if (tokenToApprove instanceof Token) {
          console.log("is token")
          return await tokenToApprove.allowanceInfinite({ spender })
        } else {
          console.log("is erc721")
          // TODO: erc721 approve for all
          return
        }
      } else {
        console.log("no logic passed")
        return token.allowanceInfinite({ spender })
      }
    },
    enabled: !!(token && spender),
    meta: {
      error: "Failed to fetch token allowance",
    },
  })
}
