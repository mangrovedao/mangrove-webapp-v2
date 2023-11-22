import {
  NumericInput,
  type NumericInputProps,
} from "@components/ui/numeric-input"
import * as React from "react"
import { TokenIcon } from "../token-icon"

interface CustomNumericInputProps extends NumericInputProps {
  symbol?: React.ReactNode
  icon?: string
}

const CustomNumericInput = React.forwardRef<
  HTMLInputElement,
  CustomNumericInputProps
>(({ className, icon, symbol, onUserInput, ...props }, ref) => {
  return (
    <div className="flex w-full relative">
      {icon && (
        <div className="flex items-center absolute inset-y-0 left-0 p-3">
          <TokenIcon symbol={icon} />
        </div>
      )}
      <NumericInput
        className={`${icon && "pl-11"}  ${className}`} // Adjust padding for spacing
        onUserInput={onUserInput}
        {...props}
        ref={ref}
      />
      {symbol && (
        <div className="flex items-center absolute inset-y-0 right-0 p-3 opacity-20">
          {symbol}
        </div>
      )}
    </div>
  )
})

CustomNumericInput.displayName = "Input"

export { CustomNumericInput }
