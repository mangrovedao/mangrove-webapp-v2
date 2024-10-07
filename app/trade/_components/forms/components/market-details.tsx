import { Accordion } from "./accordion"
type MarketDetailsProps = {
  takerFee?: string
  minVolume?: string
}

export function MarketDetails({ takerFee, minVolume }: MarketDetailsProps) {
  return (
    <Accordion title="Market details">
      <MarketDetailsLine title="Fee" value={takerFee} />

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
