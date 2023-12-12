"use client"

import type Mangrove from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { StringParam, useQueryParam } from "use-query-params"
import { useAccount, useNetwork } from "wagmi"

import { marketInfoToMarketParams } from "@/utils/market"
import { type TokenAndOlkey } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import useMangrove from "./mangrove"

const useMarketContext = () => {
  const [marketParam, setMarketParam] = useQueryParam("market", StringParam)
  const { chain } = useNetwork()
  const { address } = useAccount()
  const { mangrove, marketsInfoQuery } = useMangrove()
  const [marketInfo, setMarketInfo] = React.useState<Mangrove.OpenMarketInfo>()

  const { data: market } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["market", marketInfo?.base.symbol, marketInfo?.quote.symbol],
    queryFn: () => {
      if (!marketInfo) return
      // FIXME: No need to transform marketInfo here, it is already a Market.Key by definition
      return mangrove?.market(marketInfoToMarketParams(marketInfo))
    },
    enabled: !!marketInfo,
    refetchOnWindowFocus: false,
  })

  const requestBookQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    // FIXME: This should probably not use token symbols but token IDs
    queryKey: ["orderbook", market?.base.symbol, market?.quote.symbol],
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

  // create and store market instance from marketInfo
  React.useEffect(() => {
    if (!(marketsInfoQuery.data?.length && chain?.id && mangrove)) return
    // FIXME: Why symbol and not ID here?
    const [baseSymbol, quoteSymbol] = marketParam?.split(",") ?? []
    const defaultMarketInfo =
      marketsInfoQuery.data.find((marketInfo) => {
        return (
          marketInfo.base.symbol?.toLowerCase() === baseSymbol?.toLowerCase() &&
          marketInfo.quote.symbol?.toLowerCase() === quoteSymbol?.toLowerCase()
        )
      }) ?? marketsInfoQuery.data[0]
    setMarketInfo(defaultMarketInfo)
  }, [chain?.id, mangrove, marketParam, marketsInfoQuery.data])

  React.useEffect(() => {
    if (!marketInfo) return
    // FIXME: Why symbol and not ID here?
    setMarketParam(`${marketInfo.base.symbol},${marketInfo.quote.symbol}`)
  }, [marketInfo, setMarketParam])

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
    setMarketInfo,
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
