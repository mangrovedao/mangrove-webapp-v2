import { AverageReturn } from "../../../(shared)/_components/average-return"
import useKandel from "../../_providers/kandel-strategy"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function Overview() {
  const { strategyStatusQuery, baseToken, quoteToken } = useKandel()
  const { bidsBalance, asksBalance } = strategyStatusQuery.data ?? {}

  const baseValue = `${asksBalance?.toFixed(baseToken?.displayedDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${bidsBalance?.toFixed(quoteToken?.displayedDecimals)} ${quoteToken?.symbol}`
  const isLoading = strategyStatusQuery.isLoading || !baseToken || !quoteToken

  return (
    <div>
      <div className="relative">
        <div className="flex justify-between items-center px-6 pb-8">
          <AverageReturn />
          <UnrealizedPnl />
          <TotalInventory
            value={baseValue}
            symbol={baseToken?.symbol}
            loading={isLoading}
          />
          <TotalInventory
            value={quoteValue}
            symbol={quoteToken?.symbol}
            loading={isLoading}
          />
        </div>

        <div className="border-b absolute -left-full -right-full -mt-4" />
      </div>
    </div>
  )
}
