/**
 * @fileoverview TradingView datafeed implementation for Mangrove markets
 */

import { useDefaultChain } from "@/hooks/use-default-chain"
import {
  HistoryCallback,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  ResolveCallback,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
} from "@/public/charting_library/charting_library"
import { z } from "zod"

/**
 * Parameters required to initialize the datafeed
 */
type Params = {
  base: string
  quote: string
  baseAddress: string
  quoteAddress: string
  chainId: number | undefined
}

/**
 * Structure of a single OHLCV bar
 */
type Bar = {
  startTimestamp: number
  endTimestamp: number
  openTimestamp: number
  closeTimestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Zod schema for validating candles data from API
 */
const candlesSchema = z.object({
  candles: z.array(
    z.object({
      startTimestamp: z.number(),
      endTimestamp: z.number(),
      openTimestamp: z.number(),
      closeTimestamp: z.number(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number(),
    }),
  ),
})

/**
 * Creates a TradingView datafeed implementation for Mangrove markets
 * @param {Params} params - Configuration parameters for the datafeed
 * @returns {Object} TradingView compatible datafeed implementation
 */
function datafeed({ base, quote, baseAddress, quoteAddress, chainId }: Params) {
  return {
    onReady: (callback: OnReadyCallback) => {
      callback({
        // supports_search: true,
        // supports_group_request: false,
        supports_marks: true,
        supports_timescale_marks: true,
        supports_time: false,
        supported_resolutions: [
          "60",
          "1D",
          "1W",
          "1M",
          // "12M",
        ] as ResolutionString[],
      })
    },
    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResult: SearchSymbolsCallback,
    ) => {},
    resolveSymbol: (
      symbolName: string,
      onResolve: ResolveCallback,
      onError: ErrorCallback,
      extension?: SymbolResolveExtension,
    ) => {
      onResolve({
        ticker: `${base}-${quote}`,
        name: `${base}-${quote}`,
        description: `${base}-${quote}`,
        type: "stock",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "",
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        visible_plots_set: "ohlcv",
        has_weekly_and_monthly: true,
        supported_resolutions: [
          "60",
          "1D",
          "1W",
          "1M",
          // "12M",
        ] as ResolutionString[],
        volume_precision: 2,
        data_status: "streaming",
        listed_exchange: "",
        format: "price",
      })
    },
    getBars: async (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: PeriodParams,
      onResult: HistoryCallback,
      onError: ErrorCallback,
    ) => {
      setTimeout(async () => {
        try {
          const newRes =
            resolution === "60"
              ? "1h"
              : resolution === "12M"
                ? "1y"
                : resolution.toLowerCase()

          const result = await fetch(
            `${process.env.NEXT_PUBLIC_INDEXER_URL}/ohlc/${chainId}/${baseAddress}/${quoteAddress}/1/${newRes}?count=${periodParams.countBack}&to=${periodParams.to}`,
          ).then(async (res) => candlesSchema.safeParse(await res.json()))

          if (!result.success) {
            throw new Error("Invalid candles data")
          }

          const bars = (result.data.candles ?? []).map((bar: Bar) => ({
            time: bar.startTimestamp * 1000,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
          }))

          onResult(bars, {
            noData: bars.length === 0,
            nextTime: bars.length > 0 ? undefined : periodParams.from,
          })
        } catch (error) {
          onError({
            code: 1,
            message: "Error loading data",
          } as DOMException)
        }
      }, 0)
    },
    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onTick: SubscribeBarsCallback,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void,
    ) => {},
    unsubscribeBars: (listenerGuid: string) => {},
    getMarks: (
      symbolInfo: LibrarySymbolInfo,
      startDate: any,
      endDate: any,
      onDataCallback: any,
      resolution: any,
    ) => {},
  }
}

/**
 * Legacy datafeed implementation for backwards compatibility
 * @deprecated Use the default export instead
 */
export function oldDatafeed({
  base,
  quote,
  baseAddress,
  quoteAddress,
  chainId,
}: Params) {
  return {
    onReady: (callback: OnReadyCallback) => {
      callback({
        // supports_search: true,
        // supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: true,
        supports_time: true,
        supported_resolutions: ["1D", "1W"] as ResolutionString[],
      })
    },
    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResult: SearchSymbolsCallback,
    ) => {},
    resolveSymbol: (
      symbolName: string,
      onResolve: ResolveCallback,
      onError: ErrorCallback,
      extension?: SymbolResolveExtension,
    ) => {
      onResolve({
        ticker: `${base}-${quote}`,
        name: `${base}-${quote}`,
        description: `${base}-${quote}`,
        type: "stock",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "",
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        visible_plots_set: "ohlcv",
        has_weekly_and_monthly: true,
        supported_resolutions: ["1D", "1W"] as ResolutionString[],
        volume_precision: 2,
        data_status: "streaming",
        listed_exchange: "",
        format: "price",
      })
    },
    getBars: async (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: PeriodParams,
      onResult: HistoryCallback,
      onError: ErrorCallback,
    ) => {
      setTimeout(async () => {
        try {
          const start = new Date(periodParams.from * 1000)
          const end = new Date(periodParams.to * 1000)
          const formattedStart = start.toISOString().split("T")[0]
          const formattedEnd = end.toISOString().split("T")[0]
          const { defaultChain } = useDefaultChain()

          const old_res = await fetch(
            `https://ohlc.mgvinfra.com/ohlc?market=${base}/${quote}&chain_id=${defaultChain.id}&interval=${resolution}&start_time=${formattedStart}&end_time=${formattedEnd}`,
          )
          let old_data = await old_res.json()

          if (old_data.message) {
            old_data = []
          }

          const old_bars = old_data.map((bar: any, i: number) => ({
            time: new Date(bar.startTime).getTime(),
            open: parseFloat(bar.open),
            high: parseFloat(bar.high),
            low: parseFloat(bar.low),
            close: parseFloat(bar.close),
          }))
          const returnBars =
            old_bars.length < periodParams.countBack ? [] : old_bars

          onResult(old_bars, {
            noData:
              old_bars.length === 0 || old_bars.length < periodParams.countBack,
          })
        } catch (error) {
          // onError({})
        }
      }, 0)
    },
    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onTick: SubscribeBarsCallback,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void,
    ) => {},
    unsubscribeBars: (listenerGuid: string) => {},
    getMarks: (
      symbolInfo: LibrarySymbolInfo,
      startDate: any,
      endDate: any,
      onDataCallback: any,
      resolution: any,
    ) => {},
  }
}
