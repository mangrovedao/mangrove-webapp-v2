import { Skeleton } from "@/components/ui/skeleton"
import { Token } from "@mangrovedao/mangrove.js"
import Big from "big.js"

type Props = {
  loading?: boolean
  token: Token
  value: number | string | Big
  action: {
    onClick: () => void
    text: string
  }
}

export function InitialInventoryInfo({
  loading = false,
  value,
  token,
  action,
}: Props) {
  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">Min recommended</span>
      {loading ? (
        <Skeleton className="w-28 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <span title={value.toString()}>
            {Big(value).toFixed(token.displayedDecimals)} {token.symbol}
          </span>
          <button className="text-xs underline" onClick={action.onClick}>
            {action.text}
          </button>
        </span>
      )}
    </div>
  )
}
