import { BS } from "@mangrovedao/mgv/lib"
import React from "react"
import { formatUnits, parseUnits } from "viem"
import { useAccount } from "wagmi"

import InfoTooltip from "@/components/info-tooltip-new"
import { EnhancedNumericInput } from "@/components/token-input-new"
import { Caption } from "@/components/typography/caption"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select-new"
import { Skeleton } from "@/components/ui/skeleton"
import useMarket from "@/providers/market"
import { cn } from "@/utils"
import { enumKeys } from "@/utils/enums"
import { FIELD_ERRORS } from "@/utils/form-errors"
import { getExactWeiAmount } from "@/utils/regexp"
import { Accordion } from "../components/accordion"
import FromWalletLimitOrderDialog from "./components/from-wallet-order-dialog"
import SourceIcon from "./components/source-icon"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import { useLimit } from "./hooks/use-limit"
import type { Form } from "./types"
import {
  isGreaterThanZeroValidator,
  sendValidator,
  sendVolumeValidator,
} from "./validators"

export function Limit(props: { bs: BS }) {
  const { isConnected } = useAccount()
  const [formData, setFormData] = React.useState<Form>()
  const [sendSliderValue, setSendSliderValue] = React.useState(0)

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
  } = useLimit({
    onSubmit: (formData) => setFormData(formData),
    bs: props.bs,
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

  return (
    <>
      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-2 !mt-6">
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
                  label="Limit price"
                  disabled={!currentMarket}
                  error={field.state.meta.errors}
                />
              )}
            </form.Field>

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
                    // dollarAmount={"..."}
                    inputClassName="text-text-primary text-lg h-8"
                    sendSliderValue={sendSliderValue}
                    setSendSliderValue={handleSliderChange}
                    // minimumVolume={formatUnits(
                    //   minVolume,
                    //   sendToken?.decimals || 18,
                    // )}
                    // volumeAction={{
                    //   onClick: () => {
                    //     field.handleChange(minVolumeFormatted),
                    //       computeReceiveAmount()
                    //   },
                    // }}
                    balanceAction={{
                      onClick: () => {
                        field.handleChange(sendBalanceWithEth.toString()),
                          computeReceiveAmount()
                      },
                    }}
                    isWrapping={isWrapping}
                    token={sendToken}
                    customBalance={sendBalanceWithEth.toString()}
                    label="Send amount"
                    disabled={
                      !currentMarket || sendBalanceWithEth.toString() === "0"
                    }
                    showBalance
                    error={
                      !isWrapping &&
                      Number(field.state.value) >
                        Number(
                          formatUnits(
                            sendTokenBalance?.balance || 0n,
                            sendToken?.decimals ?? 18,
                          ),
                        )
                        ? [FIELD_ERRORS.insufficientBalance]
                        : field.state.meta.touchedErrors
                    }
                  />
                </>
              )}
            </form.Field>

            {sendToken?.symbol.includes("ETH") &&
              ethBalance?.value &&
              ethBalance.value > 0n && (
                <form.Field name="isWrapping">
                  {(field) => (
                    <div className="flex justify-between items-center px-1">
                      <span className="flex items-center text-muted-foreground text-xs">
                        Use ETH balance
                        <InfoTooltip className="text-text-quaternary text-sm">
                          Will add a wrap ETH to wETH step during transaction
                        </InfoTooltip>
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
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
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeSendAmount()
                  }}
                  token={receiveToken}
                  inputClassName="text-text-primary text-lg h-8"
                  label="Total"
                  disabled={!(currentMarket && form.state.isFormValid)}
                  error={field.state.meta.touchedErrors}
                  customBalance={receiveTokenBalanceFormatted}
                />
              )}
            </form.Field>
            <div className="grid space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
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

              <Accordion title="Liquidity sourcing">
                <div className="flex justify-between space-x-2 pt-2">
                  <form.Field name="sendFrom">
                    {(field) => (
                      <div className="flex flex-col w-full">
                        <Label className="flex items-center text-muted-foreground">
                          Send from
                          <InfoTooltip className="text-muted-foreground">
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
                              {/* {sendLogics?.map(
                                (source) =>
                                  source && (
                                    <SelectItem
                                      key={source.logic.name}
                                      value={source.logic.name}
                                    >
                                      <div className="flex gap-2 w-full items-center">
                                        <SourceIcon
                                          sourceId={source.logic.name}
                                        />
                                        <Caption className="capitalize">
                                          {source.logic.name.toUpperCase()}
                                        </Caption>
                                      </div>
                                    </SelectItem>
                                  ),
                              )} */}
                              <SelectItem key="simple" value="simple">
                                <div className="flex gap-2 w-full items-center">
                                  <SourceIcon sourceId={"simple"} />
                                  <Caption className="capitalize">
                                    Wallet
                                  </Caption>
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
                        <Label className="flex items-center text-muted-foreground">
                          Receive to
                          <InfoTooltip className="ml-2 text-muted-foreground">
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
                              {/* {receiveLogics?.map(
                                (source) =>
                                  source && (
                                    <SelectItem
                                      key={source.logic.name}
                                      value={source.logic.name}
                                    >
                                      <div className="flex gap-2 w-full items-center">
                                        <SourceIcon
                                          sourceId={source.logic.name}
                                        />
                                        <Caption className="capitalize">
                                          {source.logic.name.toUpperCase()}
                                        </Caption>
                                      </div>
                                    </SelectItem>
                                  ),
                              )} */}
                              <SelectItem key="simple" value="simple">
                                <div className="flex gap-2 w-full items-center">
                                  <SourceIcon sourceId={"simple"} />
                                  <Caption className="capitalize">
                                    Wallet
                                  </Caption>
                                </div>
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                </div>
              </Accordion>

              <Accordion title="Time in force">
                <form.Field name="timeInForce">
                  {(field) => {
                    return (
                      <div className="grid text-md space-y-2 mt-2">
                        <Select
                          name={field.name}
                          value={field.state.value.toString()}
                          onValueChange={(value) => {
                            field.handleChange(Number(value))
                          }}
                          disabled={!currentMarket}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time in force" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {enumKeys(TimeInForce).map((timeInForce) => (
                                <SelectItem
                                  key={timeInForce}
                                  value={TimeInForce[timeInForce].toString()}
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
                    hidden:
                      timeInForce !== TimeInForce.GTC &&
                      timeInForce !== TimeInForce.PO,
                  })}
                >
                  <form.Field
                    name="timeToLive"
                    onChange={isGreaterThanZeroValidator}
                  >
                    {(field) => (
                      <EnhancedNumericInput
                        className="h-10 py-0"
                        inputClassName="h-full text-sm"
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
                                  className="hover:bg-bg-secondary active:bg-bg-secondary focus:bg-bg-secondary"
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
            </div>

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
                    className={cn(
                      "w-full flex items-center justify-center !mb-4 capitalize !mt-6",
                      {
                        "bg-[#FF5555] hover:bg-[#ff6363]":
                          tradeAction === BS.sell,
                      },
                    )}
                    size={"lg"}
                    disabled={!canSubmit || !currentMarket || !isConnected}
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
    </>
  )
}
