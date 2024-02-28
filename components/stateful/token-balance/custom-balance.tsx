import type { Token } from "@mangrovedao/mangrove.js"

import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"

export function CustomBalance(props: {
  token?: Token | string
  balance?: string
  label?: string
  action?: {
    onClick: (value: string) => void
    text: string
  }
}) {
  const token = typeof props.token === "string" ? undefined : props.token
  const { formattedWithSymbol, formatted, isLoading } = useTokenBalance(token)

  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">
        {props.label ?? "Balance"}
      </span>
      {!props.balance || !props.token || isLoading ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <span>{formattedWithSymbol}</span>
          {props?.action && (
            <button
              className="text-xs underline"
              onClick={() => formatted && props?.action?.onClick(formatted)}
            >
              {props?.action.text}
            </button>
          )}
        </span>
      )}
    </div>
  )
}
