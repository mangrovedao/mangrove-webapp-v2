import * as React from "react"

import { Input } from "@/components/ui/input"
import { escapeRegExp } from "@/utils/regexp"

export type NumericInputProps = React.ComponentProps<typeof Input> & {
  onUserInput?: (nextUserInput: string) => void
}

const REGEX = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ type, placeholder, onUserInput, ...props }, ref) => {
    const enforcer = (nextUserInput: string) => {
      if (nextUserInput === "" || REGEX.test(escapeRegExp(nextUserInput))) {
        onUserInput?.(nextUserInput)
      }
    }
    return (
      <Input
        {...props}
        ref={ref}
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        onChange={({ target }) => {
          enforcer(target.value.replace(/,/g, "."))
        }}
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder={placeholder ?? "0.0"}
        minLength={1}
        maxLength={79}
        spellCheck="false"
      />
    )
  },
)
NumericInput.displayName = "Input"

export { NumericInput }
