import Big from "big.js"
import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import { EnhancedNumericInput } from "@/components/token-input"
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
import { Slider } from "@/components/ui/slider"
import { cn } from "@/utils"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import { TradeAction } from "../enums"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import { useLimit } from "./hooks/use-limit"
import type { Form } from "./types"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

const sliderValues = [25, 50, 75, 100]

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
    send,
  } = useLimit({
    onSubmit: (formData) => setFormData(formData),
  })

  const handleSliderChange = (value: number) => {
    const amount = (value * Number(sendTokenBalance.formatted)) / 100
    form.setFieldValue("send", amount.toString())
    form.validateAllFields("change")
    if (!form.state.values.limitPrice) {
      form.setFieldValue("receive", "")
      return
    }
    computeReceiveAmount()
  }

  const sendTokenBalanceAsBig = sendTokenBalance.formatted
    ? Big(Number(sendTokenBalance.formatted))
    : Big(0)

  const sliderValue = Math.min(
    Big(Number(send) ?? 0)
      .mul(100)
      .div(sendTokenBalanceAsBig.eq(0) ? 1 : sendTokenBalanceAsBig)
      .toNumber(),
    100,
  ).toFixed(0)

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
                <EnhancedNumericInput
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
                <EnhancedNumericInput
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
                <EnhancedNumericInput
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

            {/* Slider component */}
            <div className="space-y-5 pt-2 px-3">
              <Slider
                name={"sliderPercentage"}
                defaultValue={[0]}
                value={[Number(sliderValue)]}
                step={5}
                min={0}
                max={100}
                onValueChange={([value]) => {
                  handleSliderChange(Number(value))
                }}
                disabled={!(market && form.state.isFormValid)}
              />
              <div className="flex justify-center space-x-3">
                {sliderValues.map((value) => (
                  <Button
                    key={`percentage-button-${value}`}
                    variant={"secondary"}
                    size={"sm"}
                    className={cn("text-xs w-full", {
                      "opacity-10": Number(sliderValue) !== value,
                    })}
                    onClick={(e) => {
                      e.preventDefault()
                      handleSliderChange(Number(value))
                    }}
                    disabled={!market}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>

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
                    <EnhancedNumericInput
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

            <MarketDetails
              takerFee={feeInPercentageAsString}
              tickSize={tickSize}
            />

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
                    className="w-full flex items-center justify-center !mb-4 capitalize !mt-6"
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
