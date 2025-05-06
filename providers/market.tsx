"use client"

import React from "react"

import useLocalStorage from "@/hooks/use-local-storage"
import { useOpenMarkets } from "@/hooks/use-open-markets"
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
  const { openMarkets } = useOpenMarkets()
  const router = useRouter()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const marketParam = searchParams.get("market")
  const [persistedMarket, setPersistedMarket] = useLocalStorage<string | null>(
    "selected-market",
    null,
  )

  const currentMarket = React.useMemo(() => {
    if (!openMarkets) return undefined
    const params = persistedMarket ?? marketParam
    if (!params) return openMarkets[0]
    const [base, quote, tickSpacing] = params.split(",")
    if (!base || !quote || !tickSpacing) return openMarkets[0]

    try {
      const market = {
        base: getAddress(base),
        quote: getAddress(quote),
        tickSpacing: BigInt(tickSpacing),
      }

      const result = openMarkets.find(
        (m) =>
          isAddressEqual(market.base, m.base.address) &&
          isAddressEqual(market.quote, m.quote.address) &&
          market.tickSpacing === m.tickSpacing,
      )

      if (!result) {
        return openMarkets[0]
      } else {
        return result
      }
    } catch (e) {
      return openMarkets[0]
    }
  }, [openMarkets, marketParam])

  const setMarket = React.useCallback(
    (market: MarketParams) => {
      if (!openMarkets || isMarketEqual(market, currentMarket)) return
      const marketParam = `${market.base.address},${market.quote.address},${market.tickSpacing}`
      const params = new URLSearchParams(searchParams.toString())
      setPersistedMarket(marketParam)
      params.set("market", marketParam)
      router.push(`${pathName}?${params.toString()}`)
    },
    [currentMarket, searchParams, pathName, router],
  )

  React.useEffect(() => {
    if (!persistedMarket) return
    const [base, quote, tickSpacing] = persistedMarket.split(",")
    if (!base || !quote || !tickSpacing) return
    try {
      const market = openMarkets?.find(
        (m) =>
          isAddressEqual(m.base.address, getAddress(base)) &&
          isAddressEqual(m.quote.address, getAddress(quote)) &&
          m.tickSpacing === BigInt(tickSpacing),
      )
      if (!market) return
      setMarket(market)
    } catch (e) {
      console.error(e)
    }
  }, [])

  return {
    markets: openMarkets,
    currentMarket,
    setMarket,
  }
}

const MarketContext = React.createContext<
  ReturnType<typeof useMarketContext> | undefined
>(undefined)
MarketContext.displayName = "MarketContext"

// Add a context to allow for custom market overrides
const MarketOverrideContext = React.createContext<{
  overrideMarket?: MarketParams
  setOverrideMarket: (market?: MarketParams) => void
}>({
  overrideMarket: undefined,
  setOverrideMarket: () => {},
})
MarketOverrideContext.displayName = "MarketOverrideContext"

export function MarketProvider({ children }: React.PropsWithChildren) {
  const marketContext = useMarketContext()
  // Add state for market override
  const [overrideMarket, setOverrideMarket] = React.useState<
    MarketParams | undefined
  >(undefined)

  return (
    <MarketContext.Provider value={marketContext}>
      <MarketOverrideContext.Provider
        value={{ overrideMarket, setOverrideMarket }}
      >
        {children}
      </MarketOverrideContext.Provider>
    </MarketContext.Provider>
  )
}

const useMarket = () => {
  const marketCtx = React.useContext(MarketContext)
  const { overrideMarket } = React.useContext(MarketOverrideContext)

  if (!marketCtx) {
    throw new Error("useMarket must be used within the MarketContext.Provider")
  }

  // Return override market if it exists, otherwise use the context's current market
  return {
    ...marketCtx,
    currentMarket: overrideMarket || marketCtx.currentMarket,
  }
}

// Export a hook to set the override market (for use in the swap page)
export function useMarketOverride() {
  const { overrideMarket, setOverrideMarket } = React.useContext(
    MarketOverrideContext,
  )

  if (!setOverrideMarket) {
    throw new Error(
      "useMarketOverride must be used within the MarketContext.Provider",
    )
  }

  return { overrideMarket, setOverrideMarket }
}

export default useMarket
