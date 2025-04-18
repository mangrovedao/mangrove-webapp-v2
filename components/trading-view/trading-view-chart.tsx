/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import {
  generateOHLCVBars,
  getDexScreenerChainName,
  getPairInfo,
  tryFetchOHLCVData,
  type OHLCVBar,
} from "@/services/dexscreener-api"
import { cn } from "@/utils"
import { getChainObjectById } from "@/utils/chains"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { ZoomOutIcon } from "lucide-react"
import React, { useCallback } from "react"
import {
  IBasicDataFeed,
  IChartingLibraryWidget,
  ResolutionString,
  widget,
  type ChartingLibraryWidgetOptions,
} from "../../public/charting_library"
import { AnimatedChartSkeleton } from "./animated-chart-skeleton"

// Function to fetch OHLCV data from testnet indexer
const fetchTestnetOHLCVData = async (
  chainId: number,
  quoteAddress: string,
  baseAddress: string,
  resolution: string,
  from: number,
  to: number,
): Promise<OHLCVBar[]> => {
  try {
    // Convert TradingView resolution to API resolution (e.g., "60" -> "1h")
    const resolutionMap: Record<string, string> = {
      "1": "1m",
      "5": "5m",
      "15": "15m",
      "30": "30m",
      "60": "1h",
      "240": "4h",
      "1D": "1d",
      "1W": "1w",
    }

    const apiResolution = resolutionMap[resolution] || "1h"

    // Build the API URL
    const url = `${getIndexerUrl(getChainObjectById(chainId.toString()))}/price/ohlc/${chainId}/${quoteAddress}/${baseAddress}/1/${apiResolution}?to=${to}&count=100`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (
      !data.candles ||
      !Array.isArray(data.candles) ||
      data.candles.length === 0
    ) {
      return []
    }

    // Map the API response to OHLCVBar format
    return data.candles.map((candle: any) => ({
      time: candle.startTimestamp * 1000, // Convert to milliseconds
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume),
    }))
  } catch (error) {
    console.error("Error fetching testnet OHLCV data:", error)
    return []
  }
}

