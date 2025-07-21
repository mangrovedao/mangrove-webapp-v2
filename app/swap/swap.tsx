"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount, useBalance, useConnect } from "wagmi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { useMergedBooks } from "@/hooks/new_ghostbook/book"
import { useOpenMarkets } from "@/hooks/use-open-markets"
import { formatPrice } from "@/hooks/use-token-balance"
import { useUpdatePageTitle } from "@/hooks/use-update-page-title"
import useMarket from "@/providers/market"
import { SwapArrowIcon } from "@/svgs"
import { deduplicateTokens, getAllMangroveMarketTokens } from "@/utils/tokens"
import { Token } from "@mangrovedao/mgv"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { toast } from "sonner"
import { Address } from "viem"
import { SwapInput } from "./components/SwapInput"
import { TokenSelectorDialog } from "./components/TokenSelectorDialog"
import { useKame } from "./hooks/use-kame"
import { TokenMetadata, VERIFIED_TOKEN } from "./utils/tokens"

export default function Swap() {
  const { openMarkets: markets } = useOpenMarkets()
  const { isConnected, address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { connect } = useConnect()
  const [dialogOpen, setDialogOpen] = useState<"pay" | "receive" | null>(null)
  const [sliderValue, setSliderValue] = useState<number>(0)
  const [search, setSearch] = useState<string>("")
  const tokens = VERIFIED_TOKEN

  const [{ payToken, receiveToken }, setTokens] = useState<{
    payToken?: TokenMetadata
    receiveToken?: TokenMetadata
  }>({
    payToken: undefined,
    receiveToken: undefined,
  })

  const mgvTokens: Token[] = useMemo(
    () => deduplicateTokens([...getAllMangroveMarketTokens(markets)]),
    [markets],
  )

  useEffect(() => {
    if (markets && (!payToken || !receiveToken)) {
      setTokens({
        payToken: tokens[0],
        receiveToken: tokens[1],
      })
    }
  }, [markets])

  const { data: payTokenBalance, refetch: payTokenBalanceRefetch } = useBalance(
    {
      address,
      token: payToken?.address as Address,
    },
  )
  const payTokenBalanceFormatted = formatPrice(
    payTokenBalance?.formatted ?? "0",
  )
  const { data: receiveTokenBalance, refetch: receiveTokenBalanceRefetch } =
    useBalance({
      address,
      token: receiveToken?.address as Address,
    })
  const receiveTokenBalanceFormatted = formatPrice(
    receiveTokenBalance?.formatted ?? "0",
  )

  const maxPayValue = useMemo(
    () => Number(payTokenBalance?.formatted) * 0.99,
    [payTokenBalance],
  )

  const [fields, setFields] = useState({
    payValue: "",
    receiveValue: "",
  })
  const [slippage, setSlippage] = useState<string>("1")
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const {
    usdAmounts,
    quote,
    swap,
    fetchingQuote,
    setFetchingQuote,
    swapState,
    routeMangrove,
  } = useKame({
    payToken,
    receiveToken,
    payValue: fields.payValue,
    receiveValue: fields.receiveValue,
    mgvTokens: mgvTokens.map((t) => t.address),
    onSwapError: (e) => {
      console.error("Error swapping", e)
      toast.error(
        <div className="flex items-center justify-between w-full">
          <span>Swap Failed</span>
          {e.transactionHash ? (
            <a
              className="text-red-200"
              target="_blank"
              href={`https://seistream.app/transactions/${e?.transactionHash}`}
            >
              View
            </a>
          ) : (
            <></>
          )}
        </div>,
      )
    },
    onSwapSuccess(receipt) {
      toast.success(
        <div className="flex items-center justify-between w-full">
          <span>Swap completed</span>
          <a
            className="text-green-caribbean"
            target="_blank"
            href={`https://seistream.app/transactions/${receipt.transactionHash}`}
          >
            View
          </a>
        </div>,
      )
      payTokenBalanceRefetch()
      receiveTokenBalanceRefetch()
      setFields({
        payValue: "",
        receiveValue: "",
      })
      setSliderValue(0)
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
        return `Swap ${routeMangrove ? "via Oxium" : ""}`
    }
  }, [swapState, routeMangrove])

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
            (Number(formatPrice(quote.receive)) /
              Number(formatPrice(payTokenBalance?.formatted ?? "0"))) *
              100,
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
        (Number(fields.receiveValue) / Number(receiveTokenBalanceFormatted)) *
          100,
      ),
    )
  }

  const onMaxClicked = () => {
    setFetchingQuote("receive")
    setFields((fields) => ({
      ...fields,
      payValue: maxPayValue.toString(),
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
      Math.min(100, (Number(val) / Number(payTokenBalanceFormatted)) * 100),
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
    const amount = (val / 100) * Number(payTokenBalanceFormatted)
    setFields((fields) => ({
      ...fields,
      payValue: formatPrice(amount.toString()),
    }))
  }

  const onSliderUp = () => {
    setIsDragging(false)
    onPayChange(fields.payValue)
  }

  const onTokenSelected = (
    token: TokenMetadata,
    type: "pay" | "receive" | null,
  ) => {
    setDialogOpen(null)
    if (
      token.address === payToken?.address ||
      token.address === receiveToken?.address
    )
      return
    if (!token || !type) return
    setTokens((tokens) => ({
      ...tokens,
      [`${type}Token`]: token,
    }))
    setFetchingQuote(type)
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
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => onSliderUp()}
              onPointerLeave={() => isDragging && onSliderUp()}
              disabled={Boolean(swapState)}
            />
          )}

          {!isConnected ? (
            <Button
              className="w-full text-md py-2 mt-4 bg-bg-blush-pearl hover:bg-bg-blush-pearl text-black-rich"
              variant={"secondary"}
              size={"lg"}
              onClick={() => openConnectModal?.()}
            >
              Connect wallet
            </Button>
          ) : (
            <Button
              className="w-full flex items-center gap-2 justify-center text-md bg-white opacity-80 py-2 mt-4"
              size={"md"}
              onClick={() => swap(slippage)}
              disabled={
                Number(payTokenBalanceFormatted) < Number(fields.payValue) ||
                Boolean(swapState)
              }
            >
              {swapState !== null && <Spinner className="h-5 w-5 mb-1" />}{" "}
              {swapButtonText}
            </Button>
          )}
          <div className="py-8">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-white opacity 80">Max Slippage</div>
              <Input
                type="text"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-[50px] h-7 text-sm pl-2 pr-4 py-1 text-right ml-2"
                showPercentage
              />
            </div>
          </div>
        </div>
        <TokenSelectorDialog
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          type={dialogOpen}
          open={Boolean(dialogOpen)}
          tokens={tokens}
          onSelect={onTokenSelected}
          onOpenChange={setDialogOpen}
        />
      </div>
    </>
  )
}
