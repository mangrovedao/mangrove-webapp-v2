import type { Token } from "@mangrovedao/mgv"
import { type ValidationError } from "@tanstack/react-form"
import React from "react"

import {
  NumericInput,
  type NumericInputProps,
} from "@/components/numeric-input-new"
import { CustomBalance } from "@/components/stateful/token-balance/custom-balance-new"
import { TokenBalance } from "@/components/stateful/token-balance/token-balance-new"
import { cn } from "@/utils"
import { MinimumVolume } from "./minimum-volume"
import { Caption } from "./typography/caption"

type EnhancedNumericInputProps = {
  token?: Token | string
  customBalance?: string
  minimumVolume?: string
  disabled?: boolean
  label?: string
  showBalance?: boolean
  balanceLabel?: string
  balanceAction?: { onClick: (value: string) => void; text?: string }
  volumeAction?: { onClick: (value: string) => void; text?: string }
  error?: ValidationError[] | string
  inputClassName?: string
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
      customBalance,
      balanceAction,
      volumeAction,
      minimumVolume,
      error,
      className,
      inputClassName,
      ...inputProps
    },
    ref,
  ) => {
    const isNativeToken = typeof token === "string"
    const tokenSymbol = isNativeToken ? token : token?.symbol

    return (
      <div className={cn("flex-col flex bg-bg-primary rounded-lg ", className)}>
        <div className="flex justify-between ">
          {label && (
            <Caption
              variant={"caption1"}
              as={"label"}
              className="mb-0.5 text-text-secondary"
            >
              {label}
            </Caption>
          )}
          {customBalance && showBalance && (
            <CustomBalance
              action={balanceAction}
              token={token}
              balance={customBalance}
              label={balanceLabel}
            />
          )}
          {!customBalance && showBalance && (
            <TokenBalance
              action={balanceAction}
              token={token}
              label={balanceLabel}
            />
          )}
        </div>
        <NumericInput
          {...inputProps}
          className={inputClassName}
          ref={ref}
          icon={tokenSymbol}
          // symbol={tokenSymbol}
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

        {minimumVolume && (
          <MinimumVolume
            action={volumeAction}
            token={token}
            volume={minimumVolume}
            label={balanceLabel}
          />
        )}
      </div>
    )
  },
)

EnhancedNumericInput.displayName = "EnhancedNumericInput"
