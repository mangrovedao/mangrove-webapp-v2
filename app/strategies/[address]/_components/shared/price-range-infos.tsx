import { PriceRangeChart } from "@/app/strategies/new/_components/price-range/components/price-chart/price-range-chart"
import { useKandelBook } from "../../_hooks/use-kandel-book"
import useKandel from "../../_providers/kandel-strategy"
import { useParameters } from "../parameters/hook/use-parameters"
import { LegendItem } from "./legend-item"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function PriceRangeInfos() {
  const { strategyStatusQuery, baseToken, quoteToken, mergedOffers } =
    useKandel()
  const { publishedBase, publishedQuote, currentParameter } = useParameters()
  const { book } = useKandelBook()
  const bids = book?.bids ?? []
  const asks = book?.asks ?? []
  const isActive = strategyStatusQuery.data?.status !== "active"

  const offerPrices = mergedOffers.map((item) => item.price)
  const minPrice = Math.min(...offerPrices)
  const maxPrice = Math.max(...offerPrices)

  // const avgReturnPercentage = strategyQuery.data?.return as number | undefined
  const priceRange = isActive
    ? ([0, 0] as [number, number])
    : ([minPrice, maxPrice] as [number, number])

  const baseValue = `${Number(publishedBase)?.toFixed(baseToken?.displayDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${Number(publishedQuote)?.toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
  const isLoading = !baseToken || !quoteToken || strategyStatusQuery.isLoading

  const chartIsLoading = !(
    mergedOffers &&
    bids &&
    asks &&
    minPrice &&
    maxPrice &&
    book?.midPrice &&
    baseToken &&
    quoteToken &&
    !isActive
  )

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
          initialMidPrice={book?.midPrice}
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
