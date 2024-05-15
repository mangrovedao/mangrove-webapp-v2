import React from "react"

import {
  CustomRadioGroup,
  CustomRadioGroupItem,
} from "@/components/custom-radio-group"
import InfoTooltip from "@/components/info-tooltip"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
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
import useMarket from "@/providers/market.new"
import { cn } from "@/utils"
import { Order } from "@mangrovedao/mgv/lib"
import { formatUnits } from "viem"
import { useAccount } from "wagmi"
import { Accordion } from "../components/accordion"
import { TradeAction } from "../enums"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import SourceIcon from "./components/source-icon"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import { useLimit } from "./hooks/use-limit"
import type { Form } from "./types"
import { isGreaterThanZeroValidator, sendVolumeValidator } from "./validators"

const sliderValues = [25, 50, 75, 100]

export function Limit() {
  const [formData, setFormData] = React.useState<Form>()
  const { currentMarket } = useMarket()
  const {
    computeReceiveAmount,
    computeSendAmount,
    sendTokenBalance,
    receiveTokenBalance,
    handleSubmit,
    form,
    quoteToken,
    sendToken,
    receiveToken,
    tickSize,
    feeInPercentageAsString,
    timeInForce,
    send,
    sendFrom,
    receiveTo,
    spotPrice,
    logics,
    selectedSource,
    minVolume,
    sendLogics,
    receiveLogics,
    sendTokenBalanceFormatted,
    receiveTokenBalanceFormatted,
    minVolumeFormatted,
  } = useLimit({
    onSubmit: (formData) => setFormData(formData),
  })

  const { address } = useAccount()

  // const { sendFromLogics, receiveToLogics, sendFromBalance, receiveToBalance } =
  //   liquiditySourcing({
  //     sendToken,
  //     sendFrom,
  //     receiveTo,
  //     receiveToken,
  //     fundOwner: address,
  //     logics,
  //   })

  const handleSliderChange = (value: number) => {
    if (!sendTokenBalance) return
    const amount = (BigInt(value * 100) * sendTokenBalance.balance) / 10_000n
    form.setFieldValue(
      "send",
      formatUnits(amount, sendTokenBalance.token.decimals),
    )
    form.validateAllFields("change")
    if (!form.state.values.limitPrice) {
      form.setFieldValue("receive", "")
      return
    }
    computeReceiveAmount()
  }

  const sliderValue = Math.min(
    Number(send) /
      (sendTokenBalance
        ? Number(
            formatUnits(
              sendTokenBalance?.balance,
              sendTokenBalance?.token.decimals,
            ),
          )
        : 1),
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
                  disabled={!currentMarket}
                  error={field.state.meta.errors}
                />
              )}
            </form.Field>
            <div className="flex justify-between space-x-2 pt-2">
              <form.Field name="sendFrom">
                {(field) => (
                  <div className="flex flex-col w-full">
                    <Label className="flex items-center">
                      Send from
                      <InfoTooltip>
                        <Caption>Select the origin of the assets</Caption>
                      </InfoTooltip>
                    </Label>

                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value: string) => {
                        field.handleChange(value)
                      }}
                      disabled={!currentMarket}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sendLogics?.map(
                            (source) =>
                              source && (
                                <SelectItem
                                  key={source.logic.name}
                                  value={source.logic.name}
                                >
                                  <div className="flex gap-2 w-full items-center">
                                    <SourceIcon sourceId={source.logic.name} />
                                    <Caption className="capitalize">
                                      {source.logic.name.toUpperCase()}
                                    </Caption>
                                  </div>
                                </SelectItem>
                              ),
                          )}
                          {/* Wallet */}
                          <SelectItem key="simple" value="simple">
                            <div className="flex gap-2 w-full items-center">
                              <SourceIcon sourceId={"simple"} />
                              <Caption className="capitalize">Wallet</Caption>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field name="receiveTo">
                {(field) => (
                  <div className="flex flex-col w-full z-50">
                    <Label className="flex items-center">
                      Receive to
                      <InfoTooltip className="ml-2" side="left">
                        <div>
                          <Caption>
                            Select the destination of the assets
                          </Caption>

                          <Caption>(after the trade is executed)</Caption>
                        </div>
                      </InfoTooltip>
                    </Label>

                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(value: string) => {
                        field.handleChange(value)
                      }}
                      disabled={!currentMarket}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {receiveLogics?.map(
                            (source) =>
                              source && (
                                <SelectItem
                                  key={source.logic.name}
                                  value={source.logic.name}
                                >
                                  <div className="flex gap-2 w-full items-center">
                                    <SourceIcon sourceId={source.logic.name} />
                                    <Caption className="capitalize">
                                      {source.logic.name.toUpperCase()}
                                    </Caption>
                                  </div>
                                </SelectItem>
                              ),
                          )}
                          {/* Wallet */}
                          <SelectItem key="simple" value="simple">
                            <div className="flex gap-2 w-full items-center">
                              <SourceIcon sourceId={"simple"} />
                              <Caption className="capitalize">Wallet</Caption>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
            <form.Field
              name="send"
              onChange={sendVolumeValidator(
                Number(
                  formatUnits(
                    sendTokenBalance?.balance || 0n,
                    sendTokenBalance?.token.decimals || 18,
                  ),
                ),
                Number(
                  formatUnits(
                    minVolume ?? 0n,
                    sendTokenBalance?.token.decimals || 18,
                  ),
                ),
              )}
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
                  minimumVolume={formatUnits(
                    minVolume,
                    sendToken?.decimals || 18,
                  )}
                  volumeAction={{
                    onClick: () => {
                      field.handleChange(minVolumeFormatted),
                        computeReceiveAmount()
                    },
                  }}
                  balanceAction={{
                    onClick: () => {
                      field.handleChange(sendTokenBalanceFormatted),
                        computeReceiveAmount()
                    },
                  }}
                  token={sendToken}
                  customBalance={sendTokenBalanceFormatted}
                  label="Send amount"
                  disabled={!currentMarket || sendTokenBalanceFormatted === "0"}
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
                  disabled={!(currentMarket && form.state.isFormValid)}
                  error={field.state.meta.touchedErrors}
                  showBalance
                  customBalance={receiveTokenBalanceFormatted}
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
                disabled={!(currentMarket && form.state.isFormValid)}
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
                    disabled={!currentMarket}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>
            <Separator className="!my-6" />

            <Accordion title="Advanced">
              <form.Field name="orderType">
                {(field) => {
                  return (
                    <div className="grid text-md space-y-2">
                      <Label>Time in force</Label>
                      <Select
                        name={field.name}
                        value={field.state.value.toString()}
                        onValueChange={(value) => {
                          field.handleChange(Number(value))
                        }}
                        disabled={!currentMarket}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time in force" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Object.values(Order).map((timeInForce) => (
                              <SelectItem
                                key={timeInForce}
                                value={timeInForce.toString()}
                              >
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
                      disabled={!(currentMarket && form.state.isFormValid)}
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
                      disabled={!currentMarket}
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

            {/* <MarketDetails
              minVolume={minVolume}
              takerFee={feeInPercentageAsString}
              tickSize={tickSize}
              spotPrice={spotPrice}
            /> */}

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
                    disabled={!canSubmit || !currentMarket}
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
          form={{ ...formData, selectedSource: selectedSource, minVolume }}
          onClose={() => setFormData(undefined)}
        />
      )}
    </>
  )
}
