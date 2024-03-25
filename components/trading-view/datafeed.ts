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

export default {
  onReady: (callbac: OnReadyCallback) => {
    console.log("[onReady]: Method call")
    callbac({
      supports_search: true,
      supports_group_request: false,
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true,
      exchanges: [
        { value: "", name: "All Exchanges", desc: "" },
        { value: "NasdaqNM", name: "NasdaqNM", desc: "NasdaqNM" },
        { value: "NYSE", name: "NYSE", desc: "NYSE" },
      ],
      symbols_types: [
        { name: "All types", value: "" },
        { name: "Stock", value: "stock" },
        { name: "Index", value: "index" },
      ],
      supported_resolutions: ["1D"],
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
      ticker: "BTCUSD",
      name: "BTCUSD",
      description: "Bitcoin/USD",
      type: "stock",
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: "Example Exchange",
      minmov: 1,
      pricescale: 100,
      has_intraday: false,
      visible_plots_set: "ohlcv",
      has_weekly_and_monthly: false,
      supported_resolutions: ["1", "5", "30", "60", "1D", "1W"],
      volume_precision: 2,
      data_status: "streaming",
    })
  },
  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback,
  ) => {
    console.log("[getBars]: Method call", symbolInfo)
    setTimeout(() => {
      // For this piece of code only we will only return bars for the TEST symbol
      if (symbolInfo.ticker === "TEST" && resolution === "1D") {
        // We are constructing an array for `countBack` bars.
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
      } else {
        // If no result, return an empty array and specify it to the library by changing the value of `noData` to true.
        onResult([], {
          noData: true,
        })
      }
    }, 50)
  },
  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void,
  ) => {
    console.log("[subscribeBars]: Method call with listenerGuid:", listenerGuid)
  },
  unsubscribeBars: (listenerGuid: string) => {
    console.log(
      "[unsubscribeBars]: Method call with listenerGuid:",
      listenerGuid,
    )
  },
}
