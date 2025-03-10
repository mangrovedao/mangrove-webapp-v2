/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useMarket from "@/providers/market"
import {
  generateOHLCVBars,
  getDexScreenerChainName,
  getPairInfo,
  tryFetchOHLCVData,
  type OHLCVBar,
} from "@/services/dexscreener-api"
import { cn } from "@/utils"
import React from "react"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"
import {
  IBasicDataFeed,
  ResolutionString,
  widget,
  type ChartingLibraryWidgetOptions,
} from "../../public/charting_library"
import { AnimatedChartSkeleton } from "./animated-chart-skeleton"

// DexScreener API based datafeed
const createDexScreenerDatafeed = (options: {
  base: string
  quote: string
  baseAddress: string
  quoteAddress: string
  chainId: number
}): IBasicDataFeed => {
  const { base, quote, baseAddress, quoteAddress, chainId } = options
  const chainName = getDexScreenerChainName(chainId)
  const pairAddress = `${baseAddress}_${quoteAddress}`

  // Cache for storing fetched bars to avoid redundant API calls
  const cachedBars: Record<string, OHLCVBar[]> = {}

  // Store active subscriptions
  const subscriptions: Record<string, NodeJS.Timeout> = {}

  return {
    onReady: (callback) => {
      setTimeout(
        () =>
          callback({
            supported_resolutions: [
              "1",
              "5",
              "15",
              "30",
              "60",
              "240",
              "1D",
              "1W",
              "1M",
            ] as ResolutionString[],
            supports_time: true,
            supports_marks: false,
            supports_timescale_marks: false,
          }),
        0,
      )
    },
    searchSymbols: (userInput, exchange, symbolType, onResult) => {
      onResult([])
    },
    resolveSymbol: (
      symbolName,
      onSymbolResolvedCallback,
      onResolveErrorCallback,
    ) => {
      setTimeout(() => {
        onSymbolResolvedCallback({
          name: `${base}/${quote}`,
          description: `${base}/${quote}`,
          type: "crypto",
          session: "24x7",
          timezone: "Etc/UTC",
          ticker: symbolName,
          minmov: 1,
          pricescale: 100000000,
          has_intraday: true,
          intraday_multipliers: ["1", "5", "15", "30", "60", "240"],
          supported_resolutions: [
            "1",
            "5",
            "15",
            "30",
            "60",
            "240",
            "1D",
            "1W",
            "1M",
          ] as ResolutionString[],
          volume_precision: 8,
          data_status: "streaming",
          exchange: "DEX",
          listed_exchange: "DEX",
          format: "price",
        })
      }, 0)
    },
    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback,
    ) => {
      try {
        const { from, to, countBack } = periodParams
        const cacheKey = `${symbolInfo.ticker}-${resolution}-${from}-${to}`

        // Check if we have cached data
        if (cachedBars[cacheKey]) {
          console.log("Using cached data for", cacheKey)
          onHistoryCallback(cachedBars[cacheKey], {
            noData: cachedBars[cacheKey].length === 0,
          })
          return
        }

        // Get pair information from DEXScreener
        const pair = await getPairInfo(chainId, baseAddress, quoteAddress)

        if (!pair) {
          console.log("No pair data found")
          onHistoryCallback([], { noData: true })
          return
        }

        console.log(
          "Pair found:",
          pair.baseToken.symbol,
          "/",
          pair.quoteToken.symbol,
        )

        // Try to fetch OHLCV data from DEXScreener's chart endpoint
        try {
          const chartData = await tryFetchOHLCVData(
            chainName,
            pair.pairAddress,
            resolution,
          )

          if (chartData && chartData.length > 0) {
            // Filter and sort the data
            const bars = chartData
              .filter((bar) => bar.time >= from * 1000 && bar.time <= to * 1000)
              .sort((a, b) => a.time - b.time)

            // Cache the result
            cachedBars[cacheKey] = bars

            onHistoryCallback(bars, { noData: bars.length === 0 })
            return
          }
        } catch (chartError) {
          console.warn("Failed to fetch chart data:", chartError)
          // Continue to fallback method
        }

        // Generate bars from price and volume data
        console.log("Generating bars from available price data")
        const bars = generateOHLCVBars(pair, from, to, resolution)

        // Cache the result
        cachedBars[cacheKey] = bars

        console.log("Generated bars:", bars.length)
        onHistoryCallback(bars, { noData: bars.length === 0 })
      } catch (error) {
        console.error("Error fetching data from DEXScreener:", error)
        onErrorCallback(error instanceof Error ? error.message : String(error))
      }
    },
    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
    ) => {
      // Set up a periodic update for real-time data
      const intervalId = setInterval(async () => {
        try {
          const pair = await getPairInfo(chainId, baseAddress, quoteAddress)
          if (!pair) return

          const currentPrice = parseFloat(pair.priceUsd)
          const currentTime = Math.floor(Date.now() / 1000) * 1000

          // Create a real-time bar
          const bar = {
            time: currentTime,
            open: currentPrice * 0.999,
            high: currentPrice * 1.001,
            low: currentPrice * 0.998,
            close: currentPrice,
            volume: pair.volume?.h1
              ? parseFloat(String(pair.volume.h1)) / 24
              : 0,
          }

          onRealtimeCallback(bar)
        } catch (error) {
          console.error("Error in real-time update:", error)
        }
      }, 15000) // Update every 15 seconds

      // Store the interval ID for cleanup
      subscriptions[subscriberUID] = intervalId
    },
    unsubscribeBars: (subscriberUID) => {
      // Cleanup subscription
      if (subscriptions[subscriberUID]) {
        clearInterval(subscriptions[subscriberUID])
        delete subscriptions[subscriberUID]
      }
    },
  }
}

export const TVChartContainer = (
  props: Partial<ChartingLibraryWidgetOptions>,
) => {
  const { currentMarket } = useMarket()
  const { chain } = useAccount()
  const [isLoading, setIsLoading] = React.useState(true)
  const chartContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!currentMarket || !chartContainerRef.current) return

    const tvWidget = new widget({
      symbol: `${currentMarket.base.symbol}-${currentMarket.quote.symbol}`,
      datafeed: createDexScreenerDatafeed({
        base: currentMarket.base.symbol,
        quote: currentMarket.quote.symbol,
        baseAddress: currentMarket.base.address,
        quoteAddress: currentMarket.quote.address,
        chainId: chain?.id || arbitrum.id,
      }) as IBasicDataFeed,
      timeframe: "12M",
      interval: "1W" as ResolutionString,
      container: chartContainerRef.current,
      library_path: "charting_library/",
      locale: "en",
      debug: false,
      theme: "dark",
      custom_css_url: "css/styles.css",
      disabled_features: [
        "left_toolbar",
        "timezone_menu",
        "header_symbol_search",
        "header_compare",
        "timeframes_toolbar",
        "use_localstorage_for_settings",
        "popup_hints",
      ],
      enabled_features: [
        "hide_left_toolbar_by_default",
        "move_logo_to_main_pane",
        "create_volume_indicator_by_default",
      ],
      overrides: {
        "paneProperties.background": "#0C1719", // #12272B light bg
        "paneProperties.backgroundType": "solid",
      },
      fullscreen: false,
      autosize: true,
      ...props,
    })

    tvWidget.onChartReady(() => {
      setIsLoading(false)
    })

    return () => {
      tvWidget.remove()
    }
  }, [currentMarket, chain, props])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <AnimatedChartSkeleton />
        </div>
      )}
      <div
        ref={chartContainerRef}
        className={cn("w-full h-full", isLoading ? "opacity-0" : "opacity-100")}
      />
    </div>
  )
}
