"use client"

import { usePool } from "@/hooks/new_ghostbook/pool"
import { useDefaultChain } from "@/hooks/use-default-chain"
import { cn } from "@/utils"
import { useMemo } from "react"

interface PriceChartProps {
  className?: string
}

export default function EmbedPriceChart({ className }: PriceChartProps) {
  const { pool, isLoading: isPoolLoading } = usePool()
  const { defaultChain } = useDefaultChain()

  // Determine the chain name for GeckoTerminal URL
  const chainName = useMemo(() => {
    if (!defaultChain?.id) return "base"

    // Map chain IDs to GeckoTerminal chain names
    const chainMap: Record<number, string> = {
      42161: "arbitrum", // Arbitrum
      8453: "base", // Base
      6342: "MegaETH Testnet", // MegaETH Testnet
    }

    return chainMap[defaultChain.id] || "base" // Default to Base if not found
  }, [defaultChain])

  console.log(pool)

  // Build the embed URL
  const embedUrl = useMemo(() => {
    return `https://www.geckoterminal.com/sei-evm/pools/${pool?.pool}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m&transparent=1`
  }, [pool, chainName])

  // Show loading state while pool is being fetched
  if (isPoolLoading) {
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
