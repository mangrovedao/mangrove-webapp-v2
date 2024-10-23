import { TokenIcon } from "@/components/token-icon-new"
import { Title } from "@/components/typography/title"

export function DialogAmountLine({
  amount,
  estimationAmount,
  symbol,
}: {
  amount: string
  estimationAmount: string
  symbol: string
}) {
  return (
    <div className="flex justify-between items-center gap-2">
      <div>
        <div className="flex items-center gap-2">
          <Title className="text-text-primary text-lg">{amount}</Title>
          <Title className="text-text-secondary text-lg">{symbol}</Title>
        </div>
        <div className="flex items-center gap-1 font-medium">
          <i className="text-text-quaternary">≈</i>
          <span className="text-xs text-text-secondary">
            {estimationAmount}
          </span>
          <span className="text-xs text-text-quaternary">$</span>
        </div>
      </div>

      <TokenIcon symbol={symbol} className="h-8 w-8" />
    </div>
  )
}
