import * as React from "react"

import { cn } from "@/utils"
import { overrideSymbol } from "@/utils/symbol"
import { Token } from "@mangrovedao/mgv"
import { TokenIcon } from "./token-icon"
import { Input, type InputProps } from "./ui/input-new"

export type NumericInputProps = {
  token: Token
} & InputProps

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, token, ...props }, ref) => {
    return (
      <div className="w-full relative group/input">
        {token && (
          <div className="flex items-center absolute inset-y-0 right-0 gap-2">
            <TokenIcon symbol={token.symbol} />
            <div className="text-text-primary leading-[1]">
              {overrideSymbol(token)}
            </div>
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            "text-text-secondary text-3xl w-2/3 bg-bg-primary !outline-none transition-all",
            { "pl-1": !!token, "pr-24": !!token?.symbol },
            className,
          )}
          {...props}
        />

        {token?.symbol && (
          <div
            className={cn(
              "flex items-center absolute inset-y-0 right-4 text-base",
              {
                "text-gray-scale-400": props.disabled,
                "text-gray-scale-300": !props.disabled,
              },
              className,
            )}
          >
            {overrideSymbol(token)}
          </div>
        )}
      </div>
    )
  },
)

NumericInput.displayName = "NumericInput"

export { NumericInput }
