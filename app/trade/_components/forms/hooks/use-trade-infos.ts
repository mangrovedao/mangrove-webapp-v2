import { useIsTokenInfiniteAllowance } from "@/hooks/use-is-token-infinite-allowance"
import { useTokenBalance } from "@/hooks/use-token-balance"
import useMarket from "@/providers/market"
import { determinePriceDecimalsFromToken } from "@/utils/numbers"
import { TRADEMODE_AND_ACTION_PRESENTATION } from "../constants"
import { TradeAction } from "../enums"
import { useSpenderAddress } from "./use-spender-address"

export function useTradeInfos(
  type: "limit" | "market",
  tradeAction: TradeAction,
) {
  const { market, marketInfo, requestBookQuery } = useMarket()
  const baseToken = market?.base
  const quoteToken = market?.quote
  const { baseQuoteToSendReceive } =
    TRADEMODE_AND_ACTION_PRESENTATION?.[type][tradeAction]
  const [sendToken, receiveToken] = baseQuoteToSendReceive(
    baseToken,
    quoteToken,
  )

  const sendTokenBalance = useTokenBalance(sendToken)
  const receiveTokenBalance = useTokenBalance(receiveToken)

  const { data: spender } = useSpenderAddress(type)
  const { data: isInfiniteAllowance } = useIsTokenInfiniteAllowance(
    sendToken,
    spender,
  )

  const { asks, bids } = requestBookQuery.data ?? {}

  const lowestAskPrice = asks?.[0]?.price
  const highestBidPrice = bids?.[0]?.price

  const defaultLimitPrice =
    tradeAction === TradeAction.BUY ? highestBidPrice : lowestAskPrice

  const fee =
    (tradeAction === TradeAction.BUY
      ? marketInfo?.asksConfig?.fee
      : marketInfo?.bidsConfig?.fee) ?? 0
  const feeInPercentageAsString = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(fee / 10_000)

  const tickSize = marketInfo?.tickSpacing
    ? `${((1.0001 ** marketInfo?.tickSpacing - 1) * 100).toFixed(2)}%`
    : ""

  const priceDecimals = determinePriceDecimalsFromToken(
    lowestAskPrice?.toNumber(),
    market?.quote,
  )

  const minAsk = market?.getSemibook("asks").getMinimumVolume(200_000)
  const minBid = market?.getSemibook("bids").getMinimumVolume(200_000)

  const minVolume =
    tradeAction === TradeAction.BUY
      ? {
          bid: {
            volume: minAsk?.toFixed(receiveToken?.displayedDecimals),
            token: receiveToken?.symbol,
          },
          ask: {
            volume: minBid?.toFixed(quoteToken?.displayedDecimals),
            token: quoteToken?.symbol,
          },
        }
      : {
          bid: {
            volume: minBid?.toFixed(quoteToken?.displayedDecimals),
            token: quoteToken?.symbol,
          },
          ask: {
            volume: minAsk?.toFixed(sendToken?.displayedDecimals),
            token: sendToken?.symbol,
          },
        }

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
      : Math.max(
          lowestAskPrice?.toNumber() || 0,
          highestBidPrice?.toNumber() || 0,
        ).toFixed(priceDecimals)

  return {
    sendToken,
    receiveToken,
    baseToken,
    quoteToken,
    fee,
    feeInPercentageAsString,
    sendTokenBalance,
    receiveTokenBalance,
    isInfiniteAllowance,
    spender,
    tickSize,
    spotPrice: tempSpotPrice,
    defaultLimitPrice,
    minVolume,
  }
}
