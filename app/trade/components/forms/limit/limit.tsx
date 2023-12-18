import type { Token } from "@mangrovedao/mangrove.js"
import type { ValidationError } from "@tanstack/react-form"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import {
  NumericInput,
  type NumericInputProps,
} from "@/components/numeric-input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/utils"
import { Accordion } from "../components/accordion"
import { TokenBalance } from "../components/token-balance"
import { TradeAction } from "../enums"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import { useLimit } from "./hooks/use-limit"
import type { Form } from "./types"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

export function Limit() {
  const [formData, setFormData] = React.useState<Form>()
  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    market,
    sendToken,
    receiveToken,
    tickSize,
    feeInPercentageAsString,
    timeInForce,
  } = useLimit({
    onSubmit: (formData) => setFormData(formData),
  })

  return (
    <>
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
                  token={quoteToken}
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
                  error={field.state.meta.touchedErrors}
                  showBalance
                />
              )}
            </form.Field>

            {/* TODO: set slider and synchronize it to send field */}
            {/* <CSlider form={form} sliderPercentage={sliderPercentage} /> */}

            <Separator className="!my-6" />

            <Accordion title="Advanced">
              <form.Field name="timeInForce">
                {(field) => {
                  return (
                    <div className="grid text-md space-y-2">
                      <Label>Time in force</Label>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value: TimeInForce) => {
                          field.handleChange(value)
                        }}
                        disabled={!market}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time in force" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Object.values(TimeInForce).map((timeInForce) => (
                              <SelectItem key={timeInForce} value={timeInForce}>
                                {timeInForce}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }}
              </form.Field>

              <div
                className={cn("flex justify-between space-x-2", {
                  hidden: timeInForce !== TimeInForce.GOOD_TIL_TIME,
                })}
              >
                <form.Field
                  name="timeToLive"
                  onChange={isGreaterThanZeroValidator}
                >
                  {(field) => (
                    <TradeInput
                      placeholder="1"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) => {
                        if (!value) return
                        field.handleChange(value)
                      }}
                      disabled={!(market && form.state.isFormValid)}
                      error={field.state.meta.touchedErrors}
                    />
                  )}
                </form.Field>

                <form.Field name="timeToLiveUnit">
                  {(field) => (
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value: TimeToLiveUnit) => {
                        field.handleChange(value)
                      }}
                      disabled={!market}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(TimeToLiveUnit).map(
                            (timeToLiveUnit) => (
                              <SelectItem
                                key={timeToLiveUnit}
                                value={timeToLiveUnit}
                              >
                                {timeToLiveUnit}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
              </div>
            </Accordion>

            <Separator className="!my-6" />

            <Accordion title="Market details" className="!mb-6">
              <MarketDetailsLine
                title="Taker fee"
                value={feeInPercentageAsString}
              />
              <MarketDetailsLine title="Tick size" value={tickSize} />
            </Accordion>

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
                    disabled={!canSubmit || !market}
                    rightIcon
                    loading={!!isSubmitting}
                  >
                    {tradeAction}
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>
        </form>
      </form.Provider>

      {formData && (
        <FromWalletLimitOrderDialog
          form={formData}
          onClose={() => setFormData(undefined)}
        />
      )}
    </>
  )
}

type MarketDetailsLineProps = {
  title: string
  value: string
}
function MarketDetailsLine({ title, value }: MarketDetailsLineProps) {
  return (
    <div className="flex justify-between items-center mt-2">
      <span className="text-xs text-secondary float-left">{title}</span>
      <span className="text-xs float-right">{value}</span>
    </div>
  )
}

type TradeInputProps = {
  token?: Token
  disabled?: boolean
  label?: string
  showBalance?: boolean
  error?: ValidationError[]
} & NumericInputProps

const TradeInput = React.forwardRef<HTMLInputElement, TradeInputProps>(
  ({ label, token, showBalance = false, error, ...inputProps }, ref) => {
    return (
      <div className="flex-col flex">
        {label && <Label>{label}</Label>}
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
        {showBalance && <TokenBalance token={token} />}
      </div>
    )
  },
)

TradeInput.displayName = "TradeInput"
