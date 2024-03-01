"use client"

import InfoTooltip from "@/components/info-tooltip"
import { CustomBalance } from "@/components/stateful/token-balance/custom-balance"
import { TokenIcon } from "@/components/token-icon"
import { EnhancedNumericInput } from "@/components/token-input"
import { Caption } from "@/components/typography/caption"
import { Text } from "@/components/typography/text"
import { Title } from "@/components/typography/title"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/utils"
import { Label } from "@radix-ui/react-dropdown-menu"
import { Separator } from "@radix-ui/react-separator"
import Big from "big.js"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import SourceIcon from "../limit/components/source-icon"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import liquiditySourcing from "./hooks/amplified-liquidity-sourcing"
import useAmplifiedForm from "./hooks/use-amplified-temp"
const sliderValues = [25, 50, 75, 100]

export function Amplified() {
  const {
    setGlobalError,
    errors,
    setErrors,
    isChangingFrom,
    setIsChangingFrom,
    sendSource,
    sendAmount,
    sendToken,
    assets,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    address,
    setSendSource,
    setSendAmount,
    setSendToken,
    setAssets,
    setTimeInForce,
    setTimeToLive,
    setTimeToLiveUnit,
    minBid,
    tickSize,
    selectedToken,
    selectedSource,
    minVolume,
    currentTokens,
    availableTokens,
    logics,
    handleSendSource,
    handleSentAmountChange,
    handeSendTokenChange,
    handleAssetsChange,
    handleTimeInForceChange,
    handleTimeToLiveChange,
    handleTimeToLiveUnit,
  } = useAmplifiedForm()

  const { useAbleTokens, sendFromBalance } = liquiditySourcing({
    availableTokens,
    sendToken: selectedToken,
    sendFrom: sendSource,
    fundOwner: address, //TODO check if fundowner changes if the liquidity sourcing is from a different wallet
    logics,
  })

  const { formatted } = useTokenBalance(selectedToken)

  const balanceLogic_temporary =
    selectedToken?.id.includes("WBTC") || selectedSource?.id === "simple"
      ? formatted
      : sendFromBalance?.formatted

  const handleSliderChange = (value: number) => {
    const amount = (value * Number(balanceLogic_temporary)) / 100
    // form.setFieldValue("sendAmount", amount.toString())
    // form.validateAllFields("change")

    // computeReceiveAmount()
  }

  const sendTokenBalanceAsBig = balanceLogic_temporary
    ? Big(Number(balanceLogic_temporary))
    : Big(0)

  const sliderValue = Math.min(
    Big(!isNaN(Number(sendAmount)) ? Number(sendAmount) : 0)
      .mul(100)
      .div(sendTokenBalanceAsBig.eq(0) ? 1 : sendTokenBalanceAsBig)
      .toNumber(),
    100,
  ).toFixed(0)

  const isAmplifiable = currentTokens.length > 1
  const selectedTokens = assets ? assets.map((asset) => asset.token) : []

  if (!logics)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-screen" />
      </div>
    )

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

      <form
        className={cn("space-y-6")}
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="space-y-2 !mt-6">
          <Title variant={"title2"}> Liquidity sourcing</Title>

          <div className="flex flex-col">
            <Select
              name={"sendSource"}
              value={sendSource}
              onValueChange={handleSendSource}
              //   disabled={}
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
                            <SourceIcon sourceId={logic.id} />
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
          <div className="flex gap-2">
            <EnhancedNumericInput
              name={"sendAmount"}
              value={sendAmount}
              onChange={handleSentAmountChange}
              // disabled={//   !market || !sendToken || balanceLogic_temporary === "0"}
              error={errors.sendAmount}
            />

            <Select
              name={"sendToken"}
              value={sendToken}
              onValueChange={handeSendTokenChange}
              disabled={!sendSource}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {useAbleTokens.map(
                    (token) =>
                      token && (
                        <SelectItem key={token.id} value={token.id}>
                          <div className="flex space-x-3">
                            <TokenIcon symbol={token.symbol} />
                            <Text>{token.symbol}</Text>
                          </div>
                        </SelectItem>
                      ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {sendToken && (
            <CustomBalance
              token={selectedToken}
              balance={balanceLogic_temporary}
              label={"Balance"}
            />
          )}

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
              //   disabled={!(market && form.state.isFormValid) || !sendToken}
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
                  //   disabled={!market}
                >
                  {value}%
                </Button>
              ))}
            </div>
          </div>

          {selectedToken?.address && !isAmplifiable ? (
            <Caption className="text-orange-700 !my-4">
              Only one market is available for this asset, please post a limit
              order instead.
            </Caption>
          ) : undefined}

          {assets.map((asset, index) => {
            return (
              <div key={`asset-${index}`}>
                <Caption variant={"caption1"} as={"label"}>
                  Buy Asset #{index + 1}
                </Caption>
                <div className="flex justify-between space-x-1">
                  <Select
                    name={"token"}
                    value={asset.token}
                    onValueChange={() => undefined}
                    disabled={!sendToken || !isAmplifiable}
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
                            disabled={selectedTokens.includes(token.id)}
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
                </div>

                <EnhancedNumericInput
                  name={"limitPrice"}
                  value={asset.limitPrice}
                  // onValueChange={(value: string) => undefined}
                  token={availableTokens.find(
                    (token) => token.id === asset.token,
                  )}
                  label="Limit price"
                  disabled={!asset.token}
                  // error={errors.limitPrice}
                />

                <div className="flex-col flex">
                  <Caption variant={"caption1"} as={"label"}>
                    Receive to
                  </Caption>
                  <Select
                    name={"receiveTo"}
                    value={asset.receiveTo}
                    onValueChange={(value: string) => undefined}
                    disabled={!isAmplifiable}
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
                                  <SourceIcon sourceId={logic.id} />
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
                  {/* {errors. ? (
                      <div>
                        <Caption className="text-red-600 text-xs">
                          Please select a valid option
                        </Caption>
                      </div>
                    ) : undefined} */}
                </div>
                <div className="flex justify-between !my-6">
                  <span className="text-muted-foreground text-xs">
                    Receiving amount
                  </span>
                  {asset.amount ? (
                    <span className="text-xs">
                      {Number(asset.amount).toFixed(
                        availableTokens.find(
                          (token) => token.id === asset.token,
                        )?.displayedDecimals,
                      )}{" "}
                      {
                        availableTokens.find(
                          (token) => token.id === asset.token,
                        )?.symbol
                      }
                    </span>
                  ) : (
                    "-"
                  )}
                </div>
                {selectedToken ? (
                  <MarketDetails
                    tickSize={tickSize}
                    // spotPrice={"3"}
                    // minVolume={minVolume}
                  />
                ) : undefined}

                {index !== assets.length - 1 ? (
                  <div className="flex items-center gap-2 justify-center !mt-6">
                    <Separator className="bg-green-bangladesh max-w-[135px]" />
                    <Caption>or</Caption>
                    <Separator className="bg-green-bangladesh max-w-[135px]" />
                  </div>
                ) : undefined}
              </div>
            )
          })}
        </div>
        <Button
          disabled
          variant={"secondary"}
          className="flex justify-center items-center w-full mt-6"
        >
          <Plus className="h-4 w-4" /> Add Market
        </Button>
        <Separator className="!my-6" />
        <Accordion title="Advanced">
          <div className="grid text-md space-y-2">
            <Label>Time in force</Label>
            <Select
              name={" timeInForce"}
              value={timeInForce}
              // onValueChange={handleTimeInForceChange}
              // disabled={!market}
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

          <div
            className={cn("flex justify-between space-x-2", {
              hidden: timeInForce !== TimeInForce.GOOD_TIL_TIME,
            })}
          >
            <EnhancedNumericInput
              placeholder="1"
              name={"timeToLive"}
              value={timeToLive}
              // onChange={({ target: { value } }) => {
              //   if (!value) return
              //   field.handleChange(value)
              // }}
              // disabled={!(market && form.state.isFormValid)}
              error={errors.timeToLive}
            />

            <Select
              name={"timeToLiveUnit"}
              value={timeToLiveUnit}
              // onValueChange={(value: TimeToLiveUnit) => {
              //   field.handleChange(value)
              // }}
              // disabled={!market}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(TimeToLiveUnit).map((timeToLiveUnit) => (
                    <SelectItem key={timeToLiveUnit} value={timeToLiveUnit}>
                      {timeToLiveUnit}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Accordion>
        <Separator className="!my-6" />

        <Button
          className="w-full flex items-center justify-center !mb-4 capitalize !mt-6"
          size={"lg"}
          disabled={!isAmplifiable}
          rightIcon
          // loading={!!isSubmitting}
        >
          Buy
        </Button>
      </form>
    </div>
  )
}
