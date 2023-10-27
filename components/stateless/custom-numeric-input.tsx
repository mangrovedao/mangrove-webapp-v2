import { NumericInput, NumericInputProps } from "@components/ui/numeric-input"
import * as React from "react"

interface CustomNumericInputProps extends NumericInputProps {
  icon?: React.ReactNode
}

const CustomNumericInput = React.forwardRef<
  HTMLInputElement,
  CustomNumericInputProps
>(({ className, type, icon, onUserInput, ...props }, ref) => {
  return (
    <div className="flex w-full relative">
      <NumericInput
        className={className}
        onUserInput={onUserInput}
        {...props}
      />
      {icon && (
        <div className="flex items-center absolute inset-y-0 right-0 p-3">
          {icon}
        </div>
      )}
    </div>
  )
})

CustomNumericInput.displayName = "Input"

export { CustomNumericInput }
