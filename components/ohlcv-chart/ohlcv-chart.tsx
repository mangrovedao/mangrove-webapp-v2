import dynamic from "next/dynamic"

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "../../public/charting_library/charting_library"

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  interval: "1D" as ResolutionString,
  library_path: "charting_library/",
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: false,
  autosize: true,
}

const TVChartContainer = dynamic(
  () => import("./chart-container").then((mod) => mod.TVChartContainer),
  { ssr: false },
)

export default function OHLCVChart() {
  return <TVChartContainer {...defaultWidgetProps} />
}
