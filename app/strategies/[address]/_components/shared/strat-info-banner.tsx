import { AverageReturn } from "../../../(shared)/_components/average-return"
import useKandel from "../../_providers/kandel-strategy"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function StratInfoBanner() {
  const { strategyQuery, strategyStatusQuery, baseToken, quoteToken } =
    useKandel()
  const { bidsBalance, asksBalance } = strategyStatusQuery.data ?? {}

  const avgReturnPercentage = strategyQuery.data?.return as number | undefined

  const baseValue = `${asksBalance?.toFixed(baseToken?.displayedDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${bidsBalance?.toFixed(quoteToken?.displayedDecimals)} ${quoteToken?.symbol}`
  const isLoading = strategyStatusQuery.isLoading || !baseToken || !quoteToken

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
      </div>
    </div>
  )
}
