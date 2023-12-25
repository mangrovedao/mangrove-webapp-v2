import withClientOnly from "@/hocs/withClientOnly"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { AverageReturn } from "./components/average-return"
import { LiquiditySource } from "./components/liquidity-source"
import { PriceRangeChart } from "./components/price-chart/price-range-chart"
import { RiskAppetite } from "./components/risk-appetite"

export const PriceRange = withClientOnly(function ({
  className,
}: {
  className?: string
}) {
  const { requestBookQuery } = useMarket()
  return (
    <div className={cn(className)}>
      <div className="border-b">
        <div className="flex justify-between items-center px-6 pb-8">
          <AverageReturn percentage={1.5} />
          <RiskAppetite value="low" />
          <LiquiditySource />
        </div>
      </div>

      {/* CHART */}
      <div className="px-6">
        <PriceRangeChart
          bids={requestBookQuery.data?.bids}
          asks={requestBookQuery.data?.asks}
          onPriceRangeChange={() => {
            console.log("onPriceRangeChange")
          }}
        />
      </div>
    </div>
  )
})
