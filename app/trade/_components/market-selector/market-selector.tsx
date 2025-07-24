"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import useMarket from "@/providers/market"
import { overrideSymbol } from "@/utils/symbol"
import { MarketParams } from "@mangrovedao/mgv"
import { useEffect, useState } from "react"
import { getAddress, isAddressEqual } from "viem"
import { TokenIcon } from "../../../../components/token-icon"

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

function getSymbol(market?: MarketParams) {
  if (!market) return
  return `${overrideSymbol(market.base)}/${overrideSymbol(market.quote)}`
}

function getValue(market: MarketParams) {
  return `${market.base.address}/${market.quote.address}/${market.tickSpacing}`
}

export default function MarketSelector() {
  const { markets: rawMarkets, currentMarket, setMarket } = useMarket()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const PRIORITY_PAIRS = [
    { base: "WSEI", quote: "USDC" },
    { base: "WETH", quote: "USDC" },
    { base: "WBTC", quote: "USDC" },
  ] as const

  const getPriorityIndex = (market: MarketParams) => {
    return PRIORITY_PAIRS.findIndex(
      (pair) =>
        market.base.symbol === pair.base && market.quote.symbol === pair.quote,
    )
  }

  const compareMarkets = (a: MarketParams, b: MarketParams) => {
    const aIndex = getPriorityIndex(a)
    const bIndex = getPriorityIndex(b)

    // Handle priority pairs
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1

    // Default lexicographical ordering
    return (
      a.base.symbol.localeCompare(b.base.symbol) ||
      a.quote.symbol.localeCompare(b.quote.symbol) ||
      a.tickSpacing.toString().localeCompare(b.tickSpacing.toString())
    )
  }

  const markets = rawMarkets?.sort(compareMarkets)

  const onValueChange = (value: string) => {
    const [baseAddress, quoteAddress, tickSpacing] = value.split("/")
    if (!baseAddress || !quoteAddress || !tickSpacing) return
    try {
      const market = markets?.find(
        (m) =>
          isAddressEqual(m.base.address, getAddress(baseAddress)) &&
          isAddressEqual(m.quote.address, getAddress(quoteAddress)) &&
          m.tickSpacing === BigInt(tickSpacing),
      )
      if (!market) return
      setMarket(market)
    } catch (e) {}
  }

  return (
    <Select
      value={
        currentMarket
          ? `${currentMarket.base.address}/${currentMarket.quote.address}/${currentMarket.tickSpacing}`
          : undefined
      }
      onValueChange={onValueChange}
      disabled={!markets?.length}
    >
      <SelectTrigger className="rounded-sm w-fit flex justify-between p-1.5 text-sm">
        <SelectValue
          placeholder={<Spinner className="h-6" />}
          suppressHydrationWarning
        >
          {isMobile ? (
            <div className="flex -space-x-2">
              {currentMarket && (
                <>
                  <TokenIcon
                    symbol={currentMarket.base.symbol}
                    imgClasses="rounded-full"
                  />
                  <TokenIcon
                    symbol={currentMarket.quote.symbol}
                    imgClasses="rounded-full"
                  />
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2 items-center">
                {currentMarket && (
                  <>
                    <TokenIcon
                      symbol={currentMarket.base.symbol}
                      imgClasses="rounded-full"
                    />
                    <TokenIcon
                      symbol={currentMarket.quote.symbol}
                      imgClasses="rounded-full"
                    />
                  </>
                )}
              </div>
              {!isMobile && getSymbol(currentMarket)}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {markets?.map((m) => (
          <SelectItem
            key={`${m.base.address}/${m.quote.address}/${m.tickSpacing}`}
            value={getValue(m)}
            className="text-sm"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <TokenIcon symbol={m.base.symbol} imgClasses="rounded-full" />
                <TokenIcon symbol={m.quote.symbol} imgClasses="rounded-full" />
              </div>

              {!isMobile && (
                <span className="group-data-[state=checked]:inline-block group-data-[highlighted]:inline-block">
                  {getSymbol(m)}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
