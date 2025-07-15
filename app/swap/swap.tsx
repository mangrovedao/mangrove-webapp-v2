"use client"

import { useEffect, useMemo, useState } from "react"
import { injected, useAccount, useConnect, useReadContracts } from "wagmi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/swap-slider"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import { formatPrice, useTokenBalance } from "@/hooks/use-token-balance"
import { useUpdatePageTitle } from "@/hooks/use-update-page-title"
import useMarket from "@/providers/market"
import { SwapArrowIcon } from "@/svgs"
import { deduplicateTokens, getAllMangroveMarketTokens } from "@/utils/tokens"
import { Token } from "@mangrovedao/mgv"
import { toast } from "sonner"
import { Address, erc20Abi, formatUnits } from "viem"
import { SwapInput } from "./components/SwapInput"
import { TokenSelectorDialog } from "./components/TokenSelectorDialog"
import { useKame } from "./hooks/use-kame"
import { Spinner } from "@/components/ui/spinner"

export default function Swap() {
  const { openMarkets: markets } = useOpenMarkets()
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()
  const [dialogOpen, setDialogOpen] = useState<"pay" | "receive" | null>(null)
  const [sliderValue, setSliderValue] = useState<number>(0)

  const [{ payToken, receiveToken }, setTokens] = useState({
    payToken: undefined,
    receiveToken: undefined,
  })

  const allTokens = deduplicateTokens([...getAllMangroveMarketTokens(markets)])

  const {
    data: tokenBalances,
    isLoading,
    error,
  } = useReadContracts({
    contracts: allTokens.map((token) => ({
      address: token.address as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    })),
    allowFailure: false, // set to true if you want to handle partial failures
  })

  const balances = useMemo(() => {
    if (tokenBalances) {
      return allTokens.map((token, index) => ({
        address: token.address,
        balance: tokenBalances[index] as bigint,
      }))
    }
    return []
  }, [tokenBalances])

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
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const { usdAmounts, quote, swap, fetchingQuote, setFetchingQuote, swapState } = useKame({
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

  const swapButtonText = useMemo(() => {
    switch (swapState) {
      case "fetch-quote":
        return "Fetching quote..."
      case "approving":
        return "Approving..."
      case "swapping":
        return "Swapping..."
      default:
        return "Swap"
    }
  }, [swapState])

  useEffect(() => {
    if (quote) {
      const key = quote.forToken === payToken ? "payValue" : "receiveValue"
      setFields({
        ...fields,
        [key]: formatPrice(quote.receive),
      })
      if (quote.forToken === payToken) {
        setSliderValue(
          Math.min(
            100,
            Number(formatPrice(quote.receive)) / Number(payTokenBalance.formattedAndFixed) * 100,
          ),
        )
      }
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
    setFetchingQuote("receive")
    setSliderValue(
      Math.min(
        100,
        (Number(fields.receiveValue) /
          Number(receiveTokenBalance.formattedAndFixed)) *
          100,
      ),
    )
  }

  const onMaxClicked = () => {
    setFetchingQuote("receive")
    setFields((fields) => ({
      ...fields,
      payValue: payTokenBalance.formattedAndFixed,
    }))
    setSliderValue(100)
  }

  const onPayChange = (val: string) => {
    if (!val) {
      setFields((fields) => ({
        payValue: "",
        receiveValue: "",
      }))
      setFetchingQuote(null)
      return
    }
    setFetchingQuote("receive")
    setFields((fields) => ({
      ...fields,
      payValue: val,
    }))
    setSliderValue(
      Math.min(
        100,
        (Number(val) / Number(payTokenBalance.formattedAndFixed)) * 100,
      ),
    )
  }

  const onReceiveChange = (val: string) => {
    if (!val) {
      setFields((fields) => ({
        payValue: "",
        receiveValue: "",
      }))
      setFetchingQuote(null)
      return
    }
    setFetchingQuote("pay")
    setFields((fields) => ({
      ...fields,
      receiveValue: val,
    }))
  }

  const onSliderChange = (val: number) => {
    setSliderValue(val)
    const amount = (val / 100) * Number(payTokenBalance.formattedAndFixed)
    setFields((fields) => ({
      ...fields,
      payValue: formatPrice(amount.toString()),
    }))
  }

  const onSliderUp = () => {
    setIsDragging(false)
    onPayChange(fields.payValue)
  }

  const onTokenSelected = (token: Token, type: "pay" | "receive" | null) => {
    if (token === payToken || token === receiveToken) return
    if (!token || !type) return
    setTokens((tokens) => ({
      ...tokens,
      [`${type}Token`]: token,
    }))
    setDialogOpen(null)
    const tokenBalance = balances.find(
      (b) => b.address === token.address,
    )?.balance
    if (!tokenBalance) return
    let balance = parseFloat(formatUnits(tokenBalance as bigint, token.decimals))
    if (balance.toString().includes('e')) {
      balance = 0
    }

    if (type === "pay") {
      const payValue = Math.min(parseFloat(fields.payValue), balance)
      onPayChange(payValue.toString())
      setSliderValue((payValue / balance) * 100)
    } else {
      const receiveValue = Math.min(parseFloat(fields.receiveValue), balance)
      console.log(receiveValue)
      onReceiveChange(receiveValue.toString())
    }
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
              onChange={(e) => onPayChange(e.target.value)}
              dollarValue={usdAmounts.baseUsd}
              onTokenClicked={() => setDialogOpen("pay")}
              onMaxClicked={onMaxClicked}
              disabled={Boolean(swapState)}
            />
            <Button
              variant={"secondary"}
              onClick={reverseTokens}
              className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 !p-1"
              disabled={Boolean(swapState)}
            >
              <SwapArrowIcon className="size-6" />
            </Button>
            <SwapInput
              type="receive"
              token={receiveToken}
              fetchingQuote={fetchingQuote}
              value={fields.receiveValue}
              dollarValue={usdAmounts.quoteUsd}
              conversionPercentage={usdAmounts.quoteUsd / usdAmounts.baseUsd}
              onChange={(e) => onReceiveChange(e.target.value)}
              onTokenClicked={() => setDialogOpen("receive")}
              isLoading={isDragging}
              disabled={Boolean(swapState)}
            />
          </div>

          {isConnected && (
            <Slider
              value={[sliderValue || 0]}
              onValueChange={(val) => onSliderChange(val[0] || 0)}
              max={100}
              step={1}
              className="my-5"
              showValues={["0%", "25%", "50%", "100%"]}
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => onSliderUp()}
              onPointerLeave={() => isDragging && onSliderUp()}
              disabled={Boolean(swapState)}
            />
          )}

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
              className="w-full flex items-center gap-2 justify-center text-md bg-green-caribbean opacity-80 text-sm py-2 mt-4"
              size={"md"}
              onClick={() => swap(slippage)}
              disabled={Number(payTokenBalance.formattedAndFixed) < Number(fields.payValue) || Boolean(swapState)}
            >
              {swapState !== null &&<Spinner className='h-5 w-5 mb-1' />} {swapButtonText}
            </Button>
          )}
          <div className='py-8'>
          <div className="flex items-center justify-between w-full">
            <div className='text-sm text-white opacity 80'>Max Slippage</div>
            <Input
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-[50px] h-7 text-sm px-2 py-1 text-right"
            />
          </div>
        </div>
          </div>
        <TokenSelectorDialog
          type={dialogOpen}
          open={Boolean(dialogOpen)}
          tokens={allTokens}
          onSelect={onTokenSelected}
          onOpenChange={setDialogOpen}
          balances={balances}
        />
      </div>
    </>
  )
}
