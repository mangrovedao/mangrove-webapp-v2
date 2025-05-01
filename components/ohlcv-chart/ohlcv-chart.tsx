"use client"

import { ZoomOutIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import useMarket from "@/providers/market"
import { cn } from "@/utils"
import {
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from "../../public/charting_library"

// Define the OHLCV bar structure
interface OHLCVBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Helper function to ensure continuous bars for daily chart
const ensureContinuousBars = (
  bars: OHLCVBar[],
  from: number,
  to: number,
): OHLCVBar[] => {
  if (bars.length === 0) return []

  // Sort bars by time
  const sortedBars = [...bars].sort(
    (a: OHLCVBar, b: OHLCVBar) => a.time - b.time,
  )

  // Create a daily bar for each day in the requested range
  const result: OHLCVBar[] = []
  const oneDayMs = 24 * 60 * 60 * 1000

  // Find the earliest and latest times - we know these exist because we checked bars.length > 0
  const firstBar = sortedBars[0]! // Non-null assertion is safe here
  const lastBar = sortedBars[sortedBars.length - 1]!

  // Start from the beginning of the day of the first bar
  const startTime = Math.floor(firstBar.time / oneDayMs) * oneDayMs
  // End at the end of the day of the last bar
  const endTime = Math.ceil(lastBar.time / oneDayMs) * oneDayMs

  // Create a map of existing bars by day
  const barsByDay = new Map<number, OHLCVBar>()
  for (const bar of sortedBars) {
    const dayStart = Math.floor(bar.time / oneDayMs) * oneDayMs
    barsByDay.set(dayStart, bar)
  }

  // Add the first bar to start with
  result.push(firstBar)

  // Iterate through each day and ensure we have a bar
  let currentTime = startTime + oneDayMs // Start from day after first bar

  while (currentTime <= endTime) {
    // Check if we have a real bar for this day
    if (barsByDay.has(currentTime)) {
      result.push(barsByDay.get(currentTime)!)
    } else if (result.length > 0) {
      // Create a continuation bar based on the previous close price
      const previousBar = result[result.length - 1]!
      result.push({
        time: currentTime,
        open: previousBar.close,
        high: previousBar.close,
        low: previousBar.close,
        close: previousBar.close,
        volume: 0,
      })
    }

    // Move to the next day
    currentTime += oneDayMs
  }

  return result
}

// Define props for the component
interface OHLCVChartProps {
  chainId: number
  indexerUrl: string
  className?: string
}

// Resolution mapping from TradingView to API format
const RESOLUTION_MAP: Record<string, string> = {
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "240": "4h",
  "1D": "1d",
  "1W": "1w",
  "1M": "1M",
}

// Define array of supported resolutions for consistent use throughout the component
const SUPPORTED_RESOLUTIONS = [
  "1",
  "5",
  "15",
  "30",
  "60",
  "240",
  "1D",
  "1W",
  "1M",
] as ResolutionString[]

export function OHLCVChart({
  chainId,
  indexerUrl,
  className,
}: OHLCVChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)
  const { currentMarket } = useMarket()
  // console.log("OHLCVChart", chainId, indexerUrl, className)

  const { base, quote } = currentMarket || {
    base: { address: "", symbol: "" },
    quote: { address: "", symbol: "" },
  }
  // Fetch data from the indexer
  const fetchOHLCVData = useCallback(
    async (
      resolution: string,
      from: number,
      to: number,
    ): Promise<OHLCVBar[]> => {
      try {
        // Map TradingView resolution to API resolution
        const apiResolution = RESOLUTION_MAP[resolution] || "1h"

        // Build the URL with the pairs in the correct order
        // Note: The order must be chainId/quoteAddress/baseAddress for testnet indexer
        const url = `${indexerUrl}/price/ohlc/${chainId}/${base.address}/${quote.address}/1/${apiResolution}?count=100`

        const response = await fetch(url)
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`API error: ${response.status}`, errorText)
          throw new Error(`HTTP error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        if (
          !data.candles ||
          !Array.isArray(data.candles) ||
          data.candles.length === 0
        ) {
          console.log("No valid candles data in response")
          return []
        }

        // Map the API response to OHLCVBar format
        const rawBars = data.candles.map((candle: any) => ({
          time: candle.startTimestamp * 1000, // Convert to milliseconds for TradingView
          open: parseFloat(candle.open),
          high: parseFloat(candle.high),
          low: parseFloat(candle.low),
          close: parseFloat(candle.close),
          volume: parseFloat(candle.volume),
        }))

        // Create a Set to track timestamps we've seen
        const seenTimestamps = new Set<number>()

        // Process bars to ensure unique timestamps
        const processedBars: OHLCVBar[] = []

        // First sort by time to ensure chronological order
        const sortedBars = [...rawBars].sort(
          (a: OHLCVBar, b: OHLCVBar) => a.time - b.time,
        )

        // Process each bar to ensure unique timestamps
        for (const bar of sortedBars) {
          let uniqueTime = bar.time

          // If this timestamp already exists, increment by 1ms until unique
          while (seenTimestamps.has(uniqueTime)) {
            uniqueTime += 1
          }

          // Add the unique timestamp to our set
          seenTimestamps.add(uniqueTime)

          // Add the bar with potentially modified timestamp
          processedBars.push({
            ...bar,
            time: uniqueTime,
          })
        }

        return processedBars
      } catch (error) {
        console.error("Error fetching OHLCV data:", error)
        return []
      }
    },
    [chainId, base.address, quote.address, indexerUrl],
  )

  // Handle chart reset/unzoom
  const handleUnzoomPriceScale = useCallback(() => {
    if (!tvWidgetRef.current) return

    try {
      const symbol = `${base.symbol}/${quote.symbol}`
      const interval = tvWidgetRef.current
        .activeChart()
        .resolution() as ResolutionString

      // Force a reset by reloading the chart
      tvWidgetRef.current.setSymbol(symbol, interval, () => {})
    } catch (error) {
      console.error("Error unzooming price scale:", error)
    }
  }, [base.symbol, quote.symbol])

  // Initialize the chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create DataFeed
    const dataFeed = {
      onReady: (callback: any) => {
        setTimeout(() => {
          callback({
            supported_resolutions: SUPPORTED_RESOLUTIONS,
            supports_time: true,
          })
        }, 0)
      },

      searchSymbols: () => {},

      resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any) => {
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: `${base.symbol}/${quote.symbol}`,
            description: `${base.symbol}/${quote.symbol}`,
            type: "crypto",
            session: "24x7",
            timezone: "Etc/UTC",
            ticker: `${base.symbol}/${quote.symbol}`,
            minmov: 1,
            pricescale: 10000,
            has_intraday: true,
            intraday_multipliers: ["1", "5", "15", "30", "60", "240"],
            supported_resolutions: SUPPORTED_RESOLUTIONS,
            volume_precision: 2,
            data_status: "streaming",
          })
        }, 0)
      },

      getBars: async (
        symbolInfo: any,
        resolution: string,
        periodParams: {
          from: number
          to: number
          firstDataRequest?: boolean
          countBack?: number
        },
        onHistoryCallback: (
          bars: OHLCVBar[],
          meta: { noData: boolean },
        ) => void,
        onErrorCallback: (error: string) => void,
      ) => {
        try {
          const { from, to, firstDataRequest } = periodParams

          // Normalize date ranges - if needed
          // Only adjust very old requests (older than Jan 1, 2020)
          const MIN_REASONABLE_DATE = 1577836800 // Jan 1, 2020

          let adjustedFrom = from
          let adjustedTo = to

          if (from < MIN_REASONABLE_DATE) {
            // Use a more reasonable date range for old requests
            const now = Math.floor(Date.now() / 1000)
            adjustedFrom = now - 365 * 24 * 60 * 60 // 1 year ago

            // Also adjust 'to' date if needed
            if (to < MIN_REASONABLE_DATE) {
              adjustedTo = now
            }
          }

          // For extension requests to very old dates, just return no data
          if (firstDataRequest === false && from < MIN_REASONABLE_DATE) {
            onHistoryCallback([], { noData: true })
            return
          }

          const bars = await fetchOHLCVData(
            resolution,
            adjustedFrom,
            adjustedTo,
          )

          if (bars.length === 0) {
            console.log("No bars returned from API")
            onHistoryCallback([], { noData: true })
            return
          }

          // Process bars based on resolution
          if (resolution === "1D") {
            const processedBars = ensureContinuousBars(
              bars,
              adjustedFrom,
              adjustedTo,
            )

            onHistoryCallback(processedBars, {
              noData: processedBars.length === 0,
            })
          } else {
            onHistoryCallback(bars, { noData: bars.length === 0 })
          }
        } catch (error) {
          console.error("Error in getBars:", error)
          onErrorCallback(
            error instanceof Error ? error.message : String(error),
          )
        }
      },

      subscribeBars: (
        symbolInfo: any,
        resolution: string,
        onRealtimeCallback: (bar: OHLCVBar) => void,
        subscriberUID: string,
        onResetCacheNeededCallback?: () => void,
      ) => {
        // Real-time updates implementation
        const intervalId = setInterval(async () => {
          try {
            const now = Math.floor(Date.now() / 1000)
            // Get data from the last hour
            const oneHourAgo = now - 3600

            const bars = await fetchOHLCVData(resolution, oneHourAgo, now)

            if (bars.length > 0) {
              // Get the latest bar
              const latestBar = bars[bars.length - 1]
              // Make sure latestBar is defined before calling callback
              if (latestBar) {
                onRealtimeCallback(latestBar)
              }
            }
          } catch (error) {
            console.error("Real-time update error:", error)
          }
        }, 60000) // Update every minute

        // Store interval ID for cleanup
        return intervalId
      },

      unsubscribeBars: (subscriberUID: string | number) => {
        // Clear the interval when unsubscribing
        if (typeof subscriberUID === "number") {
          clearInterval(subscriberUID)
        }
      },
    }

    // Create widget
    const tvWidget = new widget({
      symbol: `${base.symbol}/${quote.symbol}`,
      interval: "60" as ResolutionString,
      container: chartContainerRef.current,
      datafeed: dataFeed,
      library_path: "charting_library/",
      locale: "en",
      theme: "dark",
      debug: false,
      fullscreen: false,
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
        "use_localstorage_for_settings",
      ],
      overrides: {
        "paneProperties.background": "transparent",
        "paneProperties.backgroundType": "solid",
        "scalesProperties.textColor": "#AAA",
        "scalesProperties.lineColor": "#333",
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        "scalesProperties.showSeriesLastValue": true,
        "scalesProperties.showStudyLastValue": false,
      },
      studies_overrides: {
        "volume.precision": 0,
      },
      autosize: true,
    })

    tvWidgetRef.current = tvWidget

    tvWidget.onChartReady(() => {
      setIsLoading(false)
    })

    return () => {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove()
        tvWidgetRef.current = null
      }
    }
  }, [base.symbol, quote.symbol, fetchOHLCVData])

  return (
    <div className={cn("relative w-full  h-full bg-background", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="animate-pulse text-primary">Loading chart...</div>
        </div>
      )}

      {!isLoading && (
        <button
          onClick={handleUnzoomPriceScale}
          className="absolute top-2 right-2 z-20 bg-background/80 hover:bg-background p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
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
