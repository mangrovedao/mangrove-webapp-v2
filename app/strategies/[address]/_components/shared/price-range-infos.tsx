import Big from "big.js"

import { PriceRangeChart } from "@/app/strategies/new/_components/price-range/components/price-chart/price-range-chart"
import { AverageReturn } from "../../../(shared)/_components/average-return"
import useKandel from "../../_providers/kandel-strategy"
import { LegendItem } from "./legend-item"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function PriceRangeInfos() {
  const { strategyQuery, strategyStatusQuery, baseToken, quoteToken, geometricKandelDistribution } =
    useKandel()
  const { bidsBalance, asksBalance } = strategyStatusQuery.data ?? {}

  const bids = strategyStatusQuery.data?.book?.bids ?? []
  const asks = strategyStatusQuery.data?.book?.asks ?? []

  const avgReturnPercentage = strategyQuery.data?.return as number | undefined
  const priceRange = !strategyQuery.isLoading
    ? ([Number(strategyQuery.data?.min), Number(strategyQuery.data?.max)] as [
        number,
        number,
      ])
    : undefined
  const baseValue = `${asksBalance?.toFixed(baseToken?.displayedDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${bidsBalance?.toFixed(quoteToken?.displayedDecimals)} ${quoteToken?.symbol}`
  const isLoading = strategyStatusQuery.isLoading || !baseToken || !quoteToken
  const chartIsLoading =
    (strategyStatusQuery.isLoading && strategyQuery.isLoading) ||
    !(baseToken && quoteToken && strategyStatusQuery.data?.midPrice)

  return (
    <div>
      <div className="relative">
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 justify-between items-center px-6 pb-8 my-3">
          <AverageReturn percentage={avgReturnPercentage} />
          <UnrealizedPnl />
          <TotalInventory
            value={baseValue}
            symbol={baseToken?.symbol}
            loading={isLoading}
            label="Total base inventory"
          />
          <TotalInventory
            value={quoteValue}
            symbol={quoteToken?.symbol}
            loading={isLoading}
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
          geometricKandelDistribution={geometricKandelDistribution}
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
