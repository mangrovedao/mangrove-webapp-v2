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

import { data } from "./sample"

type Params = {
  base: string
  quote: string
}

// api url : https://data.mangrove.exchange/price-chart
/**
 // Zod schema (query params for the url above)
const GetPriceChartSchema = z.object({
  base: ethAddressSchema,
  quote: ethAddressSchema,
  start: z.date({ coerce: true }),
  end: z
    .date({ coerce: true })
    .optional()
    .default(() => new Date()),
  interval: z.enum(['5s', '30s', '1m', '5m', '10m', '30m', '1hr', '6hr', '12hr', '1d'])
});
 */

// create me the url with the query params
// https://data.mangrove.exchange/price-chart?base=0x4300000000000000000000000000000000000004&quote=0x4300000000000000000000000000000000000003&start=2024-01-01&end=2024-07-12&interval=1d

export default function datafeed({ base, quote }: Params) {
  return {
    onReady: (callback: OnReadyCallback) => {
      console.log("[onReady]: Method call")
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
      console.log("[resolveSymbol]: Method call", symbolName)
      onResolve({
        ticker: `${base}/${quote}`,
        name: `${base}/${quote}`,
        description: `${base}/${quote}`,
        type: "stock",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "",
        minmov: 1,
        pricescale: 100,
        has_intraday: false,
        visible_plots_set: "ohlcv",
        has_weekly_and_monthly: false,
        // supported_resolutions: ["1", "5", "30", "60", "1D", "1W"],
        supported_resolutions: ["1D", "1W"],
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
      const bars = new Array(periodParams.countBack)
      console.log({
        bars,
        symbolInfo,
        resolution,
        periodParams,
      })
      const marketdata = data.map((item) => {
        return {
          time: new Date(item.ts).getTime(),
          open: item.open_price,
          high: item.max_price,
          low: item.min_price,
          close: item.close_price,
        }
      })

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

      console.log(marketdata)
      console.log(bars)

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
      console.log(
        "[subscribeBars]: Method call with listenerGuid:",
        listenerGuid,
      )
    },
    unsubscribeBars: (listenerGuid: string) => {
      console.log(
        "[unsubscribeBars]: Method call with listenerGuid:",
        listenerGuid,
      )
    },
  }
}
