import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { ResolutionString } from "@/public/charting_library/charting_library"

export default function Market() {
  return (
    <div className="">
      Market chart
      <TVChartContainer symbol={"AAPL"} interval={`1D` as ResolutionString} />
    </div>
  )
}
