import { BS } from "@mangrovedao/mgv/lib"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import React, { useCallback } from "react"
import { formatUnits, parseUnits } from "viem"
import { useAccount } from "wagmi"

import InfoTooltip from "@/components/info-tooltip-new"
import { EnhancedNumericInput } from "@/components/token-input-new"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { getExactWeiAmount } from "@/utils/regexp"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import { useLimit } from "./hooks/use-limit"
import type { Form } from "./types"
import {
  isGreaterThanZeroValidator,
  sendValidator,
  sendVolumeValidator,
} from "./validators"

const sliderValues = [25, 50, 75]

export function Limit() {
  const { isConnected } = useAccount()
  const [formData, setFormData] = React.useState<Form>()
  const [sendSliderValue, setSendSliderValue] = React.useState(0)
  const [side, setSide] = React.useState<BS>(BS.buy)

  const { currentMarket } = useMarket()
  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    handleSubmit,
    form,
    sendToken,
    receiveToken,
    quoteToken,
    timeInForce,
    send,
    minVolume,
    sendLogics,
    receiveLogics,
    sendTokenBalanceFormatted,
    receiveTokenBalanceFormatted,
    minVolumeFormatted,
    isWrapping,
    sendBalanceWithEth,
    ethBalance,
    getAllErrors,
  } = useLimit({
    onSubmit: (formData) => setFormData(formData),
    bs: side,
  })

  const handleSliderChange = (value: number) => {
    if (!sendBalanceWithEth) return
    const amount =
      (BigInt(value * 100) *
        parseUnits(sendBalanceWithEth.toString(), sendToken?.decimals || 18)) /
      10_000n
    setSendSliderValue(value)
    form.setFieldValue("send", formatUnits(amount, sendToken?.decimals ?? 18))
    form.validateAllFields("change")
    if (!form.state.values.limitPrice) {
      form.setFieldValue("receive", "")
      return
    }
    computeReceiveAmount()
  }

  const handleSwapDirection = () => {
    const newSide = side === BS.buy ? BS.sell : BS.buy
    setSide(newSide)

    setSendSliderValue(0)

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
              onChange={
                Number(sendBalanceWithEth) === 0
                  ? sendValidator(Number(sendBalanceWithEth))
                  : sendVolumeValidator(
                      sendBalanceWithEth,
                      Number(
                        Number(minVolumeFormatted).toFixed(
                          sendToken?.displayDecimals || 18,
                        ),
                      ),
                      sendToken?.symbol || "",
                    )
              }
            >
              {(field) => (
                <>
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={({ target: { value } }) => {
                      field.handleChange(value)
                      computeReceiveAmount()
                    }}
                    inputClassName="text-text-primary text-lg h-8"
                    balanceAction={{
                      onClick: () => {
                        field.handleChange(sendBalanceWithEth.toString())
                        computeReceiveAmount()
                      },
                    }}
                    isWrapping={isWrapping}
                    token={sendToken}
                    customBalance={sendBalanceWithEth.toString()}
                    label="Pay"
                    disabled={
                      !currentMarket || sendBalanceWithEth.toString() === "0"
                    }
                    showBalance
                    error={
                      getAllErrors().send
                        ? [getAllErrors().send].flat()
                        : undefined
                    }
                  />
                </>
              )}
            </form.Field>

            <div className="flex justify-center -my-2">
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
                    className="h-8 w-8 p-0 rounded-full bg-background-secondary hover:bg-background-secondary/80 flex items-center justify-center relative overflow-hidden"
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
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeSendAmount()
                  }}
                  token={receiveToken}
                  inputClassName="text-text-primary text-lg h-8"
                  label="Receive"
                  disabled={!(currentMarket && form.state.isFormValid)}
                  error={
                    getAllErrors().receive
                      ? [getAllErrors().receive].flat()
                      : undefined
                  }
                  customBalance={receiveTokenBalanceFormatted}
                />
              )}
            </form.Field>

            <form.Field name="limitPrice" onChange={isGreaterThanZeroValidator}>
              {(field) => (
                <EnhancedNumericInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  inputClassName="text-text-primary text-lg h-8"
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    computeReceiveAmount()
                  }}
                  token={quoteToken}
                  label="When price at or below"
                  disabled={!currentMarket}
                  error={
                    getAllErrors().limitPrice
                      ? [getAllErrors().limitPrice].flat()
                      : undefined
                  }
                />
              )}
            </form.Field>

            {/* slider section */}

            <div className="py-4">
              {/* Slider */}
              <Slider
                disabled={!currentMarket}
                value={[sendSliderValue || 0]}
                onValueChange={(values) => {
                  setSendSliderValue?.(values[0] || 0)
                }}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex space-x-2 mt-4">
                {sliderValues.map((value, i) => (
                  <Button
                    key={`percentage-button-${value}`}
                    variant={"secondary"}
                    size={"md"}
                    disabled={!currentMarket}
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
                  disabled={!currentMarket}
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
            </div>

            {sendToken?.symbol.includes("ETH") &&
              ethBalance?.value &&
              ethBalance.value > 0n && (
                <form.Field name="isWrapping">
                  {(field) => (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center text-muted-foreground text-xs font-sans">
                        Use ETH balance
                        <InfoTooltip className="text-text-quaternary text-sm size-[12px] cursor-pointer">
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
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Switch
                          className="data-[state=checked]:bg-bg-tertiary data-[state=checked]:text-text-primary h-4 w-8"
                          checked={isWrapping}
                          onClick={() => field.handleChange(!isWrapping)}
                        />
                        {/* <Checkbox
                            className="border-border-primary data-[state=checked]:bg-bg-tertiary data-[state=checked]:text-text-primary"
                            checked={isWrapping}
                            onClick={() => field.handleChange(!isWrapping)}
                          /> */}
                      </div>
                    </div>
                  )}
                </form.Field>
              )}

            <div className="grid space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs font-sans">
                  Minimum volume
                </span>
                {Number(minVolumeFormatted) == 0 ? (
                  <Skeleton className="w-16 h-4" />
                ) : (
                  <span className="text-xs text-text-secondary">
                    {Number(minVolumeFormatted).toFixed(
                      sendToken?.displayDecimals || 18,
                    )}{" "}
                    {sendToken?.symbol}
                  </span>
                )}
              </div>
            </div>
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
                        "rounded-sm w-full flex items-center justify-center capitalize bg-bg-tertiary hover:bg-bg-secondary",
                      )}
                      size={"lg"}
                      type="submit"
                      disabled={
                        !state.canSubmit || !currentMarket || !isConnected
                      }
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
        <FromWalletLimitOrderDialog
          form={{
            ...formData,
            minVolume: minVolumeFormatted,
            totalWrapping:
              Number(formData.send) >
              Number(
                formatUnits(
                  sendTokenBalance?.balance || 0n,
                  sendToken?.decimals ?? 18,
                ),
              )
                ? Number(formData.send) -
                  Number(
                    formatUnits(
                      sendTokenBalance?.balance || 0n,
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
