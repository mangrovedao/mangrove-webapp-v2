type MarketDetailsLineProps = {
  title: string
  value: string
}
export function MarketDetailsLine({ title, value }: MarketDetailsLineProps) {
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-secondary float-left">{title}</span>
      <span className="text-xs float-right">{value}</span>
    </div>
  )
}
