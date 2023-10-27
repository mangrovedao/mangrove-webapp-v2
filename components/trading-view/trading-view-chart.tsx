"use client"
import React from "react"
import {
  widget,
  type ChartingLibraryWidgetOptions,
} from "../../public/charting_library"

export const TVChartContainer = (
  props: Partial<ChartingLibraryWidgetOptions>,
) => {
  const chartContainerRef =
    React.useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>

  React.useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.symbol,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        "https://demo_feed.tradingview.com",
        undefined,
        {
          maxResponseLength: 1000,
          expectedOrder: "latestFirst",
        },
      ),

      interval: props.interval!,
      container: chartContainerRef.current,
      library_path: "charting_library/",
      locale: "en",
      fullscreen: false,
      debug: true,
      theme: "dark",
      custom_css_url: "css/styles.css",
      disabled_features: [
        "use_localstorage_for_settings",
        "left_toolbar",
        "header_chart_type",
        "popup_hints",
        "header_screenshot",
        "header_compare",
        "header_symbol_search",
        "volume_force_overlay",
        "create_volume_indicator_by_default",
        "timezone_menu",
        "timeframes_toolbar",
      ],
      overrides: {
        "paneProperties.background": "black",
        "paneProperties.backgroundType": "solid",
      },
      // isolatedModules: false,
      // custom_indicators_getter: (PineJS) => {
      //   return Promise.resolve<CustomIndicator[]>([
      //     /* Coloring bars */
      //     {
      //       name: "Bar Colorer Demo",
      //       metainfo: {
      //         _metainfoVersion: 51,

      //         id: "BarColoring@tv-basicstudies-1" as RawStudyMetaInfoId,
      //         name: "BarColoring",
      //         description: "Bar Colorer Demo",
      //         shortDescription: "BarColoring",

      //         isCustomIndicator: true,
      //         is_price_study: true,

      //         format: {
      //           type: "price",
      //           precision: 4,
      //         },

      //         defaults: {
      //           palettes: {
      //             palette_0: {
      //               // palette colors
      //               // change it to the default colors that you prefer,
      //               // but note that the user can change them in the Style tab
      //               // of indicator properties
      //               colors: [{ color: "#FFFF00" }, { color: "#0000FF" }],
      //             },
      //           },
      //         },
      //         inputs: [],
      //         plots: [
      //           {
      //             id: "plot_0",

      //             // plot type should be set to 'bar_colorer'
      //             type: StudyPlotType.BarColorer,

      //             // this is the name of the palette that is defined
      //             // in 'palettes' and 'defaults.palettes' sections
      //             palette: "palette_0",
      //           },
      //         ],
      //         palettes: {
      //           palette_0: {
      //             colors: [{ name: "Color 0" }, { name: "Color 1" }],

      //             // the mapping between the values that
      //             // are returned by the script and palette colors
      //             valToIndex: {
      //               100: 0,
      //               200: 1,
      //             },
      //           },
      //         },
      //       },
      //       constructor: function (this: LibraryPineStudy<IPineStudyResult>) {
      //         this.main = function (context, input) {
      //           this._context = context
      //           this._input = input

      //           const valueForColor0 = 100
      //           const valueForColor1 = 200

      //           // perform your calculations here and return one of the constants
      //           // that is specified as a key in 'valToIndex' mapping
      //           const result =
      //             (Math.random() * 100) % 2 > 1 // we randomly select one of the color values
      //               ? valueForColor0
      //               : valueForColor1

      //           return [result]
      //         }
      //       },
      //     },
      //   ])
      // },
      // enabled_features: ["study_templates"],
      // charts_storage_url: props.charts_storage_url,
      // charts_storage_api_version: props.charts_storage_api_version,
      // client_id: props.client_id,
      // user_id: props.user_id,
      // autosize: props.autosize,
    }

    const tvWidget = new widget(widgetOptions)

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton()
        button.setAttribute("title", "Click to show a notification popup")
        button.classList.add("apply-common-tooltip")
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!")
            },
          }),
        )

        button.innerHTML = "Check API"
      })
    })

    return () => {
      tvWidget.remove()
    }
  }, [props])
  return <div ref={chartContainerRef} className="flex" />
}
