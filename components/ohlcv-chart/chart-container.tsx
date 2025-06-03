import { useDefaultChain } from "@/hooks/use-default-chain"
import useMarket from "@/providers/market"
import { OHLCVBar } from "@/services/dexscreener-api"
import { getIndexerUrl } from "@/utils/get-indexer-url"
import { ZoomOutIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import {
  ChartingLibraryWidgetOptions,
  IChartingLibraryWidget,
  LanguageCode,
  ResolutionString,
  widget,
} from "../../public/charting_library"

export const TVChartContainer = (
  props: Partial<ChartingLibraryWidgetOptions>,
) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  const { currentMarket } = useMarket()
  const { chainId } = useAccount()
  const [loading, setLoading] = useState<boolean>(true)
  const tvWidgetRef = useRef<IChartingLibraryWidget | null>(null)

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

  const { base, quote } = currentMarket || {
    base: { address: "", symbol: "" },
    quote: { address: "", symbol: "" },
  }
  const { defaultChain } = useDefaultChain()

  function backfillBars(
    lastBar: OHLCVBar,
    resolution: string,
    neededBars: number,
  ): OHLCVBar[] {
    const result: OHLCVBar[] = []

    // Convert resolution to ms
    const resolutionMap: Record<string, number> = {
      "1": 60 * 1000,
      "5": 5 * 60 * 1000,
      "15": 15 * 60 * 1000,
      "30": 30 * 60 * 1000,
      "60": 60 * 60 * 1000,
      "240": 4 * 60 * 60 * 1000,
      "1D": 24 * 60 * 60 * 1000,
      "1W": 7 * 24 * 60 * 60 * 1000,
    }

    const step = resolutionMap[resolution] ?? 60 * 60 * 1000 // default to 1h

    let currentTime = lastBar.time - step

    for (let i = 0; i < neededBars; i++) {
      result.unshift({
        time: currentTime,
        open: lastBar.close,
        high: lastBar.close,
        low: lastBar.close,
        close: lastBar.close,
        volume: 0,
      })

      currentTime -= step
    }

    return result
  }

  const getData = async (resolution: string) => {
    try {
      if (!defaultChain || !base.address || !quote.address) return []

      // Map TradingView resolution to API resolution
      const apiResolution = RESOLUTION_MAP[resolution] || "1d"

      // Build the URL with the pairs in the correct order
      // Note: The order must be chainId/quoteAddress/baseAddress for testnet indexer
      const url = `${getIndexerUrl(defaultChain)}/price/ohlc/${defaultChain.id}/${base.address}/${quote.address}/1/${apiResolution}?count=100`

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

      let resultBars = processedBars
      const REQUIRED_BARS = 350

      if (processedBars.length < REQUIRED_BARS) {
        const lastBar = processedBars[0] // use first bar to backfill earlier time range
        const missingBars = REQUIRED_BARS - processedBars.length
        const synthetic = backfillBars(lastBar!, resolution, missingBars)
        resultBars = [...synthetic, ...processedBars]
      }

      return resultBars.sort((a, b) => a.time - b.time)
    } catch (error) {
      console.error("Error fetching OHLCV data:", error)
      return []
    }
  }

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

  useEffect(() => {}, [])

  const datafeed = {
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
          has_empty_bars: true,
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
      onHistoryCallback: (bars: OHLCVBar[], meta: { noData: boolean }) => void,
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

        const bars = await getData(resolution)
        onHistoryCallback(bars, { noData: bars.length === 0 })
      } catch (error) {
        console.error("Error in getBars:", error)
        onErrorCallback(error instanceof Error ? error.message : String(error))
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
          const bars = await getData(resolution)

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

  useEffect(() => {
    if (!chartContainerRef?.current || !datafeed) return

    const widgetOptions: ChartingLibraryWidgetOptions = {
      // BEWARE: no trailing slash is expected in feed URL
      datafeed,
      interval: props.interval as ResolutionString,
      container: chartContainerRef.current,
      library_path: props.library_path,
      locale: props.locale as LanguageCode,
      charts_storage_url: props.charts_storage_url,
      charts_storage_api_version: props.charts_storage_api_version,
      client_id: props.client_id,
      user_id: props.user_id,
      fullscreen: props.fullscreen,
      autosize: props.autosize,
      symbol: `${base.symbol}/${quote.symbol}`,
      theme: "dark",
      debug: false,
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
        "paneProperties.backgroundType": "solid",
        "scalesProperties.textColor": "#FFFFFF",
        "scalesProperties.lineColor": "#333",
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        "scalesProperties.showSeriesLastValue": true,
        "scalesProperties.showStudyLastValue": false,
        "scalesProperties.fontSize": 14,
      },
      custom_formatters: {
        priceFormatterFactory: (symbolInfo, minTick) => {
          if (symbolInfo === null) {
            return null
          }

          return {
            format: (price, signPositive) => {
              if (price >= 1000000000) {
                return `${(price / 1000000000).toFixed(3)}B`
              }

              if (price >= 1000000) {
                return `${(price / 1000000).toFixed(3)}M`
              }

              if (price >= 1000) {
                return `${(price / 1000).toFixed(3)}K`
              }

              if (price > 0 && price < 0.0001) {
                return price.toExponential(2)
              }

              return price.toFixed(2)
            },
          }

          return null // The default formatter will be used.
        },
      },
    }

    const tvWidget = new widget(widgetOptions)

    tvWidgetRef.current = tvWidget

    tvWidget.onChartReady(() => {
      setLoading(false)

      tvWidget
        .chart()
        .onIntervalChanged()
        .subscribe(null, () => {
          tvWidget.chart().resetData()
        })
    })

    return () => {
      tvWidgetRef?.current?.remove()
      tvWidgetRef.current = null
      tvWidget?.remove()
    }
  }, [base.symbol, quote.symbol, getData])

  return (
    <div className="relative h-full">
      {loading && (
        <div className="flex items-center justify-center bg-background h-full">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-t-2 border-[#00A86B] rounded-full"></div>
            <p className="text-sm text-[#999] animate-pulse">
              Loading chart...
            </p>
          </div>
        </div>
      )}

      {loading && (
        <button
          onClick={handleUnzoomPriceScale}
          className="absolute top-2 right-2 z-20 bg-background/80 hover:bg-background p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          title="Reset price scale"
        >
          <ZoomOutIcon size={16} />
        </button>
      )}
      <div className="h-full" ref={chartContainerRef} />
    </div>
  )
}
