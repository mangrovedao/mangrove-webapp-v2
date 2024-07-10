import useKandel from "../../_providers/kandel-strategy"
import { useParameters } from "../parameters/hook/use-parameters"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function StratInfoBanner() {
  const { strategyStatusQuery, strategyAddress, baseToken, quoteToken } =
    useKandel()

  const { publishedBase, publishedQuote, currentParameter } = useParameters()

  // const avgReturnPercentage = strategyQuery.data?.return as number | undefined

  const baseValue = `${Number(publishedBase)?.toFixed(baseToken?.displayDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${Number(publishedQuote)?.toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
  const isLoading = strategyStatusQuery.isLoading || !baseToken || !quoteToken

  return (
    <div>
      <div className="relative">
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 justify-between items-center px-6 pb-8 my-3">
          {/* <AverageReturn percentage={avgReturnPercentage} /> */}
          <UnrealizedPnl pnl={currentParameter.pnlQuote} />
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
