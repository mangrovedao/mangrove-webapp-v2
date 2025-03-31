import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { CompleteOffer } from "@mangrovedao/mgv"
import React, { useMemo } from "react"

type OrderBookProps = {
  asks: CompleteOffer[]
  bids: CompleteOffer[]
  className?: string
  maxHeight?: string
}

const OrderBookV2: React.FC<OrderBookProps> = ({ asks, bids, className }) => {
  const { currentMarket } = useMarket()
  const { base, quote } = currentMarket ?? {}

  // Calculate cumulative volumes
  const processedAsks = useMemo(() => {
    const sorted = [...asks].sort((a, b) => a.price - b.price)
    let cumulative = 0

    return sorted.map((ask) => {
      cumulative += ask.total
      return {
        ...ask,
        cumulative,
      }
    })
  }, [asks])

  // For display, we want to show asks in reverse order (highest to lowest)
  const displayAsks = useMemo(() => {
    return [...processedAsks].reverse()
  }, [processedAsks])

  const processedBids = useMemo(() => {
    const sorted = [...bids].sort((a, b) => b.price - a.price)
    let cumulative = 0

    return sorted.map((bid) => {
      cumulative += bid.total
      return {
        ...bid,
        cumulative,
      }
    })
  }, [bids])

  // Calculate spread and midpoint
  const lowestAsk = processedAsks[0]?.price || 0
  const highestBid = processedBids[0]?.price || 0

  const absoluteSpread = lowestAsk - highestBid
  const percentSpread = highestBid > 0 ? (absoluteSpread / highestBid) * 100 : 0
  const midPrice = (lowestAsk + highestBid) / 2

  // Max cumulative for scaling the graph
  const maxCumulative = Math.max(
    processedAsks[processedAsks.length - 1]?.cumulative || 0,
    processedBids[processedBids.length - 1]?.cumulative || 0,
  )

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full bg-transparent text-white font-mono",
        className,
      )}
    >
      {/* Column Headers */}
      <div className="flex items-center px-2 py-2 text-white sticky top-0 bg-transparent z-10 border-b border-bg-secondary">
        <span className="w-1/3 text-xs">Price</span>
        <span className="w-1/3 text-right text-xs">Size [{quote?.symbol}]</span>
        <span className="w-1/3 text-right text-xs">
          Total [{quote?.symbol}]
        </span>
      </div>

      <ScrollArea className="h-full">
        <div className="flex flex-col h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Ask (Sell) Orders */}
          <div className="flex flex-col">
            {displayAsks.map((ask, i) => (
              <div
                key={`ask-${i}`}
                className="flex items-center px-3 py-[4px] relative hover:bg-white/5 group"
              >
                {/* Background volume bar */}
                <div
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#500] to-transparent group-hover:from-[#700]"
                  style={{
                    width: `${(ask.cumulative / maxCumulative) * 100}%`,
                  }}
                />

                {/* Content */}
                <span className="w-1/3 text-[#FF3B69] text-xs z-10">
                  {ask.price.toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                  })}
                </span>
                <span className="w-1/3 text-right text-[#c3d4c7] text-xs z-10">
                  {ask.volume.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="w-1/3 text-right text-[#c3d4c7] text-xs z-10">
                  {ask.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Spread indicator with spread and midprice info */}
          <div className="py-1.5 flex justify-center items-center border-y border-bg-secondary text-[#c3d4c7] text-xs sticky z-10">
            <div className="flex gap-2">
              <span>
                Mid:{" "}
                {midPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                })}
              </span>
              <span>Spread: {percentSpread.toFixed(2)}%</span>
            </div>
          </div>

          {/* Bid (Buy) Orders */}
          <div className="flex flex-col">
            {processedBids.map((bid, i) => (
              <div
                key={`bid-${i}`}
                className="flex items-center px-3 py-[4px] relative hover:bg-white/5 group"
              >
                {/* Background volume bar */}
                <div
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#050] to-transparent group-hover:from-[#070]"
                  style={{
                    width: `${(bid.cumulative / maxCumulative) * 100}%`,
                  }}
                />

                {/* Content */}
                <span className="w-1/3 text-[#00A86B] text-xs z-10">
                  {bid.price.toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                  })}
                </span>
                <span className="w-1/3 text-right text-[#c3d4c7] text-xs z-10">
                  {bid.volume.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="w-1/3 text-right text-[#c3d4c7] text-xs z-10">
                  {bid.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="vertical" className="z-50" />
      </ScrollArea>
    </div>
  )
}

export default OrderBookV2
