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
  return `${market.base.symbol}/${market.quote.symbol}`
}

function getValue(market: MarketParams) {
  return `${market.base.address}/${market.quote.address}/${market.tickSpacing}`
}

export default function MarketSelector() {
  const { markets, currentMarket, setMarket } = useMarket()
  const isMobile = useMediaQuery("(max-width: 768px)")

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
