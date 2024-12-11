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
import { arbitrum } from "viem/chains"
import { z } from "zod"

type Params = {
  base: string
  quote: string
  baseAddress: string
  quoteAddress: string
  chainId: number | undefined
}

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

export default function datafeed({
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
        supports_marks: true,
        supports_timescale_marks: true,
        supports_time: false,
        // supported_resolutions: ["60"] as ResolutionString[],
        supported_resolutions: ["1D", "1W"] as ResolutionString[],
      })
    },
    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResult: SearchSymbolsCallback,
    ) => {
      console.log("[searchSymbols]: Method call")
    },
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
        // supported_resolutions: ["60"] as ResolutionString[],
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
          const currentChainId = chainId ?? arbitrum.id
          console.log({ resolution })
          const result = await fetch(
            `https://${currentChainId}-mgv-data.mgvinfra.com/ohlc/${currentChainId}/${baseAddress}/${quoteAddress}/1/1h`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          ).then(async (res) => candlesSchema.safeParse(await res.json()))

          if (!result.success) {
            throw new Error("Invalid candles data")
          }

          const bars = (result.data.candles ?? []).map((bar: Bar, i) => ({
            time: bar.startTimestamp * 1000,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            volume: bar.volume,
          }))

          const returnBars = bars.length < periodParams.countBack ? [] : bars

          console.log({ bars, periodParams })

          onResult(bars, {
            noData: bars.length === 0 || bars.length < periodParams.countBack,
          })
        } catch (error) {
          console.log(error)
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
    ) => {
      console.log("[searchSymbols]: Method call")
    },
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
          const currentChainId = chainId ?? arbitrum.id

          const old_res = await fetch(
            `https://ohlc.mgvinfra.com/ohlc?market=${base}/${quote}&chain_id=${currentChainId}&interval=${"1W"}&start_time=${formattedStart}&end_time=${formattedEnd}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
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

          console.log({ old_bars, periodParams })

          onResult(old_bars, {
            noData:
              old_bars.length === 0 || old_bars.length < periodParams.countBack,
          })
        } catch (error) {
          console.log(error)
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
