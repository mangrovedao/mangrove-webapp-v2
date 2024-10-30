import { BS } from "@mangrovedao/mgv/lib"
import Big from "big.js"
import React from "react"
import { formatUnits } from "viem"

import { CustomInput } from "@/components/custom-input-new"
import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group-new"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils"
import { FIELD_ERRORS } from "@/utils/form-errors"
import { EnhancedNumericInput } from "@components/token-input-new"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import { TradeAction } from "../enums"
import FromWalletMarketOrderDialog from "./components/from-wallet-order-dialog"
import { useMarketForm } from "./hooks/use-market"
import { type Form } from "./types"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

const sliderValues = [25, 50, 75, 100]
const slippageValues = ["0.1", "0.5", "1"]

export function Market() {
  const [formData, setFormData] = React.useState<Form>()
  const [showCustomInput, setShowCustomInput] = React.useState(false)

  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    market,
    sendToken,
    receiveToken,
    hasEnoughVolume,
    send,
    quote,
    avgPrice,
    feeInPercentageAsString,
    spotPrice,
    slippage,
  } = useMarketForm({ onSubmit: (formData) => setFormData(formData) })

  const sendBalance = formatUnits(
    sendTokenBalance.balance?.balance || 0n,
    sendToken?.decimals || 18,
  )
  const sendTokenBalanceAsNumber = sendBalance ? Number(sendBalance) : 0

  const handleSliderChange = (value: number) => {
    const amount = (value * sendTokenBalanceAsNumber) / 100
    form.setFieldValue("send", amount.toString())
    form.validateAllFields("change")
    computeReceiveAmount()
  }

  const sliderValue = Math.min(
    Big(!isNaN(Number(send)) ? Number(send) : 0)
      .mul(100)
      .div(sendTokenBalanceAsNumber === 0 ? 1 : sendTokenBalanceAsNumber)
      .toNumber(),
    100,
  ).toFixed(0)

  return (
    <>
      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
          <form.Field name="bs">
            {(field) => (
              <CustomRadioGroup
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onValueChange={(e: BS) => {
                  field.handleChange(e)
                  computeReceiveAmount()
                }}
                disabled={!market}
              >
                {Object.values(TradeAction).map((action) => (
                  <CustomRadioGroupItem
                    key={action}
                    value={action}
                    id={action}
                    className="capitalize"
                  >
                    {action}
                  </CustomRadioGroupItem>
                ))}
              </CustomRadioGroup>
            )}
          </form.Field>

          <div className="space-y-4 !mt-6">
            <form.Field
              name="send"
              onChange={sendValidator(
                Number(
                  formatUnits(
                    sendTokenBalance?.balance?.balance || 0n,
                    sendTokenBalance?.balance?.token.decimals || 18,
                  ),
                ),
              )}
            >
              {(field) => (
                <EnhancedNumericInput
                  inputClassName="text-text-primary text-lg h-8"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeReceiveAmount()
                  }}
                  sendSliderValue={Number(sliderValue)}
                  setSendSliderValue={handleSliderChange}
                  balanceAction={{
                    onClick: () => {
                      field.handleChange(
                        formatUnits(
                          sendTokenBalance.balance?.balance || 0n,
                          sendToken?.decimals ?? 18,
                        ) || "0",
                      ),
                        computeReceiveAmount()
                    },
                  }}
                  token={sendToken}
                  label="Send amount"
                  disabled={
                    !market ||
                    formatUnits(
                      sendTokenBalance.balance?.balance ?? 0n,
                      sendToken?.decimals ?? 18,
                    ) === "0"
                  }
                  showBalance
                  error={field.state.meta.touchedErrors}
                />
              )}
            </form.Field>
            <form.Field name="receive" onChange={isGreaterThanZeroValidator}>
              {(field) => (
                <EnhancedNumericInput
                  inputClassName="text-text-primary text-lg h-8"
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
                  error={
                    field.state.value === "0" && hasEnoughVolume
                      ? [FIELD_ERRORS.insufficientVolume]
                      : field.state.meta.touchedErrors
                  }
                />
              )}
            </form.Field>

            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">
                Average market price
              </span>
              <span className="text-xs text-text-secondary">
                {avgPrice} {quote?.symbol}
              </span>
            </div>
            <Accordion
              title="Slippage tolerance"
              tooltip="Slippage tolerance"
              chevronValue={`${slippage}%`}
            >
              <form.Field name="slippage">
                {(field) => (
                  <div className="space-y-2 mt-1">
                    <div className="flex justify-around bg-bg-primary rounded-lg">
                      {slippageValues.map((value) => (
                        <Button
                          key={`percentage-button-${value}`}
                          variant={"secondary"}
                          size={"sm"}
                          className={cn(
                            "text-xs flex-1 bg-bg-primary border-none rounded-lg",
                            {
                              "opacity-10":
                                field.state.value !== Number(value) ||
                                showCustomInput,
                              "border-none bg-bg-tertiary rounded-lg":
                                field.state.value === Number(value) &&
                                !showCustomInput,
                            },
                          )}
                          onClick={(e) => {
                            e.preventDefault()
                            showCustomInput &&
                              setShowCustomInput(!showCustomInput)
                            field.handleChange(Number(value))
                          }}
                          disabled={!market}
                        >
                          {value}%
                        </Button>
                      ))}
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          setShowCustomInput(!showCustomInput)
                        }}
                        variant={"secondary"}
                        size={"sm"}
                        className={cn(
                          "text-xs flex-1 bg-bg-primary border-none rounded-lg",
                          {
                            "opacity-10": !showCustomInput,
                            "border-none bg-bg-tertiary rounded-lg":
                              showCustomInput,
                          },
                        )}
                      >
                        Custom
                      </Button>
                    </div>
                    {/* Render the custom input component */}
                    {showCustomInput && (
                      <CustomInput
                        symbol={"%"}
                        maxLength={2}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={({ target: { value } }) => {
                          if (value.length > 2) return

                          // field.handleChange(Number(value))
                        }}
                      />
                    )}
                  </div>
                )}
              </form.Field>
            </Accordion>

            <MarketDetails takerFee={feeInPercentageAsString} />

            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.values.bs,
              ]}
            >
              {([canSubmit, isSubmitting, tradeAction]) => {
                return (
                  <Button
                    className="w-full flex items-center justify-center !mb-4 capitalize !mt-6"
                    size={"lg"}
                    type="submit"
                    disabled={!canSubmit || !market}
                  >
                    {isSubmitting ? "Processing..." : tradeAction}
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>
        </form>
      </form.Provider>
      {formData && (
        <FromWalletMarketOrderDialog
          form={{ ...formData, estimatedFee: feeInPercentageAsString }}
          onClose={() => setFormData(undefined)}
        />
      )}
    </>
  )
}
