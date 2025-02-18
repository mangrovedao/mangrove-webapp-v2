/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useMarket from "@/providers/market"
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
import { Skeleton } from "../ui/skeleton"
import datafeed from "./datafeed"

const from = new Date(2024, 7, 1).getTime() / 1000
const to = new Date().getTime() / 1000

export const TVChartContainer = (
  props: Partial<ChartingLibraryWidgetOptions>,
) => {
  const { chainId } = useAccount()
  const { currentMarket } = useMarket()
  const [isLoading, setIsLoading] = React.useState(true)
  const chartContainerRef =
    React.useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  React.useEffect(() => {
    if (!currentMarket) return

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: `${currentMarket.base.symbol}-${currentMarket.quote.symbol}`,
      datafeed: datafeed({
        base: currentMarket?.base.symbol,
        quote: currentMarket?.quote.symbol,
        baseAddress: currentMarket?.base.address,
        quoteAddress: currentMarket?.quote.address,
        chainId: chainId ?? arbitrum.id,
      }) as unknown as IBasicDataFeed,
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
        // "header_chart_type",
        // "header_screenshot",
        // "volume_force_overlay",
        // "create_volume_indicator_by_default",
        // "hide_main_series_symbol_from_indicator_legend",
      ],
      overrides: {
        "paneProperties.background": "#0B1719",
        "paneProperties.backgroundType": "solid",
      },
    }

    const tvWidget = new widget(widgetOptions)
    const element = chartContainerRef.current.querySelector(
      '[id^="tradingview"]',
    )

    if (!element) return
    element.classList.add("w-full")
    element.classList.add("h-full")

    tvWidget.onChartReady(() => {
      setIsLoading(false)
    })

    return () => {
      tvWidget.remove()
    }
  }, [props, currentMarket?.base, currentMarket?.quote])

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <Skeleton className="absolute inset-0 text-green-caribbean flex items-center justify-center" />
      )}
      <div
        className={cn("h-full transition-opacity", { "opacity-0": isLoading })}
        ref={chartContainerRef}
      />
    </div>
  )
}
