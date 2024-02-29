import type { Token } from "@mangrovedao/mangrove.js"

import { Skeleton } from "@/components/ui/skeleton"

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

  return (
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-secondary float-left">
        {props.label ?? "Balance"}
      </span>
      {!props.balance || !props.token ? (
        <Skeleton className="w-24 h-4" />
      ) : (
        <span className="text-xs space-x-1">
          <span>
            {Number(props.balance).toFixed(token?.displayedDecimals)}{" "}
            {token?.symbol}
          </span>
          {props?.action && (
            <button
              className="text-xs underline"
              onClick={() =>
                props.balance && props?.action?.onClick(props.balance)
              }
            >
              {props?.action.text}
            </button>
          )}
        </span>
      )}
    </div>
  )
}
