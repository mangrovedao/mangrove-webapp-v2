import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { getExactWeiAmount } from "@/utils/regexp"
import { motion } from "framer-motion"
import React, { useMemo } from "react"
import { AnimatedOrderBookSkeleton } from "../orderbook/animated-skeleton"

type OrderBookProps = {
  className?: string
  maxHeight?: string
}

const OrderBookV2: React.FC<OrderBookProps> = ({ className }) => {
  const { mergedBooks, refetch, isLoading: ghostBookLoading } = useMergedBooks()
  const { currentMarket } = useMarket()

  const { base, quote } = currentMarket ?? {}
  const { asks, bids } = mergedBooks ?? {}

  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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

  if (ghostBookLoading) return <AnimatedOrderBookSkeleton />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col w-full h-full bg-transparent text-white font-mono",
        className,
      )}
    >
      {/* Column Headers */}
      <div className="flex items-center px-2 py-2 text-white sticky top-0 bg-transparent z-10 border-b border-bg-secondary">
        <motion.span
          className="w-1/3 text-xs"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Price
        </motion.span>
        <motion.span
          className="w-1/3 text-right text-xs"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Size [{base?.symbol}]
        </motion.span>
        <motion.span
          className="w-1/3 text-right text-xs"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Total [{quote?.symbol}]
        </motion.span>
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
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#500] to-transparent group-hover:from-[#fff]"
                  style={{
                    width: `${(ask.cumulative / maxCumulative) * 100}%`,
                    background:
                      "linear-gradient(to right, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.25) 100%)",
                    opacity: 0.9,

                    boxShadow: "inset 0 0 8px rgba(0, 128, 0, 0.1)",
                    borderRadius: "0 4px 4px 0",
                    animation: "simplePulse 4s ease infinite",
                    animationDelay: `${i * 0.1}s`,
                    transition:
                      "width 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, opacity 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    dispatchEvent(
                      new CustomEvent("on-orderbook-offer-clicked", {
                        detail: {
                          price: getExactWeiAmount(
                            ask.price.toString(),
                            quote?.priceDisplayDecimals ?? 8,
                          ),
                        },
                      }),
                    )
                  }}
                />

                {/* Content */}
                <span className="w-1/3 text-[#a92644] text-xs z-10 ">
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
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <span>
                Mid:{" "}
                {midPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                })}
              </span>
              <span>Spread: {percentSpread.toFixed(2)}%</span>
            </motion.div>
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
                    background:
                      "linear-gradient(to right, rgba(0, 128, 0, 0.05) 0%, rgba(0, 128, 0, 0.25) 100%)",
                    opacity: 0.9,

                    boxShadow: "inset 0 0 8px rgba(0, 128, 0, 0.1)",
                    borderRadius: "0 4px 4px 0",
                    animation: "simplePulse 4s ease infinite",
                    animationDelay: `${i * 0.1}s`,
                    transition:
                      "width 0.8s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, opacity 0.3s ease",
                  }}
                />

                {/* Content */}
                <span className="w-1/3 text-[#28986f] text-xs z-10">
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
    </motion.div>
  )
}

export default OrderBookV2
