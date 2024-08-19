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
}

export default function datafeed({
  base,
  quote,
  baseAddress,
  quoteAddress,
}: Params) {
  return {
    onReady: (callback: OnReadyCallback) => {
      console.log("[onReady]: Method call")
      callback({
        // supports_search: true,
        // supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: true,
        supports_time: true,
        supported_resolutions: ["1D", "1W", "12M"] as ResolutionString[],
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
      console.log("[resolveSymbol]: Method call", symbolName)
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
      console.log("[getBars]: Method call", {
        symbolInfo,
        resolution,
        periodParams,
      })

      // do a request to this api : https://data.mangrove.exchange/price-chart?base=0x4300000000000000000000000000000000000004&quote=0x4300000000000000000000000000000000000003&start=2024-01-08&end=2024-14-08&interval=1d
      // and return the response to the library
      // const response = await fetch(
      //   `https://data.mangrove.exchange/price-chart?base=${baseAddress}&quote=${quoteAddress}&start=${periodParams.from}&end=${periodParams.to}&interval=${resolution}`,
      // )
      // const data = await response.json()
      // console.log({ data })

      const bars = new Array(periodParams.countBack)

      // For constructing the bars we are starting from the `to` time minus 1 day, and working backwards until we have `countBack` bars.
      let time = new Date(periodParams.to * 1000)
      time.setUTCHours(0)
      time.setUTCMinutes(0)
      time.setUTCMilliseconds(0)
      time.setUTCDate(time.getUTCDate() - 1)

      // Fake price.
      let price = 100

      for (let i = periodParams.countBack - 1; i > -1; i--) {
        bars[i] = {
          open: price,
          high: price,
          low: price,
          close: price,
          time: time.getTime(),
        }

        // Working out a random value for changing the fake price.
        const volatility = 0.1
        const x = Math.random() - 0.5
        const changePercent = 2 * volatility * x
        const changeAmount = price * changePercent
        price = price + changeAmount

        // Note that this simple "-1 day" logic only works because the TEST symbol has a 24x7 session.
        // For a more complex session we would need to, for example, skip weekends.
        time.setUTCDate(time.getUTCDate() - 1)
      }

      // Once all the bars (usually countBack is around 300 bars) the array of candles is returned to the library.
      onResult(bars)
    },
    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onTick: SubscribeBarsCallback,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void,
    ) => {
      // console.log(
      //   "[subscribeBars]: Method call with listenerGuid:",
      //   listenerGuid,
      //   symbolInfo,
      //   resolution,
      // )
    },
    unsubscribeBars: (listenerGuid: string) => {
      console.log(
        "[unsubscribeBars]: Method call with listenerGuid:",
        listenerGuid,
      )
    },
    getMarks: (
      symbolInfo: LibrarySymbolInfo,
      startDate: any,
      endDate: any,
      onDataCallback: any,
      resolution: any,
    ) => {
      // console.log(
      //   "[getMarks]: Method call",
      //   symbolInfo,
      //   startDate,
      //   endDate,
      //   resolution,
      // )
    },
  }
}
