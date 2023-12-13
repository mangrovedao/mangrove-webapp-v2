"use client"

import { type TokenAndOlkey } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import React from "react"
import { useNetwork } from "wagmi"

import useMangrove from "./mangrove"

const useMarketContext = () => {
  const searchParams = useSearchParams()
  const marketParam = searchParams.get("market")
  const { chain } = useNetwork()
  const { mangrove, marketsInfoQuery } = useMangrove()

  const marketInfo = React.useMemo(() => {
    if (!(marketsInfoQuery.data?.length && chain?.id && mangrove)) return
    const [baseId, quoteId] = marketParam?.split(",") ?? []
    return (
      marketsInfoQuery.data.find((marketInfo) => {
        return (
          marketInfo.base.id?.toLowerCase() === baseId?.toLowerCase() &&
          marketInfo.quote.id?.toLowerCase() === quoteId?.toLowerCase()
        )
      }) ?? marketsInfoQuery.data[0]
    )
  }, [marketsInfoQuery.data, chain?.id, mangrove, marketParam])

  const { data: market } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["market", marketInfo?.base.symbol, marketInfo?.quote.symbol],
    queryFn: () => {
      if (!marketInfo) return
      return mangrove?.market(marketInfo)
    },
    enabled: !!marketInfo,
    refetchOnWindowFocus: false,
  })

  const requestBookQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["orderbook", market?.base.id, market?.quote.id],
    queryFn: () => {
      if (!market) return null
      return market.requestBook()
    },
    enabled: !!market,
    refetchOnWindowFocus: false,
  })

  const olKeys = React.useMemo(() => {
    if (!(mangrove && market)) return undefined
    const ask: TokenAndOlkey = {
      token: market.base,
      olKey: mangrove.calculateOLKeyHash(market.olKeyBaseQuote),
    }
    const bid: TokenAndOlkey = {
      token: market.quote,
      olKey: mangrove.calculateOLKeyHash(market.olKeyQuoteBase),
    }
    return {
      ask,
      bid,
    }
  }, [mangrove, market])

  const updateOrderbook = React.useCallback(() => {
    if (!market) return
    requestBookQuery.refetch()
  }, [market, requestBookQuery])

  // subscribe to market events and refresh the book
  React.useEffect(() => {
    if (!market) return
    market.subscribe(updateOrderbook)
    return () => {
      market.unsubscribe(updateOrderbook)
    }
  }, [market, updateOrderbook])

  return {
    requestBookQuery,
    market,
    marketInfo,
    olKeys,
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
