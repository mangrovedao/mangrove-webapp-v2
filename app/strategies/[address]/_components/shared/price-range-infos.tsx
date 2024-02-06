import { PriceRangeChart } from "@/app/strategies/new/_components/price-range/components/price-chart/price-range-chart"
import useKandel from "../../_providers/kandel-strategy"
import { MergedOffers } from "../../_utils/inventory"
import { LegendItem } from "./legend-item"
import StratInfoBanner from "./strat-info-banner"

export default function PriceRangeInfos() {
  const {
    strategyQuery,
    strategyStatusQuery,
    baseToken,
    quoteToken,
    mergedOffers,
  } = useKandel()

  const bids = strategyStatusQuery.data?.book?.bids ?? []
  const asks = strategyStatusQuery.data?.book?.asks ?? []

  const priceRange = !strategyQuery.isLoading
    ? ([Number(strategyQuery.data?.min), Number(strategyQuery.data?.max)] as [
        number,
        number,
      ])
    : undefined
  const chartIsLoading =
    (strategyStatusQuery.isLoading && strategyQuery.isLoading) ||
    !(baseToken && quoteToken && strategyStatusQuery.data?.midPrice)

  return (
    <div>
      <div className="relative">
        <StratInfoBanner />

        <PriceRangeChart
          isLoading={chartIsLoading}
          bids={bids}
          asks={asks}
          initialMidPrice={strategyStatusQuery.data?.midPrice?.toNumber()}
          priceRange={priceRange}
          viewOnly
          mergedOffers={mergedOffers as MergedOffers}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
        <div className="pt-4 flex gap-4">
          <LegendItem type="bids" />
          <LegendItem type="asks" />
          <LegendItem type="empty" />
        </div>
      </div>
    </div>
  )
}
