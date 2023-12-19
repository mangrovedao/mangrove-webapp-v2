import { Accordion } from "./accordion"
type MarketDetailsProps = {
  takerFee?: string
  tickSize?: string
  spotPrice?: string
}

export function MarketDetails({
  takerFee,
  tickSize,
  spotPrice,
}: MarketDetailsProps) {
  return (
    <Accordion title="Market details">
      <MarketDetailsLine title="Taker fee" value={takerFee} />
      <MarketDetailsLine title="Tick size" value={tickSize} />
      <MarketDetailsLine title="Current spot price" value={spotPrice} />
    </Accordion>
  )
}

type MarketDetailsLineProps = {
  title: string
  value?: string
}
export function MarketDetailsLine({ title, value }: MarketDetailsLineProps) {
  if (!value) return
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-secondary float-left">{title}</span>
      <span className="text-xs float-right">{value}</span>
    </div>
  )
}
