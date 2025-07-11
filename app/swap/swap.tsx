"use client"

import { useEffect, useState } from "react"
import { injected, useAccount, useConnect } from "wagmi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import { formatPrice, useTokenBalance } from "@/hooks/use-token-balance"
import { useUpdatePageTitle } from "@/hooks/use-update-page-title"
import useMarket from "@/providers/market"
import { SwapArrowIcon } from "@/svgs"
import { toast } from "sonner"
import { SwapInput } from "./components/SwapInput"
import { useKame } from "./hooks/use-kame"

export default function Swap() {
  const { openMarkets: markets } = useOpenMarkets()
  const { isConnected } = useAccount()
  const { connect } = useConnect()
  const [payTokenDialogOpen, setPayTokenDialogOpen] = useState(false)
  const [receiveTokenDialogOpen, setReceiveTokenDialogOpen] = useState(false)
  const [{ payToken, receiveToken }, setTokens] = useState({
    payToken: undefined,
    receiveToken: undefined,
  })

  useEffect(() => {
    if (markets && (!payToken || !receiveToken)) {
      setTokens({
        payToken: markets[0]?.base, 
        receiveToken: markets[0]?.quote,
      })
    }
  }, [markets])

  const payTokenBalance = useTokenBalance(payToken)
  const receiveTokenBalance = useTokenBalance(receiveToken)
  const [fields, setFields] = useState({
    payValue: "",
    receiveValue: "",
  })
  const [slippage, setSlippage] = useState<string>("1")
  const [swapButtonText, setSwapButtonText] = useState("Swap")

  const { usdAmounts, quote, swap, fetchingQuote, setFetchingQuote } = useKame({
    payToken,
    receiveToken,
    payValue: fields.payValue,
    receiveValue: fields.receiveValue,
    onSwapError: (e) => {
      console.error("Error swapping", e)
      toast.error("Swap failed")
    },
    onSwapSuccess(receipt) {
      toast.success("Swap completed")
      payTokenBalance.refetch()
      receiveTokenBalance.refetch()
    },
  })

  useEffect(() => {
    if (quote) {
      const key = quote.forToken === payToken ? "payValue" : "receiveValue"
      setFields({
        ...fields,
        [key]: formatPrice(quote.receive),
      })
    }
  }, [quote])

  const { spotPrice } = useMergedBooks()
  const { currentMarket } = useMarket()

  // Update the browser tab title with token price information
  useUpdatePageTitle({
    spotPrice,
    baseToken: currentMarket?.base,
    quoteToken: currentMarket?.quote,
    suffix: "Swap | DEX",
  })

  const reverseTokens = () => {
    setTokens({
      payToken: receiveToken,
      receiveToken: payToken,
    })
    setFields((fields) => ({
      payValue: formatPrice(fields.receiveValue),
      receiveValue: formatPrice(fields.payValue),
    }))
  }

  const onMaxClicked = () => {
    setFetchingQuote("receive")
    setFields((fields) => ({
      ...fields,
      payValue: payTokenBalance.formattedAndFixed,
    }))
  }

  const onPayValueChange = (val: string) => {
    if (!val) {
      setFields((fields) => ({
        payValue: "",
        receiveValue: "",
      }))
      return
    }
    setFetchingQuote("receive")
    setFields((fields) => ({
      ...fields,
      payValue: val,
    }))
  }

  const onReceiveValueChange = (val: string) => {
    setFetchingQuote("pay")
    setFields((fields) => ({
      ...fields,
      receiveValue: val,
    }))
  }

  return (
    <>
      <div className="rounded-sm p-5 relative">
        <h1 className="text-2xl mb-4 ml-4">Swap</h1>
        <div className="relative bg-bg-secondary px-4 rounded-md">
          <div className="space-y-0.5">
            <SwapInput
              type="pay"
              token={payToken}
              value={fields.payValue}
              fetchingQuote={fetchingQuote}
              onChange={(e) => onPayValueChange(e.target.value)}
              dollarValue={usdAmounts?.baseUsd ?? 0}
              onTokenClicked={() => setPayTokenDialogOpen(true)}
              onMaxClicked={onMaxClicked}
            />
            <Button
              variant={"secondary"}
              onClick={reverseTokens}
              className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 !p-1"
            >
              <SwapArrowIcon className="size-6" />
            </Button>
            <SwapInput
              type="receive"
              token={receiveToken}
              fetchingQuote={fetchingQuote}
              value={fields.receiveValue}
              dollarValue={usdAmounts?.quoteUsd ?? 0}
              onChange={(e) => onReceiveValueChange(e.target.value)}
              onTokenClicked={() => setReceiveTokenDialogOpen(true)}
            />
          </div>

          {!isConnected ? (
            <Button
              className="w-full text-lg bg-bg-blush-pearl hover:bg-bg-blush-pearl text-black-rich"
              variant={"secondary"}
              size={"lg"}
              onClick={() => connect({ connector: injected() })}
            >
              Connect wallet
            </Button>
          ) : (
            <Button
              className="w-full text-md"
              size={"md"}
              onClick={swap}
              disabled={false}
            >
              {swapButtonText}
            </Button>
          )}
          <div className="flex items-center justify-between w-full">
            <div>Max Slippage</div>
            <Input
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-[100px]"
            />
          </div>
        </div>
        {/* <TokenSelectorDialog
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
        /> */}
      </div>
    </>
  )
}
