"use client"

import React from "react"

import { useMarkets } from "@/hooks/use-addresses"
import { MarketParams } from "@mangrovedao/mgv"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getAddress, isAddressEqual } from "viem"

function isMarketEqual(market1?: MarketParams, market2?: MarketParams) {
  if (!market1 || !market2) return false
  return (
    isAddressEqual(market1.base.address, market2.base.address) &&
    isAddressEqual(market1.quote.address, market2.quote.address) &&
    market1.tickSpacing === market2.tickSpacing
  )
}

export function useMarketContext() {
  const markets = useMarkets()
  const router = useRouter()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const marketParam = searchParams.get("market")
  const currentMarket = React.useMemo(() => {
    if (!markets) return undefined
    if (!marketParam) return markets[0]
    const [base, quote, tickSpacing] = marketParam.split(",")

    if (!base || !quote || !tickSpacing) return
    try {
      const market = {
        base: getAddress(base),
        quote: getAddress(quote),
        tickSpacing: BigInt(tickSpacing),
      }
      const result = markets.find(
        (m) =>
          isAddressEqual(market.base, m.base.address) &&
          isAddressEqual(market.quote, m.quote.address) &&
          market.tickSpacing === m.tickSpacing,
      )
      if (!result) {
        return markets[0]
      } else {
        return result
      }
    } catch (e) {
      return markets[0]
    }
  }, [markets, marketParam])

  console.log(currentMarket)

  const setMarket = React.useCallback(
    (market: MarketParams) => {
      if (!markets || isMarketEqual(market, currentMarket)) return
      const marketParam = `${market.base.address},${market.quote.address},${market.tickSpacing}`
      const params = new URLSearchParams(searchParams.toString())
      params.set("market", marketParam)
      router.push(`${pathName}?${params.toString()}`)
    },
    [currentMarket, searchParams, pathName, router],
  )

  return {
    markets,
    currentMarket,
    setMarket,
  }
}

const MarketContext = React.createContext<
  ReturnType<typeof useMarketContext> | undefined
>(undefined)
MarketContext.displayName = "MarketContext"

export function MarketProvider({ children }: React.PropsWithChildren) {
  const marketContext = useMarketContext()
  return (
    <MarketContext.Provider value={marketContext}>
      {children}
    </MarketContext.Provider>
  )
}

const useMarket = () => {
  const marketCtx = React.useContext(MarketContext)
  if (!marketCtx) {
    throw new Error("useMarket must be used within the MarketContext.Provider")
  }
  return marketCtx
}

export default useMarket
