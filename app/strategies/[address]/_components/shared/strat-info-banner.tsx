import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import useKandel from "../../_providers/kandel-strategy"
import { useParameters } from "../parameters/hook/use-parameters"
import TotalInventory from "./total-inventory"
import UnrealizedPnl from "./unrealized-pnl"

export default function StratInfoBanner() {
  const { strategyQuery, strategyStatusQuery, baseToken, quoteToken } =
    useKandel()
  const { publishedBase, publishedQuote, currentParameter } = useParameters()
  const { asksBalance, bidsBalance } =
    useQuery({
      queryKey: ["strategy-balance", baseToken?.address, quoteToken?.address],
      queryFn: async () => {
        if (!strategyStatusQuery.data?.stratInstance) return
        const [asksBalance, bidsBalance] = await Promise.all([
          strategyStatusQuery.data.stratInstance.getBalance("asks"),
          strategyStatusQuery.data.stratInstance.getBalance("bids"),
        ])

        return { asksBalance, bidsBalance }
      },
      initialData: { asksBalance: Big(0), bidsBalance: Big(0) },
    }).data ?? {}

  // const avgReturnPercentage = strategyQuery.data?.return as number | undefined

  const baseValue = `${publishedBase?.toFixed(baseToken?.displayDecimals)} ${baseToken?.symbol}`
  const quoteValue = `${publishedQuote?.toFixed(quoteToken?.displayDecimals)} ${quoteToken?.symbol}`
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
