import { useTokenBalance } from "@/hooks/use-balances"
import { useBook } from "@/hooks/use-book"
import useMarket from "@/providers/market.new"
import { determineDecimals } from "@/utils/numbers"
import { BS } from "@mangrovedao/mgv/lib"
import { useSpenderAddress } from "./use-spender-address"

export function useTradeInfos(type: "limit" | "market", bs: BS) {
  const { currentMarket } = useMarket()
  const baseToken = currentMarket?.base
  const quoteToken = currentMarket?.quote

  const [sendToken, receiveToken] =
    bs === BS.buy ? [quoteToken, baseToken] : [baseToken, quoteToken]

  const sendTokenBalance = useTokenBalance({ token: sendToken?.address })
  const receiveTokenBalance = useTokenBalance({ token: receiveToken?.address })

  const { data: spender } = useSpenderAddress(type)
  // const { data: isInfiniteAllowance } = useIsTokenInfiniteAllowance(
  //   sendToken,
  //   spender,
  // )
  const { book } = useBook()
  const asks = book?.asks
  const bids = book?.bids

  const lowestAskPrice = asks?.[0]?.price
  const highestBidPrice = bids?.[0]?.price

  const defaultLimitPrice = bs === BS.buy ? highestBidPrice : lowestAskPrice

  const fee = Number(
    (bs === BS.buy ? book?.asksConfig?.fee : book?.bidsConfig?.fee) ?? 0,
  )
  const feeInPercentageAsString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(fee / 10_000)

  const tickSize = currentMarket?.tickSpacing
    ? `${((1.0001 ** Number(currentMarket?.tickSpacing) - 1) * 100).toFixed(2)}%`
    : ""

  const priceDecimals = determineDecimals(
    lowestAskPrice,
    currentMarket?.quote.priceDisplayDecimals,
  )

  // const spread = lowestAskPrice
  //   ?.sub(highestBidPrice ?? 0)
  //   .toFixed(priceDecimals)

  // const spotPrice =
  //   spread && Number(spread) <= 0
  //     ? Math.max(
  //         lowestAskPrice?.toNumber() || 0,
  //         highestBidPrice?.toNumber() || 0,
  //       ).toFixed(priceDecimals)
  //     : spread

  const tempSpotPrice =
    !lowestAskPrice || !highestBidPrice
      ? undefined
      : Math.max(lowestAskPrice || 0, highestBidPrice || 0).toFixed(
          priceDecimals,
        )

  return {
    sendToken,
    receiveToken,
    baseToken,
    quoteToken,
    fee,
    feeInPercentageAsString,
    sendTokenBalance,
    receiveTokenBalance,
    spender,
    tickSize,
    spotPrice: tempSpotPrice,
    defaultLimitPrice,
  }
}
