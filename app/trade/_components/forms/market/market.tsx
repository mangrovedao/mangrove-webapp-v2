import { BS } from "@mangrovedao/mgv/lib"
import Big from "big.js"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp } from "lucide-react"
import React, { useCallback } from "react"
import { formatUnits } from "viem"

import { CustomInput } from "@/components/custom-input-new"
import InfoTooltip from "@/components/info-tooltip-new"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/utils"
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

export function Market() {
  const { isConnected, address } = useAccount()
  const { data: ethBalance } = useBalance({
    address,
  })
  const [formData, setFormData] = React.useState<Form>()
  const [showCustomInput, setShowCustomInput] = React.useState(false)

  const [side, setSide] = React.useState<BS>(BS.buy)
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
    getAllErrors,
  } = useMarketForm({
    onSubmit: (formData) => setFormData(formData),
    bs: side,
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

  const handleSwapDirection = () => {
    const newSide = side === BS.buy ? BS.sell : BS.buy
    setSide(newSide)

    form.setFieldValue("send", "")
    form.setFieldValue("receive", "")
  }

  return (
    <div className="flex flex-col h-full">
      <form.Provider>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="flex flex-col h-full"
        >
          <div className="space-y-2 flex-1 overflow-y-auto">
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
                  label="Pay"
                  disabled={!market || sendBalanceWithEth.toString() === "0"}
                  isWrapping={isWrapping}
                  customBalance={
                    isWrapping ? sendBalanceWithEth.toString() : undefined
                  }
                  showBalance
                  error={
                    getAllErrors().send
                      ? [getAllErrors().send].flat()
                      : undefined
                  }
                />
              )}
            </form.Field>

            <div className="flex justify-center -my-1">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full bg-background-secondary hover:bg-background-secondary/80 flex items-center justify-center relative overflow-hidden"
                  onClick={handleSwapDirection}
                >
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 1, y: 0 }}
                    whileHover={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, y: -10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </div>

            {sendToken?.symbol.includes("ETH") &&
              ethBalance?.value &&
              ethBalance.value > 0n && (
                <form.Field name="isWrapping">
                  {(field) => (
                    <div className="flex justify-between items-center px-1 -mt-2">
                      <div className="flex items-center text-muted-foreground text-xs">
                        Use ETH balance
                        <InfoTooltip className="text-text-quaternary text-sm">
                          Will add a wrap ETH to wETH step during transaction
                        </InfoTooltip>
                      </div>
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
                  inputClassName="text-text-primary text-sm h-8"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeSendAmount()
                  }}
                  token={receiveToken}
                  label="Receive"
                  disabled={!(market && form.state.isFormValid)}
                  error={
                    getAllErrors().receive
                      ? [getAllErrors().receive].flat()
                      : undefined
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

            {/* Advanced options accordion */}
            <Accordion title="Advanced options">
              <div className="pt-2">
                <span className="text-xs text-muted-foreground">
                  Additional settings for advanced users
                </span>
              </div>
            </Accordion>
          </div>

          <div className="mt-auto pt-4 border-t border-border-primary">
            <form.Subscribe
              selector={useCallback(
                (state: any) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                  tradeAction: state.values.bs,
                }),
                [],
              )}
            >
              {(state: any): React.ReactNode => {
                const allErrors = getAllErrors()

                return (
                  <>
                    <Button
                      className={cn(
                        "w-full flex items-center justify-center capitalize bg-bg-tertiary hover:bg-bg-secondary",
                      )}
                      size={"lg"}
                      type="submit"
                      disabled={!state.canSubmit || !market || !isConnected}
                      loading={!!state.isSubmitting}
                    >
                      {Object.keys(allErrors).length > 0 ? (
                        <span>
                          {Array.isArray(allErrors.send)
                            ? allErrors.send.join(", ")
                            : (allErrors.send as React.ReactNode)}
                        </span>
                      ) : (
                        state.tradeAction
                      )}
                    </Button>
                  </>
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
    </div>
  )
}
