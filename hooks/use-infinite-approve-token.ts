import type { Token } from "@mangrovedao/mangrove.js"
import { OrbitLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/OrbitLogic"
import { SimpleAaveLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleAaveLogic"
import { SimpleLogic } from "@mangrovedao/mangrove.js/dist/nodejs/logics/SimpleLogic"
import { useMutation } from "@tanstack/react-query"

export function useInfiniteApproveToken() {
  return useMutation({
    mutationFn: async ({
      token,
      spender,
      logic,
    }: {
      token?: Token
      logic?: SimpleLogic | SimpleAaveLogic | OrbitLogic
      spender?: string | null
    }) => {
      try {
        if (!(token && spender)) return
        if (logic) {
          try {
            const tokenToApprove = await logic.overlying(token)

            const result = await tokenToApprove.approve(spender)
            return result.wait()
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
