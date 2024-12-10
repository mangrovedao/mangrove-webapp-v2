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
      try {
        const start = new Date(periodParams.from * 1000)
        const end = new Date(periodParams.to * 1000)
        const formattedStart = start.toISOString().split("T")[0]
        const formattedEnd = end.toISOString().split("T")[0]
        const currentChainId = chainId ?? arbitrum.id

        const response = await fetch(
          `https://${currentChainId}-mgv-data.mgvinfra.com/ohlc/${currentChainId}/${baseAddress}/${quoteAddress}/1/1h`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        const result = candlesSchema.safeParse(await response.json())

        if (!result.success) {
          throw new Error("Invalid candles data")
        }

        const data = result.data.candles ?? []

        const bars = data.map((bar: any) => ({
          time: bar.startTimestamp * 1000,
          open: parseFloat(bar.open),
          high: parseFloat(bar.high),
          low: parseFloat(bar.low),
          close: parseFloat(bar.close),
        }))

        console.log(bars)
        onResult(bars, { noData: bars.length > 0 ? false : true })
      } catch (error) {
        console.log(error)
      }
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
