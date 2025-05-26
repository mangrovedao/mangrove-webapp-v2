import { BS } from "@mangrovedao/mgv/lib"
import Big from "big.js"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Address, formatUnits } from "viem"
import { useAccount, useBalance } from "wagmi"

import { CustomInput } from "@/components/custom-input-new"
import InfoTooltip from "@/components/info-tooltip-new"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useDollarConversion } from "@/hooks/use-dollar-conversion"
import useMarket from "@/providers/market"
import { useDisclaimerDialog } from "@/stores/disclaimer-dialog.store"
import { cn } from "@/utils"
import { getExactWeiAmount } from "@/utils/regexp"
import { EnhancedNumericInput } from "@components/token-input-new"
import { useTradeFormStore } from "../../forms/store"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import { useTradeInfos } from "../hooks/use-trade-infos"
import { useMarketForm } from "./hooks/use-market"
import { useMarketTransaction } from "./hooks/use-market-transaction"
import { type Form } from "./types"
import { isGreaterThanZeroValidator, sendValidator } from "./validators"

// Reuse the wethAdresses from the dialog
export const wethAdresses: { [key: number]: Address | undefined } = {
  168587773: "0x4200000000000000000000000000000000000023",
  81457: "0x4300000000000000000000000000000000000004",
  42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
}

const slippageValues = ["0.5", "1", "2"]
const sliderValues = [25, 50, 75]

