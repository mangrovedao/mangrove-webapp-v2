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

type Params = {
  base: string
  quote: string
  baseAddress: string
  quoteAddress: string
  chainId: number | undefined
}

export default function datafeed({ base, quote, chainId }: Params) {
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
      const start = new Date(periodParams.from * 1000)
      const end = new Date(periodParams.to * 1000)
      const formattedStart = start.toISOString().split("T")[0]
      const formattedEnd = end.toISOString().split("T")[0]

      const response = await fetch(
        `https://ohlc.mgvinfra.com/ohlc?market=${base}/${quote}&chain_id=${chainId}&interval=${resolution}&start_time=${formattedStart}&end_time=${formattedEnd}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      let data = await response.json()

      if (data.message) {
        data = []
      }

      const bars = data.map((bar: any) => ({
        time: new Date(bar.startTime).getTime(),
        open: parseFloat(bar.open),
        high: parseFloat(bar.high),
        low: parseFloat(bar.low),
        close: parseFloat(bar.close),
      }))

      onResult(bars, { noData: !bars.length })
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
