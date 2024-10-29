type MarketDetailsProps = {
  takerFee?: string
  minVolume?: string
}

export function MarketDetails({ takerFee, minVolume }: MarketDetailsProps) {
  return (
    <>
      <MarketDetailsLine title="Fee" value={takerFee} />

      {minVolume ? (
        <MarketDetailsLine title={`Minimum volume`} value={`${minVolume}`} />
      ) : undefined}
    </>
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
      <span className="text-xs text-text-secondary float-left">{title}</span>
      <span className="text-xs float-right text-text-secondary">{value}</span>
    </div>
  )
}