export function Market() {
  const { isConnected, address } = useAccount()
  const { data: ethBalance } = useBalance({
    address,
  })
  const [formData, setFormData] = React.useState<Form>()
  const [showCustomInput, setShowCustomInput] = React.useState(false)
  const [sendSliderValue, setSendSliderValue] = useState(0)
  const { checkAndShowDisclaimer } = useDisclaimerDialog()

  // Get and set shared state
  const { payAmount, setPayAmount, tradeSide, setTradeSide } =
    useTradeFormStore()

  // Track if the component is mounted
  const isMounted = useRef(false)

  // Track if we've initialized from the shared state
  const initializedFromSharedState = useRef(false)

  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    form,
    market,
    sendToken,
    receiveToken,
    quote,
    avgPrice,
    feeInPercentageAsString,
    isWrapping,
    slippage,
    getAllErrors,
    maxTickEncountered,
  } = useMarketForm({
    onSubmit: (formData) => setFormData(formData),
    bs: tradeSide,
  })

  console.log(sendToken)

  // Registry and trade infos
  const { baseToken } = useTradeInfos("market", tradeSide)

  // Use the transaction hook
  const {
    isButtonLoading,
    onSubmit,
    getButtonText: getTransactionButtonText,
    marketOrderSteps,
  } = useMarketTransaction({
    form,
    tradeSide,
    maxTickEncountered: maxTickEncountered ?? 0n,
    sendToken,
    baseToken,
    sendTokenBalance,
    isWrapping,
    onTransactionSuccess: () => {
      // Reset form state after successful transaction
      form.reset()
      setSendSliderValue(0)
      setFormData(undefined)
    },
  })

  const { currentMarket } = useMarket()

  const { payDollar, receiveDollar } = useDollarConversion({
    payAmount: form.state.values.send,
    receiveAmount: form.state.values.receive,
    tradeSide,
  })

  // Initialize form with shared pay amount when component mounts or when switching tabs
  useEffect(() => {
    if (!isMounted.current || initializedFromSharedState.current) return

    // Only set the value if payAmount exists and is meaningful
    if (payAmount && form && form.setFieldValue && payAmount !== "0") {
      form.setFieldValue("send", payAmount)
      initializedFromSharedState.current = true
      computeReceiveAmount()
    }
  }, [payAmount, form, computeReceiveAmount])

  // Update shared state when form values change
  useEffect(() => {
    if (!isMounted.current) return

    const currentSendValue = form.state.values.send
    if (
      currentSendValue &&
      currentSendValue !== payAmount &&
      currentSendValue !== "0"
    ) {
      setPayAmount(currentSendValue)
    }
  }, [form.state.values.send, setPayAmount, payAmount])

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
    if (!sendBalanceWithEth || !sendToken) return

    try {
      setSendSliderValue(value)

      const amount = Big(value).div(100).mul(sendBalanceWithEth)

      const decimals = sendToken.priceDisplayDecimals || 18
      // Set the field value without calling validateAllFields
      const safeAmount = Math.min(amount.toNumber(), sendBalanceWithEth)
      form.setFieldValue("send", safeAmount.toFixed(decimals).toString())

      // Compute receive amount will indirectly validate the form
      computeReceiveAmount()
    } catch (error) {
      console.error("Error in slider change:", error)
    }
  }

  // Update slider value when form.state.values.send changes
  useEffect(() => {
    if (!sendBalanceWithEth || sendBalanceWithEth === 0) return

    try {
      const currentSendValue = Number(form.state.values.send || 0)
      const newSliderValue = Math.min(
        (currentSendValue / sendBalanceWithEth) * 100,
        100,
      )

      // Only update if the difference is significant to avoid infinite loops
      if (Math.abs(newSliderValue - sendSliderValue) > 1) {
        setSendSliderValue(newSliderValue)
      }
    } catch (error) {
      console.error("Error updating slider value:", error)
    }
  }, [form.state.values.send, sendBalanceWithEth])

  const handleSwapDirection = () => {
    try {
      // Toggle between buy and sell
      const newSide = tradeSide === BS.buy ? BS.sell : BS.buy

      // Update the shared state
      setTradeSide(newSide)

      // Reset slider value
      setSendSliderValue(0)

      // Keep the current pay amount in the shared state
      const currentPayAmount = form.state.values.send

      // Clear receive value but keep the pay amount
      if (form && form.setFieldValue) {
        form.setFieldValue("receive", "")

        // Recompute the receive amount if we have a pay amount
        if (currentPayAmount) {
          setTimeout(() => {
            computeReceiveAmount()
          }, 0)
        }
      }
    } catch (error) {
      console.error("Error in swap direction:", error)
    }
  }

  // Get button text based on transaction state
  const getButtonText = () => {
    const allErrors = getAllErrors()
    return getTransactionButtonText({
      isConnected,
      errors: allErrors,
      tradeSide,
      needsApproval: marketOrderSteps ? !marketOrderSteps[0].done : undefined,
    })
  }

  // Button disabled state
  const isButtonDisabled =
    !form.state.canSubmit ||
    Object.keys(getAllErrors()).length > 0 ||
    isButtonLoading ||
    !isConnected ||
    !sendToken ||
    !baseToken

  return (
    <div className="flex flex-col h-full">
      <form.Provider>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()

            if (!isConnected) {
              toast.error("Please connect your wallet")
              return
            }
            if (!sendToken || !baseToken) {
              toast.error("Token information is missing")
              return
            }

            // Check disclaimer acceptance first
            if (checkAndShowDisclaimer(address)) return

            // Validate the form before proceeding
            void form.handleSubmit().then(() => {
              if (form.state.isFormValid) {
                // Call the onSubmit from useMarketTransaction
                // which will handle all the appropriate actions based on the current state:
                // - If approval is needed, it will call handleApprove()
                // - If ETH wrapping is needed, it will call handleWrapEth()
                // - Otherwise, it will call handlePostOrder()
                onSubmit(e)
              }
            })
          }}
          autoComplete="off"
          className="flex flex-col h-full"
        >
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            <form.Field
              name="send"
              onChange={sendValidator(sendBalanceWithEth)}
            >
              {(field) => (
                <EnhancedNumericInput
                  inputClassName="text-text-primary text-base h-7"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  dollarAmount={payDollar}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    // We don't need to update the shared state here anymore
                    // as it's handled by the useEffect
                    computeReceiveAmount()
                  }}
                  balanceAction={{
                    onClick: () => {
                      field.handleChange(sendBalanceWithEth.toString() || "0")
                      setSendSliderValue(100)
                      computeReceiveAmount()
                    },
                  }}
                  token={sendToken}
                  label="Pay"
                  disabled={!market}
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

            <div className="flex justify-center -my-1.5">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-background-secondary hover:bg-background-secondary/80 flex items-center justify-center relative overflow-hidden"
                    onClick={handleSwapDirection}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            <form.Field name="receive" onChange={isGreaterThanZeroValidator}>
              {(field) => (
                <EnhancedNumericInput
                  inputClassName="text-text-primary text-base h-7"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeSendAmount()
                  }}
                  dollarAmount={receiveDollar}
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

            {/* slider section */}
            <div className="py-3">
              {/* Slider */}
              <div className="px-2">
                <Slider
                  disabled={!market || sendBalanceWithEth === 0}
                  value={[sendSliderValue || 0]}
                  onValueChange={(values) => {
                    handleSliderChange(values[0] || 0)
                  }}
                  max={100}
                  step={1}
                  className="z-50"
                />
              </div>
              <div className="flex space-x-2 mt-4">
                {sliderValues.map((value, i) => (
                  <Button
                    key={`percentage-button-${value}`}
                    variant={"secondary"}
                    size={"md"}
                    disabled={!market || sendBalanceWithEth === 0}
                    className={cn(
                      "!h-5 text-xs w-full !rounded-md flex items-center justify-center border-none flex-1",
                      {
                        "bg-bg-tertiary text-black-rich":
                          Math.abs(sendSliderValue - value) < 1,
                      },
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      handleSliderChange(Number(value))
                    }}
                  >
                    {value}%
                  </Button>
                ))}
                <Button
                  key={`percentage-button-max`}
                  variant={"secondary"}
                  size={"md"}
                  disabled={!market || sendBalanceWithEth === 0}
                  className={cn(
                    "!h-5 text-xs w-full !rounded-md flex items-center justify-center border-none flex-1",
                    {
                      "bg-bg-tertiary text-black-rich":
                        Math.abs(sendSliderValue - 100) < 1,
                    },
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    handleSliderChange(100)
                  }}
                >
                  Max
                </Button>
              </div>
            </div>
            {sendToken?.symbol.includes("ETH") &&
              ethBalance?.value &&
              ethBalance.value > 0n && (
                <form.Field name="isWrapping">
                  {(field) => (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-muted-foreground text-xs font-sans">
                        Use ETH balance
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Switch
                          checked={isWrapping}
                          onClick={() => field.handleChange(!isWrapping)}
                        />
                        <InfoTooltip className="text-text-quaternary text-xs size-4 cursor-pointer">
                          <span className="text-xs font-sans">
                            Will add a wrap ETH to wETH step during transaction
                            ({" "}
                            <span>
                              {getExactWeiAmount(
                                formatUnits(
                                  ethBalance?.value ?? 0n,
                                  ethBalance?.decimals ?? 18,
                                ),
                                3,
                              )}{" "}
                              ETH
                            </span>
                            )
                          </span>
                        </InfoTooltip>
                      </div>
                    </div>
                  )}
                </form.Field>
              )}

            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">
                Average market price
              </span>
              <span className="text-xs text-text-secondary">
                {avgPrice} {quote?.symbol}
              </span>
            </div>

            <MarketDetails takerFee={feeInPercentageAsString} />

            <Accordion
              title="Slippage tolerance"
              tooltip="How much price slippage you're willing to accept so that your order can be executed"
              chevronValue={`${slippage}%`}
            >
              <form.Field name="slippage">
                {(field) => (
                  <div className="space-y-2 mt-1">
                    <div className="flex justify-around bg-bg-primary rounded-sm">
                      {slippageValues.map((value) => (
                        <Button
                          key={`percentage-button-${value}`}
                          variant={"secondary"}
                          size={"sm"}
                          className={cn(
                            "text-xs flex-1 bg-bg-primary border-none rounded-sm",
                            {
                              "opacity-60":
                                field.state.value !== Number(value) ||
                                showCustomInput,
                              "border-none bg-bg-tertiary rounded-sm text-black-rich":
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
                          "text-xs flex-1 bg-bg-primary border-none rounded-sm",
                          {
                            "opacity-60": !showCustomInput,
                            "border-none bg-bg-tertiary rounded-sm text-black-rich":
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
          </div>

          <div className="mt-auto pt-3 border-t border-border-primary">
            <Button
              className={cn(
                "w-full flex rounded-sm tems-center justify-center bg-bg-blush-pearl hover:bg-bg-blush-pearl capitalize text-black-rich",
              )}
              size={"md"}
              type="submit"
              disabled={isButtonDisabled}
              loading={isButtonLoading}
            >
              {getButtonText()}
            </Button>
          </div>
        </form>
      </form.Provider>
    </div>
  )
}
