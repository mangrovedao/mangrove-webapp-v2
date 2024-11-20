"use client"

import type { Token } from "@mangrovedao/mgv"
import React from "react"

import { CustomInput } from "@/components/custom-input-new"
import { TokenIcon } from "@/components/token-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-new"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { ChevronDown, SwapArrowIcon } from "@/svgs"
import { cn } from "@/utils"
import Rive from "@rive-app/react-canvas-lite"
import { useAccount } from "wagmi"
import { Accordion } from "../trade/_components/forms/components/accordion"
import { SLIPPAGES, useSwap } from "./hooks/use-swap"

export default function Swap() {
  const {
    payToken,
    receiveToken,
    reverseTokens,
    fields,
    onPayValueChange,
    onReceiveValueChange,
    openConnectModal,
    isConnected,
    isSwapDisabled,
    swap,
    allTokens,
    tradableTokens,
    payTokenDialogOpen,
    setPayTokenDialogOpen,
    receiveTokenDialogOpen,
    setReceiveTokenDialogOpen,
    onPayTokenSelected,
    onReceiveTokenSelected,
    isReverseDisabled,
    onMaxClicked,
    swapButtonText,
    payDollar,
    receiveDollar,
    slippage,
    showCustomInput,
    setShowCustomInput,
    setSlippage,
  } = useSwap()

  return (
    <>
      <div className="bg-bg-secondary rounded-2xl p-5 relative mt-16">
        <div className="absolute max-w-[234px] top-0 -right-4 -translate-y-[73px] translate-x-[15px] w-full h-[121px]">
          <Rive src="/assets/rive/iguane.riv" animations="Timeline 1" />
        </div>
        <h1 className="text-2xl mb-4">Swap</h1>
        <div className="space-y-4 relative">
          <div className="space-y-0.5">
            <TokenContainer
              type="pay"
              token={payToken}
              value={fields.payValue}
              onChange={onPayValueChange}
              dollarValue={payDollar}
              onTokenClicked={() => setPayTokenDialogOpen(true)}
              onMaxClicked={onMaxClicked}
            />
            <Button
              variant={"secondary"}
              onClick={reverseTokens}
              className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 !p-1"
              disabled={isReverseDisabled}
            >
              <SwapArrowIcon className="size-6" />
            </Button>
            <TokenContainer
              type="receive"
              token={receiveToken}
              value={fields.receiveValue}
              dollarValue={receiveDollar}
              onChange={onReceiveValueChange}
              onTokenClicked={() => setReceiveTokenDialogOpen(true)}
            />
          </div>
          {!isConnected ? (
            <Button
              className="w-full text-lg"
              size={"lg"}
              onClick={openConnectModal}
            >
              Connect wallet
            </Button>
          ) : (
            <Button
              className="w-full text-lg"
              size={"lg"}
              onClick={swap}
              disabled={isSwapDisabled}
            >
              {swapButtonText}
            </Button>
          )}
          <Accordion
            title="Slippage tolerance"
            tooltip="How much price slippage you're willing to accept so that your order can be executed"
            chevronValue={`${slippage}%`}
          >
            <div className="space-y-2 mt-1">
              <div className="flex justify-around bg-bg-primary rounded-lg">
                {SLIPPAGES.map((value) => (
                  <Button
                    key={`percentage-button-${value}`}
                    variant={"secondary"}
                    size={"sm"}
                    className={cn(
                      "text-xs flex-1 bg-bg-primary border-none rounded-lg",
                      {
                        "opacity-10":
                          Number(slippage) !== Number(value) || showCustomInput,
                        "border-none bg-bg-tertiary rounded-lg":
                          Number(slippage) === Number(value) &&
                          !showCustomInput,
                      },
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      showCustomInput && setShowCustomInput(!showCustomInput)
                      setSlippage(value)
                    }}
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
                      "border-none bg-bg-tertiary rounded-lg": showCustomInput,
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
                  value={slippage}
                  onChange={({ target: { value } }) => {
                    setSlippage(value)
                  }}
                />
              )}
            </div>
          </Accordion>
        </div>
        <TokenSelectorDialog
          type="sell"
          open={payTokenDialogOpen}
          tokens={allTokens}
          onSelect={onPayTokenSelected}
          onOpenChange={setPayTokenDialogOpen}
        />
        <TokenSelectorDialog
          type="buy"
          open={receiveTokenDialogOpen}
          tokens={tradableTokens}
          onSelect={onReceiveTokenSelected}
          onOpenChange={setReceiveTokenDialogOpen}
        />
      </div>
    </>
  )
}

function TokenSelectorDialog({
  tokens,
  onSelect,
  open = false,
  onOpenChange,
  type,
}: {
  open?: boolean
  tokens: Token[]
  onSelect: (token: Token) => void
  onOpenChange: (open: boolean) => void
  type: "buy" | "sell"
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a token to {type}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-2 justify-center p-3">
          {tokens.map((token) => (
            <div key={token.address}>
              <Button
                onClick={() => onSelect(token)}
                className="w-full bg-bg-secondary hover:bg-bg-primary px-2 py-1 border rounded-lg text-sm flex items-center space-x-1"
              >
                <TokenIcon symbol={token.symbol} />
                <span className="font-semibold text-lg">{token.symbol}</span>
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type TokenContainerProps = {
  token?: Token
  type: "pay" | "receive"
  value: string
  dollarValue: number
  onTokenClicked?: () => void
  onMaxClicked?: () => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  isFetchingDollarValue?: boolean
}

function TokenContainer({
  token,
  type,
  onTokenClicked,
  onMaxClicked,
  value,
  onChange,
  dollarValue,
  isFetchingDollarValue,
}: TokenContainerProps) {
  const { isConnected } = useAccount()
  const tokenBalance = useTokenBalance(token)
  const dollars = (Number(value) * (dollarValue ?? 0)).toString()

  return (
    <div
      className={cn(
        "flex bg-primary-solid-black px-6 py-4 flex-col border border-transparent transition-all focus-within:!border-green-caribbean hover:border-border-primary",
        type === "pay" ? "rounded-t-xl" : "rounded-b-xl",
      )}
    >
      <div className="flex justify-between items-center w-full">
        <label className="text-sm text-text-secondary">
          {type === "pay" ? "Sell" : "Buy"}
        </label>
        <div className="text-sm text-right opacity-70 text-text-quaternary">
          {isConnected && token && tokenBalance.balance ? (
            <>
              Balance:
              {type === "pay" ? (
                <Button
                  variant={"invisible"}
                  onClick={onMaxClicked}
                  className="hover:opacity-80 transition-all px-0 ml-1 text-sm text-text-secondary"
                >
                  <span className="">{tokenBalance.formattedAndFixed}</span>{" "}
                </Button>
              ) : (
                <span className="ml-1 text-text-secondary">
                  {tokenBalance.formattedAndFixed}
                </span>
              )}
            </>
          ) : (
            <Skeleton className="w-10 h-3" />
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          aria-label="You pay"
          className="border-none outline-none p-0 text-3xl"
          placeholder="0"
          value={value}
          onChange={onChange}
        />
        <span>
          {token ? (
            <Button
              onClick={onTokenClicked}
              className="!bg-button-secondary-bg p-1 border hover:border-border-primary rounded-full text-sm flex items-center space-x-1"
            >
              <TokenIcon symbol={token.symbol} />
              <span className="font-semibold text-lg text-nowrap pl-2">
                {token.symbol}
              </span>
              <ChevronDown className="mx-1 size-6 text-button-secondary-fg" />
            </Button>
          ) : (
            <Button onClick={onTokenClicked} className="text-nowrap">
              Select token
            </Button>
          )}
        </span>
      </div>
      <div className="flex justify-between items-center opacity-70">
        {isFetchingDollarValue ? (
          <Skeleton className="w-10 h-3 bg-gray" />
        ) : (
          <div className="text-sm text-left text-text-quaternary">
            ≈{" "}
            <span className="text-text-secondary">
              {token && Number(dollars) !== 0
                ? dollars.slice(0, dollars.indexOf(".") + 3)
                : "0"}
            </span>{" "}
            $
          </div>
        )}
      </div>
    </div>
  )
}
