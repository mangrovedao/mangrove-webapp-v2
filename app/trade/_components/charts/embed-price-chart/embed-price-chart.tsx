"use client"

import { usePool } from "@/hooks/new_ghostbook/pool"
import { useSelectedPool } from "@/hooks/new_ghostbook/use-selected-pool"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { useMemo } from "react"

interface PriceChartProps {
  className?: string
}

export default function EmbedPriceChart({ className }: PriceChartProps) {
  const { selectedPool } = useSelectedPool()
  const { currentMarket } = useMarket()

  // Specific market URL mappings
  const marketUrlMappings: Record<string, string> = {
    WSEI: "https://www.geckoterminal.com/eth/pools/0xf8e349d1d827a6edf17ee673664cfad4ca78c533",
    syUSD:
      "https://www.geckoterminal.com/sei-evm/pools/0xda5c7d6ca4727350a6b38cba0604003adca08062",
    wstETH:
      "https://www.geckoterminal.com/eth/pools/0x109830a1aaad605bbf02a9dfa7b0b92ec2fb7daa",
  }

  const embedUrl = useMemo(() => {
    const baseSymbol = currentMarket?.base?.symbol

    if (baseSymbol && marketUrlMappings[baseSymbol]) {
      return `${marketUrlMappings[baseSymbol]}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m&transparent=1`
    }

    // Fallback to dynamic URL construction
    return `https://www.geckoterminal.com/sei-evm/pools/${selectedPool}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m&transparent=1`
  }, [selectedPool, currentMarket, marketUrlMappings])

  // Show loading state while pool is being fetched
  if (!selectedPool) {
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
        color="#000000"
        style={{ backgroundColor: "black" }}
      />
      {/* Top overlay */}
      <div className="bg-bg-primary absolute top-0 left-0 right-0 h-2 z-20" />

      {/* Bottom overlay - 40px height */}
      <div className="bg-bg-primary absolute bottom-0 left-0 right-0 h-10 z-20" />
    </div>
  )
}
