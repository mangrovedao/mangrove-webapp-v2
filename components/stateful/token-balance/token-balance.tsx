import type { Token } from "@mangrovedao/mangrove.js"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"

export function TokenBalance(props: {
  token?: Token | string
  label?: string
}) {
  const token = typeof props.token === "string" ? undefined : props.token
  const { formattedWithSymbol, formatted, isLoading } = useTokenBalance(token)
  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">
        {props.label ?? "Balance"}
      </span>
      {!props.token || isLoading ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs float-right" title={formatted?.toString()}>
          {formattedWithSymbol}
        </span>
      )}
    </div>
  )
}
