"use client"

import type { Token } from "@mangrovedao/mgv"
import { AnimatePresence, motion } from "framer-motion"
import React from "react"
import { Address, formatUnits } from "viem"
import { useAccount } from "wagmi"

import { CustomInput } from "@/components/custom-input-new"
import InfoTooltip from "@/components/info-tooltip-new"
import { TokenIcon } from "@/components/token-icon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-new"
import { ImageWithHideOnError } from "@/components/ui/image-with-hide-on-error"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { ODOS_API_IMAGE_URL } from "@/hooks/odos/constants"
import { useMarkets } from "@/hooks/use-addresses"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useUpdatePageTitle } from "@/hooks/use-update-page-title"
import useMarket from "@/providers/market"
import { ChevronDown, SwapArrowIcon } from "@/svgs"
import { cn } from "@/utils"
import { getExactWeiAmount } from "@/utils/regexp"
import { getAllTokensInMarkets } from "@/utils/tokens"
import { Accordion } from "../trade/_components/forms/components/accordion"
import { useSwap } from "./hooks/use-swap"
import { SLIPPAGES } from "./utils/swap-constants"

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
    mangroveTradeableTokensForPayToken,
    ethBalance,
    isWrapping,
    setIsWrapping,
    isFieldLoading,
    isFetchingDollarValue,
  } = useSwap()

  const { spotPrice } = useMergedBooks()
  const { currentMarket } = useMarket()

  // Update the browser tab title with token price information
  useUpdatePageTitle({
    spotPrice,
    baseToken: currentMarket?.base,
    quoteToken: currentMarket?.quote,
    suffix: "Swap | Mangrove DEX",
  })

  return (
    <>
      <div className="bg-bg-secondary rounded-sm p-5 relative mt-40">
        <h1 className="text-2xl mb-4">Swap</h1>
        <div className="space-y-2 relative">
          <div className="space-y-0.5">
            <TokenContainer
              type="pay"
              token={payToken}
              value={fields.payValue}
              isWrapping={isWrapping}
              ethBalance={getExactWeiAmount(
                formatUnits(
                  ethBalance?.value ?? 0n,
                  ethBalance?.decimals ?? 18,
                ),
                3,
              )}
              onChange={onPayValueChange}
              dollarValue={payDollar}
              onTokenClicked={() => setPayTokenDialogOpen(true)}
              onMaxClicked={onMaxClicked}
              isFetchingDollarValue={isFetchingDollarValue}
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
              loadingValue={isFieldLoading}
              type="receive"
              token={receiveToken}
              value={fields.receiveValue}
              dollarValue={receiveDollar}
              onChange={onReceiveValueChange}
              onTokenClicked={() => setReceiveTokenDialogOpen(true)}
              isFetchingDollarValue={isFetchingDollarValue}
            />
          </div>

          {!isConnected ? (
            <Button
              className="w-full text-lg bg-bg-blush-pearl hover:bg-bg-petal-mist text-black-rich"
              variant={"secondary"}
              size={"lg"}
              onClick={openConnectModal}
            >
              Connect wallet
            </Button>
          ) : (
            <Button
              className="w-full text-lg"
              variant={"secondary"}
              size={"lg"}
              onClick={swap}
              disabled={isSwapDisabled}
            >
              {swapButtonText}
            </Button>
          )}
          <Accordion
            title="Slippage tolerance"
            chevronValue={`${slippage}%`}
            tooltip="How much price slippage you're willing to accept so that your order can be executed"
          >
            <div className="space-y-2 mt-1">
              <div className="flex justify-around bg-bg-primary rounded-sm">
                {SLIPPAGES.map((value) => (
                  <Button
                    key={`percentage-button-${value}`}
                    variant={"secondary"}
                    size={"sm"}
                    className={cn(
                      "text-xs flex-1 bg-bg-primary border-none rounded-sm",
                      {
                        "opacity-60":
                          Number(slippage) !== Number(value) || showCustomInput,
                        "border-none bg-bg-tertiary rounded-sm text-black-rich":
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
                  value={slippage}
                  onChange={({ target: { value } }) => {
                    setSlippage(value)
                  }}
                />
              )}
            </div>
          </Accordion>
          {payToken?.symbol.includes("ETH") &&
            ethBalance?.value &&
            ethBalance.value > 0n && (
              <div className="flex justify-between items-center ">
                <span className="text-text-secondary flex items-center text-xs">
                  Use ETH balance
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
                    onClick={() => setIsWrapping(!isWrapping)}
                  />
                  <InfoTooltip className="text-text-quaternary text-sm size-4 cursor-pointer">
                    Will add a wrap ETH to wETH step during transaction
                  </InfoTooltip>
                </div>
              </div>
            )}
        </div>
        <TokenSelectorDialog
          type="sell"
          open={payTokenDialogOpen}
          tokens={allTokens}
          onSelect={onPayTokenSelected}
          onOpenChange={setPayTokenDialogOpen}
          mangroveTradeableTokens={getAllTokensInMarkets(useMarkets()).map(
            (t) => t.address,
          )}
        />
        <TokenSelectorDialog
          type="buy"
          open={receiveTokenDialogOpen}
          tokens={tradableTokens}
          onSelect={onReceiveTokenSelected}
          onOpenChange={setReceiveTokenDialogOpen}
          mangroveTradeableTokens={mangroveTradeableTokensForPayToken}
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
  mangroveTradeableTokens,
}: {
  open?: boolean
  tokens: Token[]
  onSelect: (token: Token) => void
  onOpenChange: (open: boolean) => void
  type: "buy" | "sell"
  mangroveTradeableTokens: Address[]
}) {
  const [search, setSearch] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a token to {type}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search"
          className="m-3 w-[90%] mr-5 h-10"
          type="text"
          value={search}
          // @ts-ignore
          onInput={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col space-y-2 justify-start p-3 pt-1 overflow-y-auto max-h-[400px]">
          {tokens
            .filter(
              (token) =>
                token.symbol.toLowerCase().includes(search.toLowerCase()) ||
                token.address.toLowerCase().includes(search.toLowerCase()),
            )
            .sort((a, b) => {
              const aIsTradeableOnMangrove = mangroveTradeableTokens.includes(
                a.address,
              )
              const bIsTradeableOnMangrove = mangroveTradeableTokens.includes(
                b.address,
              )
              if (aIsTradeableOnMangrove && !bIsTradeableOnMangrove) return -1
              if (!aIsTradeableOnMangrove && bIsTradeableOnMangrove) return 1
              return a.symbol.localeCompare(b.symbol)
            })
            .map((token) => (
              <div key={token.address}>
                <Button
                  onClick={() => onSelect(token)}
                  className="w-full bg-bg-blush-pearl hover:bg-bg-petal-mist text-black-rich px-2 py-1 border rounded-sm text-sm flex items-center space-x-2"
                >
                  <div className="relative">
                    <TokenIcon
                      symbol={token.symbol}
                      imgClasses="rounded-sm w-7"
                      customSrc={ODOS_API_IMAGE_URL(token.symbol)}
                      useFallback={true}
                    />
                    {mangroveTradeableTokens.includes(token.address) && (
                      <ImageWithHideOnError
                        className="absolute -top-2 -right-2 p-0.5"
                        src={`/assets/illustrations/mangrove-logo.png`}
                        width={20}
                        height={20}
                        alt={`mangrove-logo`}
                      />
                    )}
                  </div>
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
  loadingValue?: boolean
  isWrapping?: boolean
  ethBalance?: string
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
  loadingValue,
  isWrapping,
  ethBalance,
}: TokenContainerProps) {
  const { isConnected } = useAccount()
  const { formattedAndFixed, isLoading } = useTokenBalance(token)
  const dollars = (Number(value) * (dollarValue ?? 0)).toString()

  return (
    <div
      className={cn(
        "flex bg-primary-solid-black px-6 py-4 flex-col border border-transparent transition-all focus-within:!border-green-caribbean hover:border-border-primary",
        type === "pay" ? "rounded-t-sm" : "rounded-b-sm",
      )}
    >
      <div className="flex justify-between items-center w-full">
        <label className="text-sm text-text-secondary">
          {type === "pay" ? "Sell" : "Buy"}
        </label>
        <div className="text-sm text-right opacity-70 text-text-quaternary">
          {token && !isLoading && !formattedAndFixed ? (
            <></>
          ) : token && !isLoading && formattedAndFixed ? (
            <>
              Balance:
              {type === "pay" ? (
                <Button
                  variant={"invisible"}
                  onClick={onMaxClicked}
                  className="hover:opacity-80 transition-all px-0 ml-1 text-sm text-text-secondary"
                >
                  <span>
                    {isWrapping
                      ? Number(ethBalance) + Number(formattedAndFixed)
                      : formattedAndFixed}
                  </span>{" "}
                </Button>
              ) : (
                <span className="ml-1 text-text-secondary">
                  {formattedAndFixed}
                </span>
              )}
            </>
          ) : (
            <Skeleton className="w-10 h-3" />
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative h-12">
          <AnimatePresence mode="wait">
            {loadingValue ? (
              <motion.div
                key="loading-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center"
              >
                <motion.div
                  initial={{ width: 0, opacity: 0.5 }}
                  animate={{
                    width: "60%",
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className="h-9 bg-gradient-to-r from-transparent via-bg-tertiary to-transparent rounded-sm"
                />
              </motion.div>
            ) : (
              <motion.div
                key="actual-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Input
                  aria-label="You pay"
                  className="border-none outline-none p-0 text-3xl h-full"
                  placeholder="0"
                  value={value}
                  onChange={onChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span>
          {token ? (
            <Button
              onClick={onTokenClicked}
              className="bg-bg-blush-pearl hover:bg-bg-petal-mist text-black-rich p-1 border rounded-sm text-sm flex items-center space-x-1"
            >
              <TokenIcon
                symbol={token.symbol}
                customSrc={ODOS_API_IMAGE_URL(token.symbol)}
                imgClasses="rounded-sm"
                useFallback={true}
              />
              <span className="font-semibold text-lg text-nowrap pl-2">
                {token.symbol}
              </span>
              <ChevronDown className="mx-1 size-6 text-black-rich" />
            </Button>
          ) : (
            <Button onClick={onTokenClicked} className="text-nowrap">
              Select token
            </Button>
          )}
        </span>
      </div>
      <div className="flex justify-between items-center opacity-70 h-5">
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            {loadingValue ? (
              <motion.div
                key="loading-dollars"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 text-sm text-left text-text-quaternary"
              >
                <motion.div
                  initial={{ width: 0, opacity: 0.5 }}
                  animate={{
                    width: "50px",
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                  className="h-4 bg-gradient-to-r from-transparent via-bg-tertiary to-transparent rounded-sm"
                />
              </motion.div>
            ) : Number(dollars) <= 0 ? (
              <motion.div
                key="zero-dollars"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 text-sm text-left text-text-quaternary"
              >
                ≈ <span className="text-text-secondary">0</span> $
              </motion.div>
            ) : (
              <motion.div
                key="actual-dollars"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 text-sm text-left text-text-quaternary"
              >
                ≈{" "}
                <span className="text-text-secondary">
                  {token && Number(dollars) !== 0
                    ? dollars.slice(0, dollars.indexOf(".") + 3)
                    : "0"}
                </span>{" "}
                $
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
