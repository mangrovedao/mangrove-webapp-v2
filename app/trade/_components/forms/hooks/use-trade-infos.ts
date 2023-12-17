import { useIsTokenInfiniteAllowance } from "@/hooks/use-is-token-infinite-allowance"
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMarket from "@/providers/market"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../constants"
import { TradeAction } from "../enums"
import { useSpenderAddress } from "./use-spender-address"

export function useTradeInfos(
  type: "limit" | "market",
  tradeAction: TradeAction,
) {
  const { market, marketInfo } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote
  const { baseQuoteToSendReceive } =
    TRADEMODE_AND_ACTION_PRESENTATION?.[type][tradeAction]
  const [sendToken, receiveToken] = baseQuoteToSendReceive(
    baseToken,
    quoteToken,
  )
  const sendTokenBalance = useTokenBalance(sendToken)
  const { data: spender } = useSpenderAddress(type)
  const { data: isInfiniteAllowance } = useIsTokenInfiniteAllowance(
    sendToken,
    spender,
  )

  const fee =
    (tradeAction === TradeAction.BUY
      ? marketInfo?.asksConfig?.fee
      : marketInfo?.bidsConfig?.fee) ?? 0
  const feeInPercentageAsString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(fee / 10_000)

  return {
    sendToken,
    receiveToken,
    baseToken,
    quoteToken,
    fee,
    feeInPercentageAsString,
    sendTokenBalance,
    isInfiniteAllowance,
    spender,
  }
}
