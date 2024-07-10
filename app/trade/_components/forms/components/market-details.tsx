import { Accordion } from "./accordion"
type MarketDetailsProps = {
  takerFee?: string
  tickSize?: string
  spotPrice?: string
  minVolume?: string
  amplifiedMinVolume?: string
}

export function MarketDetails({
  takerFee,
  tickSize,
  spotPrice,
  minVolume,
  amplifiedMinVolume,
}: MarketDetailsProps) {
  return (
    <Accordion title="Market details">
      <MarketDetailsLine title="Taker fee" value={takerFee} />
      <MarketDetailsLine title="Tick size" value={tickSize} />
      <MarketDetailsLine title="Current spot price" value={spotPrice} />

      {amplifiedMinVolume ? (
        <MarketDetailsLine title="Minimum Volume" value={amplifiedMinVolume} />
      ) : undefined}

      {minVolume ? (
        <MarketDetailsLine title={`Minimum volume`} value={`${minVolume}`} />
      ) : undefined}
    </Accordion>
  )
}

type MarketDetailsLineProps = {
  title: string
  value?: string
}
function MarketDetailsLine({ title, value }: MarketDetailsLineProps) {
  if (!value) return
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-secondary float-left">{title}</span>
      <span className="text-xs float-right">{value}</span>
    </div>
  )
}
