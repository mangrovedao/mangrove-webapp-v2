"use client"
import Big from "big.js"
import { Plus, Trash } from "lucide-react"
import Link from "next/link"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/utils"
import React from "react"
import { Accordion } from "../components/accordion"
import { MarketDetails } from "../components/market-details"
import SourceIcon from "../limit/components/source-icon"
import FromWalletAmplifiedOrderDialog from "./components/from-wallet-order-dialog"
import { TimeInForce, TimeToLiveUnit } from "./enums"
import useAmplifiedForm from "./hooks/use-amplified"
import { getCurrentTokenPrice } from "./utils"

const sliderValues = [25, 50, 75, 100]

export function Amplified() {
  const {
    errors,
    sendSource,
    sendAmount,
    openMarkets,
    sendToken,
    assets,
    assetsWithTokens,
    timeInForce,
    timeToLive,
    timeToLiveUnit,
    setSendAmount,
    useAbleTokens,
    balanceLogic_temporary,
    tickSize,
    selectedToken,
    selectedSource,
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

  const handleSliderChange = (value: number) => {
    const amount = (value * Number(balanceLogic_temporary)) / 100
    setSendAmount(amount.toString())
    // if(!sendToken) setAssets([])
  }
  const [summaryDialog, setSummaryDialog] = React.useState(false)

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

  const selectedTokens = assets ? assets.map((asset) => asset.token) : []
  const isAmplifiable = currentTokens.length > 1
  const tokensLeft = selectedTokens.length < currentTokens.length

  if (!logics)
    return (
      <div className={"p-0.5"}>
        <Skeleton className="w-full h-screen" />
      </div>
    )

  const isAssetsEmpty = assets.some(
    (asset) => !asset.token || !asset.amount || !asset.limitPrice,
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
            className="text-green-caribbean underline"
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
              onChange={(e) => {
                handleSentAmountChange(e.target.value)
                // computeReceiveAmount()
              }}
              // minimumVolume={sendVolume}
              // volumeAction={{
              //   onClick: () => {
              //     handleSentAmountChange(sendVolume || "0"), computeReceiveAmount()
              //   },
              // }}

              disabled={!sendToken || balanceLogic_temporary === "0"}
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
              action={{
                onClick: () => {
                  handleSentAmountChange(balanceLogic_temporary || "0")
                },
              }}
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
              disabled={!sendToken}
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
                  disabled={!sendToken}
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

          {assets.map((asset, i) => {
            return (
              <div key={`asset-${i}`} className="space-y-2">
                <div className="flex justify-between my-2">
                  <Caption variant={"caption1"} as={"label"}>
                    Buy Asset #{i + 1}
                  </Caption>

                  <button
                    disabled={!isAmplifiable || i < 2}
                    className={cn("text-red-600 text-xs cursor-pointer", {
                      "opacity-20 cursor-not-allowed": !isAmplifiable || i < 2,
                    })}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAssetsChange(
                        assets.filter((_, index) => index !== i),
                      )
                    }}
                  >
                    <Trash className="h-4 w-4 hover:opacity-80 transition-opacity" />
                  </button>
                </div>
                <div className="flex justify-between space-x-1">
                  <Select
                    name={"token"}
                    value={asset.token}
                    onValueChange={(value) =>
                      handleAssetsChange([
                        ...assets.slice(0, i),
                        {
                          ...asset,
                          token: value,
                        },
                        ...assets.slice(i + 1),
                      ])
                    }
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
                  onChange={(e) => {
                    handleAssetsChange([
                      ...assets.slice(0, i),
                      {
                        ...asset,
                        limitPrice: e.target.value,
                      },
                      ...assets.slice(i + 1),
                    ])
                    // computeReceiveAmount()
                  }}
                  token={getCurrentTokenPrice(asset.token, openMarkets)}
                  label="Limit price"
                  disabled={!asset.token}
                  error={errors[`limitPrice-${i}`]}
                />

                <div className="flex-col flex">
                  <Caption variant={"caption1"} as={"label"}>
                    Receive to
                  </Caption>
                  <Select
                    name={"receiveTo"}
                    value={asset.receiveTo}
                    onValueChange={(value: string) =>
                      handleAssetsChange([
                        ...assets.slice(0, i),
                        {
                          ...asset,
                          receiveTo: value,
                        },
                        ...assets.slice(i + 1),
                      ])
                    }
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
                                <div className="flex gap-2 w-full items-center">
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
                  {errors[`receiveTo-${i}`] ? (
                    <Caption className="text-red-100">
                      {errors[`receiveTo-${i}`]}
                    </Caption>
                  ) : undefined}
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
                  <div className="!text-xs">
                    <MarketDetails
                      tickSize={tickSize}
                      // spotPrice={"3"}
                      // minVolume={minVolume}
                    />
                  </div>
                ) : undefined}

                {i !== assets.length - 1 ? (
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
          disabled={!isAmplifiable || !tokensLeft}
          onClick={() => {
            handleAssetsChange([
              ...assets,
              {
                amount: "",
                token: "",
                limitPrice: "",
                receiveTo: "simple",
              },
            ])
          }}
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
              onValueChange={(value: TimeInForce) => {
                handleTimeInForceChange(value)
              }}
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
              onChange={({ target: { value } }) => {
                if (!value) return
                handleTimeToLiveChange(value)
              }}
              error={errors["timeToLive"]}
            />

            <Select
              name={"timeToLiveUnit"}
              value={timeToLiveUnit}
              onValueChange={(value: TimeToLiveUnit) => {
                handleTimeToLiveUnit(value)
              }}
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
          disabled={
            !isAmplifiable || Object.keys(errors).length > 0 || isAssetsEmpty
          }
          rightIcon
          onClick={() => {
            setSummaryDialog(!summaryDialog)
          }}
          // loading={!!isSubmitting}
        >
          Buy
        </Button>
      </form>
      <FromWalletAmplifiedOrderDialog
        form={{
          assetsWithTokens,
          sendSource,
          sendToken,
          sendAmount,
          selectedToken,
          selectedSource,
          timeInForce,
          timeToLive,
          timeToLiveUnit,
        }}
        onClose={() => {
          setSummaryDialog(!summaryDialog)
        }}
        isOpen={summaryDialog}
      />
    </div>
  )
}
