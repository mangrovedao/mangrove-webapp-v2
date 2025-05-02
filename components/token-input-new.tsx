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
import { Slider } from "./ui/slider"
import { Spinner } from "./ui/spinner"

type EnhancedNumericInputProps = {
  token?: Token | string
  customBalance?: string
  dollarAmount?: number | string
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
  isWrapping?: boolean
  loading?: boolean
  showSlider?: boolean
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
      isWrapping,
      showSlider = false,
      loading = false,
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
            "grid z-10 px-3 pt-[10px] pb-[10px] -gap-3 flex-col bg-bg-primary rounded-sm border border-border-tertiary border-[0.5px] transition-all",
            !error?.length &&
              "focus-within:border focus-within:border-border-brand focus-within:border-[0.5px]",
            error?.length && "border-red-900 border-[0.5px] bg-red-950 ",
            className,
          )}
        >
          <div className="flex justify-between ">
            {label && (
              <Caption
                variant={"caption1"}
                as={"label"}
                className="mb-0.5 text-text-secondary text-xs"
              >
                {label}
              </Caption>
            )}
            {customBalance && showBalance && (
              <CustomBalance
                isWrapping={isWrapping}
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
          {loading ? (
            <div className="w-full flex items-center justify-center">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <>
              <NumericInput
                {...inputProps}
                className={cn(inputClassName, "!text-text-primary", {
                  "border-red-900 border-[0.5px] bg-red-950": error?.length,
                  "border-border-tertiary": !error?.length,
                })}
                ref={ref}
                icon={tokenSymbol}
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
                    {showSlider && (
                      <div className="mb-3">
                        <Slider
                          disabled={inputProps.disabled}
                          value={[sendSliderValue || 0]}
                          onValueChange={(values) => {
                            setSendSliderValue(values[0] || 0)
                          }}
                          max={100}
                          step={1}
                          className="z-50"
                        />
                      </div>
                    )}
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
            </>
          )}
        </div>
      </div>
    )
  },
)

EnhancedNumericInput.displayName = "EnhancedNumericInput"
