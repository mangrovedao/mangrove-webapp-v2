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
import { Button } from "./ui/button"

type EnhancedNumericInputProps = {
  token?: Token | string
  customBalance?: string
  dollarAmount?: string
  minimumVolume?: string
  sendSliderValue?: number
  setSendSliderValue?: (value: number) => void
  disabled?: boolean
  label?: string
  showBalance?: boolean
  balanceLabel?: string
  balanceAction?: { onClick: (value: string) => void; text?: string }
  volumeAction?: { onClick: (value: string) => void; text?: string }
  error?: ValidationError[] | string
  inputClassName?: string
} & NumericInputProps

const sliderValues = [25, 50, 75]

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
      dollarAmount,
      customBalance,
      balanceAction,
      volumeAction,
      minimumVolume,
      error,
      className,
      inputClassName,
      sendSliderValue,
      setSendSliderValue,
      ...inputProps
    },
    ref,
  ) => {
    const isNativeToken = typeof token === "string"
    const tokenSymbol = isNativeToken ? token : token?.symbol

    return (
      <div className="grid">
        <div
          className={cn(
            "grid z-10 px-3 pt-[14px] pb-[14px] -gap-4 flex-col bg-bg-primary rounded-2xl border border-transparent transition-all",
            !error?.length &&
              "focus-within:border focus-within:border-border-brand",
            error?.length && "border-red-600 border-2",
            className,
          )}
        >
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
          <div>
            {dollarAmount ? (
              <div className="flex items-center gap-1 ">
                <i className="text-text-quaternary">≈</i>
                <span className="text-xs text-text-secondary">
                  {dollarAmount ?? "..."}
                </span>
                <span className="text-xs text-text-quaternary">$</span>
              </div>
            ) : undefined}
            {setSendSliderValue ? (
              <>
                <div className="flex space-x-2">
                  {sliderValues.map((value, i) => (
                    <Button
                      key={`percentage-button-${value}`}
                      variant={"secondary"}
                      size={"md"}
                      disabled={inputProps.disabled}
                      value={sendSliderValue}
                      className={cn(
                        "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none flex-1",
                        {
                          "bg-bg-tertiary": sendSliderValue === value,
                        },
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        setSendSliderValue?.(Number(value))
                      }}
                    >
                      {value}%
                    </Button>
                  ))}
                  <Button
                    key={`percentage-button-max`}
                    variant={"secondary"}
                    size={"md"}
                    disabled={inputProps.disabled}
                    className={cn(
                      "!h-6 text-xs w-full !rounded-md flex items-center justify-center border-none flex-1",
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      setSendSliderValue?.(100)
                    }}
                    // disabled={!currentMarket}
                  >
                    Max
                  </Button>
                </div>
              </>
            ) : undefined}
          </div>

          {minimumVolume && (
            <MinimumVolume
              action={volumeAction}
              token={token}
              volume={minimumVolume}
              label={balanceLabel}
            />
          )}
        </div>

        {error?.length ? (
          <div className="-mt-1.5 p-1 px-3 bg-red-950 rounded-b-2xl">
            <p
              role="aria-live"
              className="text-red-100 text-xs font-light leading-4 mt-2 mb-1"
            >
              {error}
            </p>
          </div>
        ) : undefined}
      </div>
    )
  },
)

EnhancedNumericInput.displayName = "EnhancedNumericInput"
