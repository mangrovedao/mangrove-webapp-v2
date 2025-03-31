"use client"

import { usePool } from "@/hooks/new_ghostbook/pool"
import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { useMemo } from "react"

interface PriceChartProps {
  className?: string
}

export default function EmbedPriceChart({ className }: PriceChartProps) {
  const pool = usePool()
  const { currentMarket } = useMarket()
  const { defaultChain } = useDefaultChain()

  // Determine the chain name for GeckoTerminal URL
  const chainName = useMemo(() => {
    if (!defaultChain?.id) return "base"

    // Map chain IDs to GeckoTerminal chain names
    const chainMap: Record<number, string> = {
      1: "eth", // Ethereum
      42161: "arbitrum", // Arbitrum
      56: "bsc", // Binance Smart Chain
      137: "polygon", // Polygon
      43114: "avalanche", // Avalanche
      8453: "base", // Base
      10: "optimism", // Optimism
      1313161554: "aurora", // Aurora
      42220: "celo", // Celo
    }

    return chainMap[defaultChain.id] || "base" // Default to Base if not found
  }, [defaultChain])

  // Build the embed URL
  const embedUrl = useMemo(() => {
    if (!pool?.pool) return null

    return `https://www.geckoterminal.com/${chainName}/pools/${pool.pool}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m&transparent=1`
  }, [pool, chainName])

  // Show loading state while pool is being fetched
  if (!pool) {
    return (
      <div
        className={cn(
          "h-full w-full flex items-center justify-center bg-transparent rounded-md",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-t-2 border-[#00A86B] rounded-full"></div>
          <p className="text-sm text-[#999]">Loading chart...</p>
        </div>
      </div>
    )
  }

  // Show a message if no pool address is available
  if (!embedUrl) {
    return (
      <div
        className={cn(
          "h-full w-full flex items-center justify-center bg-transparent rounded-md p-4",
          className,
        )}
      >
        <div className="text-center">
          <p className="text-lg text-[#999] mb-2">No price chart available</p>
          <p className="text-sm text-[#777] max-w-md">
            {currentMarket
              ? `No liquidity pool found for ${currentMarket.base.symbol}/${currentMarket.quote.symbol}`
              : "Please select a market to view the price chart"}
          </p>
        </div>
      </div>
    )
  }

  // Render the GeckoTerminal embed with the pool address
  return (
    <div
      className={cn(
        "h-full w-full relative rounded-md overflow-hidden bg-transparent",
        className,
      )}
    >
      <iframe
        id="geckoterminal-embed"
        title="GeckoTerminal Embed"
        src={embedUrl}
        className="absolute inset-0 w-full h-full bg-transparent"
        frameBorder="0"
        allow="clipboard-write"
        allowFullScreen
        style={{ backgroundColor: "transparent" }}
      />
      {/* Top overlay */}
      <div className="bg-bg-primary absolute top-0 left-0 right-0 h-2 z-20" />

      {/* Bottom overlay - 40px height */}
      <div className="bg-bg-primary absolute bottom-0 left-0 right-0 h-10 z-20" />
    </div>
  )
}
