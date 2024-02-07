import { type Token } from "@mangrovedao/mangrove.js"
import { type ValidationError } from "@tanstack/react-form"
import React from "react"

import {
  NumericInput,
  type NumericInputProps,
} from "@/components/numeric-input"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance"
import { cn } from "@/utils"
import { Caption } from "./typography/caption"

type EnhancedNumericInputProps = {
  token?: Token | string
  disabled?: boolean
  label?: string
  showBalance?: boolean
  balanceLabel?: string
  error?: ValidationError[] | string
} & NumericInputProps

export const EnhancedNumericInput = React.forwardRef<
  HTMLInputElement,
  EnhancedNumericInputProps
>(
  (
    {
      label,
      token,
      showBalance = false,
      balanceLabel,
      error,
      className,
      ...inputProps
    },
    ref,
  ) => {
    const isNativeToken = typeof token === "string"
    const tokenSymbol = isNativeToken ? token : token?.symbol
    return (
      <div className={cn("flex-col flex", className)}>
        {label && (
          <Caption variant={"caption1"} as={"label"} className="mb-0.5">
            {label}
          </Caption>
        )}
        <NumericInput
          {...inputProps}
          ref={ref}
          icon={tokenSymbol}
          symbol={tokenSymbol}
          aria-invalid={!!error?.length}
        />
        {error?.length ? (
          <p
            role="aria-live"
            className="text-red-100 text-xs leading-4 mt-1 mb-2"
          >
            {error}
          </p>
        ) : undefined}
        {showBalance && <TokenBalance token={token} label={balanceLabel} />}
      </div>
    )
  },
)

EnhancedNumericInput.displayName = "EnhancedNumericInput"
