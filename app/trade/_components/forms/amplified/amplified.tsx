import React from "react"

import InfoTooltip from "@/components/info-tooltip"
import { CustomBalance } from "@/components/stateful/token-balance/custom-balance"
import { TokenIcon } from "@/components/token-icon"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
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
import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/utils"
import Big from "big.js"
import { Plus, WalletIcon } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { Accordion } from "../components/accordion"
import FromWalletAmplifiedOrderDialog from "./components/from-wallet-order-dialog"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import liquiditySourcing from "./hooks/liquidity-sourcing"
import { useAmplified } from "./hooks/use-amplified"
import type { Form } from "./types"
import {
  isGreaterThanZeroValidator,
  isSelected,
  sendValidator,
} from "./validators"

const sliderValues = [25, 50, 75, 100]

export function Amplified() {
  const [formData, setFormData] = React.useState<Form>()
  const {
    handleSubmit,
    computeReceiveAmount,
    form,
    market,
    timeInForce,
    sendSource,
    sendToken,
    sendAmount,
    selectedToken,
    selectedSource,
    firstAsset,
    secondAsset,
    firstAssetToken,
    secondAssetToken,
    logics,
    availableTokens,
    currentTokens,
  } = useAmplified({
    onSubmit: (formData) => setFormData(formData),
  })

  const { address } = useAccount()

  const { balanceLogic } = liquiditySourcing({
    sendToken: selectedToken,
    sendFrom: sendSource,
    fundOwner: address, //TODO check if fundowner changes if the liquidity sourcing is from a different wallet
    logics,
  })
  const { formatted } = useTokenBalance(selectedToken)

  const balanceLogic_temporary = selectedToken?.id.includes("WBTC")
    ? formatted
    : balanceLogic?.formatted

  const selectedTokens = [firstAssetToken, secondAssetToken]

  const handleSliderChange = (value: number) => {
    const amount = (value * Number(balanceLogic_temporary)) / 100
    form.setFieldValue("sendAmount", amount.toString())
    form.validateAllFields("change")

    if (currentTokens.length > 1) {
      if (
        !form.state.values["firstAsset"].limitPrice ||
        !form.state.values["secondAsset"].limitPrice
      ) {
        return
      }
    } else {
      if (!form.state.values["firstAsset"].limitPrice) {
        return
      }
    }

    computeReceiveAmount("firstAsset")
    computeReceiveAmount("secondAsset")
  }

  const sendTokenBalanceAsBig = balanceLogic_temporary
    ? Big(Number(balanceLogic_temporary))
    : Big(0)

  const sliderValue = Math.min(
    Big(Number(sendAmount) ?? 0)
      .mul(100)
      .div(sendTokenBalanceAsBig.eq(0) ? 1 : sendTokenBalanceAsBig)
      .toNumber(),
    100,
  ).toFixed(0)

  return (
    <div className="grid space-y-2">
      <div className="flex items-center">
        <Text className="text-muted-foreground text-xs" variant={"text2"}>
          Place multiple limit orders using the same liquidity.
        </Text>
        <InfoTooltip>
          <Caption>
            The execution of one order will automatically update others
          </Caption>
          <Caption>
            if partially filled or cancel others if fully filled.{" "}
          </Caption>

          <Link
            className="text-primary underline"
            href={
              "https://docs.mangrove.exchange/general/web-app/trade/how-to-amplify-order"
            }
            target="_blank"
            rel="noreferrer"
          >
            Learn more
          </Link>
        </InfoTooltip>
      </div>

      <form.Provider>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="space-y-2 !mt-6">
            <Title variant={"title2"}> Liquidity sourcing</Title>
            <form.Field name="sendSource">
              {(field) => (
                <div className="flex flex-col">
                  <Caption variant={"caption1"} as={"label"}>
                    Send from
                  </Caption>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic.id.includes("simple")
                                      ? "Wallet"
                                      : logic.id.toUpperCase()}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <div className="flex gap-2">
              <form.Field
                name="sendAmount"
                onChange={sendValidator(Number(balanceLogic_temporary))}
              >
                {(field) => (
                  <EnhancedNumericInput
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                      computeReceiveAmount("firstAsset")
                      computeReceiveAmount("secondAsset")
                    }}
                    disabled={!market || !sendToken}
                    error={field.state.meta.errors}
                  />
                )}
              </form.Field>

              <form.Field name="sendToken">
                {(field) => (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market || !sendSource}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            <div className="flex space-x-3">
                              <TokenIcon symbol={token.symbol} />
                              <Text>{token.symbol}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            {selectedToken && (
              <CustomBalance
                token={selectedToken}
                balance={balanceLogic_temporary}
                label={"Balance"}
              />
            )}

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
                disabled={!(market && form.state.isFormValid) || !sendToken}
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
                      if (!sendToken) return
                      handleSliderChange(Number(value))
                    }}
                    disabled={!market}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>

            <div />

            <Caption variant={"caption1"} as={"label"}>
              Buy Asset #1
            </Caption>

            <div className="flex justify-between space-x-1">
              <form.Field name="firstAsset.token">
                {(field) => (
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market || !sendToken}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {currentTokens.map((token) => (
                          <SelectItem
                            key={token.id}
                            value={token.id}
                            disabled={selectedTokens.includes(token)}
                          >
                            <div className="flex space-x-3">
                              <TokenIcon symbol={token.symbol} />
                              <Text>{token.id}</Text>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </form.Field>
            </div>

            <form.Field
              name="firstAsset.limitPrice"
              onChange={isGreaterThanZeroValidator}
            >
              {(field) => (
                <EnhancedNumericInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={({ target: { value } }) => {
                    field.handleChange(value)
                    computeReceiveAmount("firstAsset")
                  }}
                  token={firstAssetToken}
                  label="Limit price"
                  disabled={
                    !(market && form.state.isFormValid) || !firstAsset.token
                  }
                  error={field.state.meta.touchedErrors}
                />
              )}
            </form.Field>

            <form.Field name="firstAsset.receiveTo">
              {(field) => (
                <div className="flex-col flex">
                  <Caption variant={"caption1"} as={"label"}>
                    Receive to
                  </Caption>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value: string) => {
                      field.handleChange(value)
                    }}
                    disabled={!market}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {logics.map(
                          (logic) =>
                            logic && (
                              <SelectItem key={logic.id} value={logic.id}>
                                <div className="flex space-x-3">
                                  <WalletIcon />
                                  <Text className="capitalize">
                                    {logic.id.includes("simple")
                                      ? "Wallet"
                                      : logic.id.toUpperCase()}
                                  </Text>
                                </div>
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {field.state.meta.touchedErrors.length ? (
                    <div>
                      <Caption className="text-red-600 text-xs">
                        Please select a valid option
                      </Caption>
                    </div>
                  ) : undefined}
                </div>
              )}
            </form.Field>
            <div className="flex justify-between !my-6">
              <span className="text-muted-foreground text-xs">
                Receiving amount
              </span>
              {firstAsset.amount ? (
                <span className="text-xs">
                  {Number(firstAsset.amount).toFixed(
                    firstAssetToken?.displayedDecimals,
                  )}{" "}
                  {firstAssetToken?.symbol}
                </span>
              ) : (
                "-"
              )}
            </div>

            {currentTokens.length > 1 && (
              <>
                <div className="flex items-center gap-2 justify-center">
                  <Separator className="bg-green-bangladesh max-w-[135px]" />
                  <Caption>or</Caption>
                  <Separator className="bg-green-bangladesh max-w-[135px]" />
                </div>

                <Caption variant={"caption1"} as={"label"}>
                  Buy Asset #2
                </Caption>
                <div className="flex justify-between space-x-2">
                  <form.Field name="secondAsset.token">
                    {(field) => (
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value: string) => {
                          field.handleChange(value)
                        }}
                        disabled={!market || !sendToken}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {currentTokens.map((token) => (
                              <SelectItem
                                key={token.id}
                                value={token.id}
                                disabled={selectedTokens.includes(token)}
                              >
                                <div className="flex space-x-3">
                                  <TokenIcon symbol={token.symbol} />
                                  <Text>{token.id}</Text>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </form.Field>
                </div>

                <form.Field
                  name="secondAsset.limitPrice"
                  onChange={isGreaterThanZeroValidator}
                >
                  {(field) => (
                    <EnhancedNumericInput
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={({ target: { value } }) => {
                        field.handleChange(value)
                        computeReceiveAmount("secondAsset")
                      }}
                      token={secondAssetToken}
                      label="Limit price"
                      disabled={
                        !(market && form.state.isFormValid) ||
                        !secondAsset.token
                      }
                      error={field.state.meta.touchedErrors}
                    />
                  )}
                </form.Field>

                <form.Field name="secondAsset.receiveTo" onChange={isSelected}>
                  {(field) => (
                    <div className="flex-col flex">
                      <Caption variant={"caption1"} as={"label"}>
                        Receive to
                      </Caption>

                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value: string) => {
                          field.handleChange(value)
                        }}
                        disabled={!market}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {logics.map(
                              (logic) =>
                                logic && (
                                  <SelectItem key={logic.id} value={logic.id}>
                                    <div className="flex space-x-3">
                                      <WalletIcon />
                                      <Text className="capitalize">
                                        {logic.id.includes("simple")
                                          ? "Wallet"
                                          : logic.id.toUpperCase()}
                                      </Text>
                                    </div>
                                  </SelectItem>
                                ),
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {field.state.meta.touchedErrors.length ? (
                        <div>
                          <Caption className="text-red-600 text-xs">
                            Please select a valid option
                          </Caption>
                        </div>
                      ) : undefined}
                    </div>
                  )}
                </form.Field>

                <div className="flex justify-between !my-6">
                  <span className="text-muted-foreground text-xs">
                    Receiving amount
                  </span>
                  {secondAsset.amount ? (
                    <span className="text-xs">
                      {Number(secondAsset.amount).toFixed(
                        secondAssetToken?.displayedDecimals,
                      )}{" "}
                      {secondAssetToken?.symbol}
                    </span>
                  ) : (
                    "-"
                  )}
                </div>
              </>
            )}

            <Button
              disabled
              variant={"secondary"}
              className="flex justify-center items-center w-full"
            >
              <Plus className="h-4 w-4" /> Add Market
            </Button>

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
                <form.Field name="timeToLive">
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

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => {
                return (
                  <Button
                    className="w-full flex items-center justify-center !mb-4 capitalize !mt-6"
                    size={"lg"}
                    disabled={!canSubmit || !market}
                    rightIcon
                    loading={!!isSubmitting}
                  >
                    Buy
                  </Button>
                )
              }}
            </form.Subscribe>
          </div>
        </form>
      </form.Provider>

      {formData && (
        <FromWalletAmplifiedOrderDialog
          form={{
            ...formData,
            selectedToken,
            selectedSource,
            sendAmount,
            firstAssetToken,
            secondAssetToken,
          }}
          onClose={() => setFormData(undefined)}
        />
      )}
    </div>
  )
}
