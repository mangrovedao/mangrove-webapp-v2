"use client"

import type { Token } from "@mangrovedao/mgv"
import { MoveVertical } from "lucide-react"

import { TokenIcon } from "@/components/token-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { ChevronDown } from "@/svgs"
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
  } = useSwap()

  return (
    <>
      <h1 className="text-3xl text-center mt-20 mb-6">Swap</h1>
      <div className="px-4  space-y-1 relative">
        <TokenContainer
          type="pay"
          token={payToken}
          value={fields.payValue}
          onChange={onPayValueChange}
          onTokenClicked={() => setPayTokenDialogOpen(true)}
          onMaxClicked={onMaxClicked}
        />
        <Button
          onClick={reverseTokens}
          className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2"
          disabled={isReverseDisabled}
        >
          <MoveVertical />
        </Button>
        <TokenContainer
          type="receive"
          token={receiveToken}
          value={fields.receiveValue}
          onChange={onReceiveValueChange}
          onTokenClicked={() => setReceiveTokenDialogOpen(true)}
        />
        {!isConnected ? (
          <Button
            className="w-full rounded-md text-xl"
            size={"lg"}
            onClick={openConnectModal}
          >
            Connect wallet
          </Button>
        ) : (
          <Button
            className="w-full rounded-md text-xl"
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

      <Button variant={"link"} asChild>
        <a
          className="text-center mt-10 max-w-56 mx-auto"
          href="https://app.mangrove.exchange"
        >
          Go to desktop web app
        </a>
      </Button>
    </>
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
}: TokenContainerProps) {
  const tokenBalance = useTokenBalance(token)

  return (
    <div className="flex bg-primary-solid-black rounded-md px-6 py-4 flex-col border border-transparent transition-all focus-within:border-green-caribbean">
      <label className="text-sm opacity-70">
        {type === "pay" ? "You pay" : "You receive"}
      </label>
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
              className="px-2 py-1 border border-green-caribbean rounded-lg text-sm flex items-center space-x-1"
            >
              <TokenIcon symbol={token.symbol} />
              <span className="font-semibold text-lg text-nowrap">
                {token.symbol}
              </span>
              <ChevronDown className="w-3" />
            </Button>
          ) : (
            <Button onClick={onTokenClicked} className="text-nowrap">
              Select token
            </Button>
          )}
        </span>
      </div>
      <div className="text-xs text-right opacity-70">
        {token ? (
          <>
            Balance: <span>{tokenBalance.formattedWithSymbol}</span>{" "}
          </>
        ) : null}
        {tokenBalance.balance && type === "pay" && (
          <Button
            variant={"link"}
            onClick={onMaxClicked}
            className="text-green-caribbean hover:opacity-80 transition-all px-0 ml-1 text-sm"
          >
            Max
          </Button>
        )}
      </div>
    </div>
  )
}
