import { PriceRangeChart } from "@/app/strategies/new/_components/price-range/components/price-chart/price-range-chart"
import useKandel from "../../_providers/kandel-strategy"
import { useParameters } from "../parameters/hook/use-parameters"
import { LegendItem } from "./legend-item"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function PriceRangeInfos() {
  const { strategyStatusQuery, baseToken, quoteToken, mergedOffers } =
    useKandel()
  const { publishedBase, publishedQuote, currentParameter } = useParameters()

  const bids = strategyStatusQuery.data?.book?.bids ?? []
  const asks = strategyStatusQuery.data?.book?.asks ?? []
  const offerPrices = mergedOffers.map((item) => item.price)
  const minPrice = Math.min(...offerPrices)
  const maxPrice = Math.max(...offerPrices)

  // const avgReturnPercentage = strategyQuery.data?.return as number | undefined
  const priceRange = [minPrice, maxPrice] as [number, number]

  const baseValue = `${publishedBase?.toFixed(baseToken?.displayDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${publishedQuote?.toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
  const isLoading = strategyStatusQuery.isLoading || !baseToken || !quoteToken
  const chartIsLoading =
    strategyStatusQuery.isLoading ||
    !(baseToken && quoteToken && strategyStatusQuery.data?.midPrice)

  return (
    <div>
      <div className="relative">
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 justify-between items-center px-6 pb-8 my-3">
          {/* <AverageReturn percentage={avgReturnPercentage} /> */}
          <UnrealizedPnl pnl={currentParameter.pnlQuote} />
          <TotalInventory
            value={baseValue}
            symbol={baseToken?.symbol}
            loading={isLoading || baseValue === "0"}
            label="Total base inventory"
          />
          <TotalInventory
            value={quoteValue}
            symbol={quoteToken?.symbol}
            loading={isLoading || quoteValue === "0"}
            label="Total quote inventory"
          />
        </div>

        <div className="border-b absolute left-0 right-0" />

        <PriceRangeChart
          isLoading={chartIsLoading}
          bids={bids}
          asks={asks}
          initialMidPrice={strategyStatusQuery.data?.midPrice?.toNumber()}
          priceRange={priceRange}
          viewOnly
          mergedOffers={mergedOffers}
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
