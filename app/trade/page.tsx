import DepthChart from "@/components/stateful/depth-chart/depth-chart"
import MarketSelector from "@/components/stateful/market-selector"

export default function Trade() {
  return (
    <div>
      <h1>Trade Page</h1>
      <MarketSelector />

      <div className="mt-20 min-h-[400px] inline-grid w-full">
        <DepthChart />
      </div>
    </div>
  )
}
