import { BS } from "@mangrovedao/mgv/lib"
import Big from "big.js"
import React from "react"
import { formatUnits } from "viem"

import { CustomInput } from "@/components/custom-input-new"
import InfoTooltip from "@/components/info-tooltip"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/utils"
import { FIELD_ERRORS } from "@/utils/form-errors"
import { getExactWeiAmount } from "@/utils/regexp"
import { EnhancedNumericInput } from "@components/token-input-new"
import { useAccount, useBalance } from "wagmi"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import FromWalletMarketOrderDialog from "./components/from-wallet-order-dialog"
import { useMarketForm } from "./hooks/use-market"
import { type Form } from "./types"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

const slippageValues = ["0.1", "0.5", "1"]

export function Market(props: { bs: BS }) {
  const { isConnected, address } = useAccount()
  const { data: ethBalance } = useBalance({
    address,
  })
  const [formData, setFormData] = React.useState<Form>()
  const [showCustomInput, setShowCustomInput] = React.useState(false)

  const {
    computeReceiveAmount,
    computeSendAmount,
    handleSubmit,
    sendTokenBalance,
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
    isWrapping,
    slippage,
  } = useMarketForm({
    onSubmit: (formData) => setFormData(formData),
    bs: props.bs,
  })

  const sendBalanceWithEth = isWrapping
    ? Number(
        formatUnits(
          sendTokenBalance.balance?.balance || 0n,
          sendToken?.decimals ?? 18,
        ),
      ) +
      Number(formatUnits(ethBalance?.value ?? 0n, ethBalance?.decimals ?? 18))
    : Number(
        formatUnits(
          sendTokenBalance.balance?.balance || 0n,
          sendToken?.decimals ?? 18,
        ),
      )

  const handleSliderChange = (value: number) => {
    const amount = (value * sendBalanceWithEth) / 100
    form.setFieldValue("send", amount.toString())
    form.validateAllFields("change")
    computeReceiveAmount()
  }

  const sliderValue = Math.min(
    Big(!isNaN(Number(send)) ? Number(send) : 0)
      .mul(100)
      .div(sendBalanceWithEth === 0 ? 1 : sendBalanceWithEth)
      .toNumber(),
    100,
  )

  return (
    <>
      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-4 !mt-6">
            <form.Field
              name="send"
              onChange={sendValidator(sendBalanceWithEth)}
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
                  sendSliderValue={sliderValue}
                  setSendSliderValue={handleSliderChange}
                  balanceAction={{
                    onClick: () => {
                      field.handleChange(sendBalanceWithEth.toString() || "0")
                      computeReceiveAmount()
                    },
                  }}
                  token={sendToken}
                  label="Send amount"
                  disabled={!market || sendBalanceWithEth.toString() === "0"}
                  customBalance={
                    isWrapping ? sendBalanceWithEth.toString() : undefined
                  }
                  showBalance
                  error={
                    !isWrapping &&
                    Number(field.state.value) >
                      Number(
                        formatUnits(
                          sendTokenBalance.balance?.balance || 0n,
                          sendToken?.decimals ?? 18,
                        ),
                      )
                      ? [FIELD_ERRORS.insufficientBalance]
                      : field.state.meta.touchedErrors
                  }
                />
              )}
            </form.Field>

            {sendToken?.symbol.includes("ETH") && (
              <form.Field name="isWrapping">
                {(field) => (
                  <div className="flex justify-between items-center px-1 -mt-2">
                    <span className="flex items-center text-muted-foreground text-xs">
                      Use available ETH
                      <InfoTooltip className="text-text-quaternary text-sm">
                        Will add a wrap ETH step during transaction
                      </InfoTooltip>
                    </span>
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                      {getExactWeiAmount(
                        formatUnits(
                          ethBalance?.value ?? 0n,
                          ethBalance?.decimals ?? 18,
                        ),
                        3,
                      )}{" "}
                      ETH
                      <Checkbox
                        className="border-border-primary data-[state=checked]:bg-bg-tertiary data-[state=checked]:text-text-primary"
                        checked={isWrapping}
                        onClick={() => field.handleChange(!isWrapping)}
                      />
                    </div>
                  </div>
                )}
              </form.Field>
            )}

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
              tooltip="How much price slippage you're willing to accept so that your order can be executed"
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
                          field.handleChange(Number(value))
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
                    className={cn(
                      "w-full flex items-center justify-center !mb-4 capitalize !mt-6",
                      {
                        "bg-[#FF5555] hover:bg-[#ff6363]":
                          tradeAction === BS.sell,
                      },
                    )}
                    size={"lg"}
                    type="submit"
                    disabled={!canSubmit || !market || !isConnected}
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
          form={{
            ...formData,
            estimatedFee: feeInPercentageAsString,
            totalWrapping:
              Number(formData.send) >
              Number(
                formatUnits(
                  sendTokenBalance.balance?.balance || 0n,
                  sendToken?.decimals ?? 18,
                ),
              )
                ? Number(formData.send) -
                  Number(
                    formatUnits(
                      sendTokenBalance.balance?.balance || 0n,
                      sendToken?.decimals ?? 18,
                    ),
                  )
                : 0,
          }}
          onClose={() => setFormData(undefined)}
        />
      )}
    </>
  )
}
