import { useIsTokenInfiniteAllowance } from "@/hooks/use-is-token-infinite-allowance"
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMarket from "@/providers/market"

export function useStrategyInfos() {
  const { market, marketInfo } = useMarket()

  const baseToken = market?.base
  const quoteToken = market?.quote

  const sendTokenBalance = useTokenBalance()
  const { data: isInfiniteBase } = useIsTokenInfiniteAllowance(baseToken, "")
  const { data: isInfiniteQuote } = useIsTokenInfiniteAllowance(baseToken, "")

  return {
    baseToken,
    quoteToken,
    sendTokenBalance,
    isInfiniteBase,
    isInfiniteQuote,
  }
}
