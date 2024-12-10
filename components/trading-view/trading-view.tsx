// import { useEffect } from "react"
// import TradingView from "../../public/charting_library"

// const TradingViewChart = () => {
//   useEffect(() => {
//     const script = document.createElement("script")
//     script.type = "text/jsx"
//     script.src = "/public/charting_library/charting_library.js"

//     document.head.appendChild(script)
//     window.tvWidget = new TradingView.widget({
//       symbol: "Bitfinex:BTC/USD", // default symbol
//       interval: "1D", // default interval
//       fullscreen: true, // displays the chart in the fullscreen mode
//       container: "tv_chart_container",
//       datafeed: Datafeed,
//       library_path: "/charting_library/",
//     })

//     return () => script.remove()
//   }, [])

//   return <div id="tv_chart_container"></div>
// }

// export default TradingViewChart
