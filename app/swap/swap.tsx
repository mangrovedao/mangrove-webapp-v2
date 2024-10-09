"use client"

import type { Token } from "@mangrovedao/mgv"

import { TokenIcon } from "@/components/token-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { ChameleonIllustration, ChevronDown, SwapArrowIcon } from "@/svgs"
import { cn } from "@/utils"
import { useAccount } from "wagmi"
import { useSwap } from "./hooks/use-swap"

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
  } = useSwap()

  return (
    <div className="bg-bg-secondary rounded-2xl p-5 relative mt-16">
      {!isConnected && (
        <ChameleonIllustration className="absolute max-w-[234px] top-0 right-0 -translate-y-[73px] translate-x-[15px]" />
      )}
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
      </div>
      <TokenSelectorDialog
        open={payTokenDialogOpen}
        tokens={allTokens}
        onSelect={onPayTokenSelected}
        onOpenChange={setPayTokenDialogOpen}
      />
      <TokenSelectorDialog
        open={receiveTokenDialogOpen}
        tokens={tradableTokens}
        onSelect={onReceiveTokenSelected}
        onOpenChange={setReceiveTokenDialogOpen}
      />
    </div>
  )
}

function TokenSelectorDialog({
  tokens,
  onSelect,
  open = false,
  onOpenChange,
}: {
  open?: boolean
  tokens: Token[]
  onSelect: (token: Token) => void
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <ul className="mt-6 flex flex-col space-y-4">
          {tokens.map((token) => (
            <li key={token.address}>
              <Button
                onClick={() => onSelect(token)}
                className="px-2 py-1 border rounded-lg text-sm flex items-center space-x-1"
              >
                <TokenIcon symbol={token.symbol} />
                <span className="font-semibold text-lg">{token.symbol}</span>
              </Button>
            </li>
          ))}
        </ul>
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
}

function TokenContainer({
  token,
  type,
  onTokenClicked,
  onMaxClicked,
  value,
  onChange,
  dollarValue,
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
          {!isConnected ? (
            <Skeleton className="w-32 h-8 bg-gray rounded-full" />
          ) : token ? (
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
        {token && Number(dollars) !== 0 ? (
          <div className="text-sm text-left text-text-quaternary">
            ≈{" "}
            <span className="text-text-secondary">
              {dollars.slice(0, dollars.indexOf(".") + 3) ?? "0"}
            </span>{" "}
            $
          </div>
        ) : (
          <Skeleton className="w-10 h-3 bg-gray" />
        )}
      </div>
    </div>
  )
}
