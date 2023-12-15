import { useMutation } from "@tanstack/react-query"
import Big from "big.js"

import useMangrove from "@/providers/mangrove"
import useMarket from "@/providers/market"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../../constants"
import type { Form } from "../types"

export function useApproveLimitOrder() {
  const { mangrove } = useMangrove()
  const { market } = useMarket()

  return useMutation({
    mutationFn: async ({ form }: { form: Form }) => {
      if (!mangrove || !market) return
      const { tradeAction, send } = form
      // DOUBLE Approval for limit order's explanation:
      /** limit orders first calls take() on the underlying contract which consumes the given amount of allowance,
        then if it posts an offer, then it transfers the tokens back to the wallet, and the offer then consumes up to the given amount of allowance 
        */
      const spender = await mangrove?.orderContract.router()
      if (!spender) return
      const { baseQuoteToSendReceive } =
        TRADEMODE_AND_ACTION_PRESENTATION.limit[tradeAction]
      const [sendToken] = baseQuoteToSendReceive(market.base, market.quote)
      const sendAsBig = Big(send)
      await sendToken.increaseApproval(spender, sendAsBig)
    },
    meta: {
      error: "Failed the approval for the order",
      success: "The approval has been successfully set",
    },
  })
}