// DexScreener API based datafeed
const createDexScreenerDatafeed = (options: {
  base: string
  quote: string
  baseAddress: string
  quoteAddress: string
  chainId: number
  isTestnet?: boolean
}): IBasicDataFeed => {
  const { base, quote, baseAddress, quoteAddress, chainId, isTestnet } = options
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
          pricescale: 100,
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
          volume_precision: 2,
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
          // Ensure we have a non-null array by providing a default empty array
          const ohlcvBars = cachedBars[cacheKey] || []

          // Convert OHLCVBar[] to Bar[] to match the expected type
          const bars = ohlcvBars.map((bar) => ({
            time: bar.time,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
          }))

          onHistoryCallback(bars, {
            noData: bars.length === 0,
          })
          return
        }

        // If we're on testnet, use the testnet API
        if (isTestnet) {
          const bars = await fetchTestnetOHLCVData(
            chainId,
            quoteAddress,
            baseAddress,
            resolution,
            from,
            to,
          )

          // Cache the result
          cachedBars[cacheKey] = bars

          onHistoryCallback(bars, { noData: bars.length === 0 })
          return
        }

        // Get pair information from DEXScreener
        const pair = await getPairInfo(chainId, baseAddress, quoteAddress)

        if (!pair) {
          onHistoryCallback([], { noData: true })
          return
        }

        // Try to fetch OHLCV data from DEXScreener's chart endpoint
        try {
          const chartData = await tryFetchOHLCVData(
            chainName,
            pair.pairAddress,
            resolution,
            baseAddress,
            quoteAddress,
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
          // Continue to fallback method
        }

        // Generate bars from price and volume data
        const bars = generateOHLCVBars(pair, from, to, resolution, chainName)

        // Cache the result
        cachedBars[cacheKey] = bars

        onHistoryCallback(bars, { noData: bars.length === 0 })
      } catch (error) {
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
          if (isTestnet) {
            // For testnet, fetch the latest data from the testnet API
            const currentTime = Math.floor(Date.now() / 1000)
            const bars = await fetchTestnetOHLCVData(
              chainId,
              quoteAddress,
              baseAddress,
              resolution,
              currentTime - 3600, // Last hour
              currentTime,
            )

            if (bars.length > 0) {
              const latestBar = bars[bars.length - 1]
              // Make sure we have a valid bar before calling the callback
              if (latestBar) {
                onRealtimeCallback(latestBar)
              }
            }
            return
          }

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
        } catch (error) {}
      }, 180000) // Update every 3 minutes

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
  const { defaultChain } = useDefaultChain()
  const [isLoading, setIsLoading] = React.useState(true)
  const chartContainerRef = React.useRef<HTMLDivElement>(null)
  // Keep a reference to the widget
  const tvWidgetRef = React.useRef<IChartingLibraryWidget | null>(null)

  // Determine if we're on a testnet chain
  const isTestnet = React.useMemo(() => {
    // Add logic to determine if the chain is testnet
    // For example, chainId 8453 for Base Sepolia testnet
    return defaultChain.id === 8453 || defaultChain.testnet === true
  }, [defaultChain])

  // Handle unzooming the price scale
  const handleUnzoomPriceScale = useCallback(() => {
    if (!tvWidgetRef.current) return

    try {
      // Simply reload the chart with current settings
      // This effectively resets all zooming to default
      if (currentMarket) {
        const symbol = `${currentMarket.base.symbol}-${currentMarket.quote.symbol}`
        const interval = tvWidgetRef.current
          .activeChart()
          .resolution() as ResolutionString

        // Force a reset by reloading the chart
        tvWidgetRef.current.setSymbol(symbol, interval, () => {
          /* callback after symbol is loaded */
        })
      }
    } catch (error) {
      console.error("Error unzooming price scale", error)
    }
  }, [currentMarket])

  React.useEffect(() => {
    if (!currentMarket || !chartContainerRef.current) return

    const tvWidget = new widget({
      symbol: `${currentMarket.base.symbol}-${currentMarket.quote.symbol}`,
      datafeed: createDexScreenerDatafeed({
        base: currentMarket.base.symbol,
        quote: currentMarket.quote.symbol,
        baseAddress: currentMarket.base.address,
        quoteAddress: currentMarket.quote.address,
        chainId: defaultChain.id,
        isTestnet: isTestnet,
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
        "paneProperties.background": "#0C1719",
        "paneProperties.backgroundType": "solid",
        "scalesProperties.textColor": "#AAA",
        "scalesProperties.lineColor": "#333",
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        "mainSeriesProperties.priceAxisProperties.percentage": false,
        "mainSeriesProperties.priceAxisProperties.log": false,
        "mainSeriesProperties.priceFormat.type": "price",
        "mainSeriesProperties.priceFormat.precision": 2,
        "mainSeriesProperties.priceFormat.minMove": 0.01,
        "scalesProperties.showSeriesLastValue": true,
        "scalesProperties.showStudyLastValue": false,
      },
      studies_overrides: {
        "volume.precision": 0,
      },
      autosize: true,
      ...props,
    })

    // Save reference to widget
    tvWidgetRef.current = tvWidget

    tvWidget.onChartReady(() => {
      setIsLoading(false)
    })

    return () => {
      tvWidget.remove()
      tvWidgetRef.current = null
    }
  }, [currentMarket, defaultChain.id, props, isTestnet])

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <AnimatedChartSkeleton />
        </div>
      )}

      {!isLoading && (
        <button
          onClick={handleUnzoomPriceScale}
          className="absolute top-2 right-2 z-20 bg-bg-secondary/80 hover:bg-bg-secondary p-1 rounded-sm text-text-secondary hover:text-text-primary transition-colors"
          title="Reset price scale"
        >
          <ZoomOutIcon size={16} />
        </button>
      )}

      <div
        ref={chartContainerRef}
        className={cn("w-full h-full", isLoading ? "opacity-0" : "opacity-100")}
      />
    </div>
  )
}
