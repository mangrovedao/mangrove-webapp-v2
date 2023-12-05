/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Token } from "@mangrovedao/mangrove.js"
import type { ValidationError } from "@tanstack/react-form"
import { LucideChevronRight } from "lucide-react"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/stateless/custom-radio-group"
import {
  NumericInput,
  type NumericInputProps,
} from "@/components/stateless/numeric-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils"
import { TokenBalance } from "../components/token-balance"
import { TradeAction } from "../types"
import { useLimit } from "./use-limit"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

export function Limit() {
  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    quote,
    market,
    sendToken,
    receiveToken,
  } = useLimit()

  return (
    <form.Provider>
      <form onSubmit={handleSubmit} autoComplete="off">
        <form.Field name="tradeAction">
          {(field) => (
            <CustomRadioGroup
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onValueChange={(e: TradeAction) => {
                field.handleChange(e)
                computeReceiveAmount()
              }}
            >
              {Object.values(TradeAction).map((action) => (
                <CustomRadioGroupItem
                  key={action}
                  value={action}
                  id={action}
                  variant={
                    action === TradeAction.SELL ? "secondary" : "primary"
                  }
                  className="capitalize"
                >
                  {action}
                </CustomRadioGroupItem>
              ))}
            </CustomRadioGroup>
          )}
        </form.Field>
        <div className="space-y-4 !mt-6">
          <form.Field name="limitPrice" onChange={isGreaterThanZeroValidator}>
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  computeReceiveAmount()
                }}
                token={quote}
                label="Limit price"
                disabled={!market}
                error={field.state.meta.errors}
              />
            )}
          </form.Field>

          <form.Field
            name="send"
            onChange={sendValidator(Number(sendTokenBalance.formatted ?? 0))}
          >
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={({ target: { value } }) => {
                  field.handleChange(value)
                  computeReceiveAmount()
                }}
                token={sendToken}
                label="Send amount"
                disabled={!market}
                showBalance
                error={field.state.meta.touchedErrors}
              />
            )}
          </form.Field>
          <form.Field name="receive" onChange={isGreaterThanZeroValidator}>
            {(field) => (
              <TradeInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={({ target: { value } }) => {
                  field.handleChange(value)
                  computeSendAmount()
                }}
                token={receiveToken}
                label="Receive amount"
                disabled={!(market && form.state.isFormValid)}
                showBalance
                error={field.state.meta.touchedErrors}
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.values.tradeAction,
            ]}
          >
            {([canSubmit, isSubmitting, tradeAction]) => {
              return (
                <Button
                  className="w-full flex items-center justify-center !mb-4 capitalize"
                  size={"lg"}
                  type="submit"
                  disabled={!canSubmit || !market}
                >
                  {isSubmitting ? "Processing..." : tradeAction}
                  <div
                    className={cn(
                      "ml-2 bg-white h-6 w-6 rounded-full text-secondary flex items-center justify-center transition-opacity",
                      {
                        "opacity-10": !market,
                      },
                    )}
                  >
                    <LucideChevronRight className="h-4 text-current" />
                  </div>
                </Button>
              )
            }}
          </form.Subscribe>
        </div>
      </form>
    </form.Provider>
  )
}

type TradeInputProps = {
  token?: Token
  disabled?: boolean
  label: string
  showBalance?: boolean
  error?: ValidationError[]
} & NumericInputProps

const TradeInput = React.forwardRef<HTMLInputElement, TradeInputProps>(
  ({ label, token, showBalance = false, error, ...inputProps }, ref) => {
    return (
      <div className="flex-col flex">
        <Label>{label}</Label>
        <NumericInput
          {...inputProps}
          ref={ref}
          icon={token?.symbol}
          symbol={token?.symbol}
          aria-invalid={!!error?.length}
        />
        {error && (
          <p role="aria-live" className="text-red-100 text-xs leading-4 mt-1">
            {error}
          </p>
        )}
        {!error?.length && showBalance && <TokenBalance token={token} />}
      </div>
    )
  },
)

TradeInput.displayName = "TradeInput"
