import * as React from "react"

import { cn } from "@/utils"
import { TokenIcon } from "./token-icon"
import { Input, type InputProps } from "./ui/input"

export type NumericInputProps = {
  symbol?: React.ReactNode
  icon?: string
} & InputProps

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, icon, symbol, ...props }, ref) => {
    return (
      <div className="w-full relative group/input">
        {icon && (
          <div className="flex items-center absolute inset-y-0 left-4">
            <TokenIcon symbol={icon} />
          </div>
        )}
        <Input
          ref={ref}
          className={cn({ "pl-12": !!icon, "pr-24": !!symbol }, className)}
          {...props}
        />
        {symbol && (
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
            {symbol}
          </div>
        )}
      </div>
    )
  },
)

NumericInput.displayName = "NumericInput"

export { NumericInput }
