import { Skeleton } from "@/components/ui/skeleton"
import { Token } from "@mangrovedao/mangrove.js"
import Big, { BigSource } from "big.js"

type Props = {
  loading?: boolean
  token?: Token | string
  value?: BigSource
  action: {
    onClick: (min: string) => void
    text: string
  }
}

export function MinimumRecommended({
  loading = false,
  value,
  token,
  action,
}: Props) {
  const tokenSymbol = typeof token === "string" ? token : token?.symbol
  const decimals = typeof token === "string" ? 6 : token?.displayedDecimals

  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">Min recommended</span>
      {loading || !value ? (
        <Skeleton className="w-28 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <span title={value.toString()}>
            {Big(value).toFixed(decimals)} {tokenSymbol}
          </span>
          <button
            className="text-xs underline"
            onClick={() => action.onClick(value.toString())}
          >
            {action.text}
          </button>
        </span>
      )}
    </div>
  )
}
