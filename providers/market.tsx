"use client"

import React from "react"

const useMarketContext = () => {
  // const searchParams = useSearchParams()
  // const marketParam = searchParams.get("market")
  // const { chain } = useAccount()
  // const [currentMarket, setCurrentMarket] = React.useState<string>()
  // const marketInfo = React.useMemo(() => {
  //   if (!(marketsInfoQuery.data?.length && chain?.id && mangrove)) return
  //   // Use currentMarket if no marketParam is provided
  //   if (!marketParam && currentMarket) {
  //     const [baseId, quoteId] = currentMarket.split(",")
  //     return marketsInfoQuery.data.find((marketInfo) => {
  //       return (
  //         marketInfo.base.id?.toLowerCase() === baseId?.toLowerCase() &&
  //         marketInfo.quote.id?.toLowerCase() === quoteId?.toLowerCase()
  //       )
  //     })
  //   }
  //   // Use marketParam to fetch market data
  //   const [baseId, quoteId] = marketParam?.split(",") ?? []
  //   return (
  //     marketsInfoQuery.data.find((marketInfo) => {
  //       return (
  //         marketInfo.base.id?.toLowerCase() === baseId?.toLowerCase() &&
  //         marketInfo.quote.id?.toLowerCase() === quoteId?.toLowerCase()
  //       )
  //     }) ?? marketsInfoQuery.data[0]
  //   )
  // }, [marketsInfoQuery.data, chain?.id, mangrove, marketParam])
  // const { data: market } = useQuery({
  //   // eslint-disable-next-line @tanstack/query/exhaustive-deps
  //   queryKey: ["market", marketInfo?.base.symbol, marketInfo?.quote.symbol],
  //   queryFn: () => {
  //     if (!marketInfo) return
  //     return mangrove?.market(marketInfo)
  //   },
  //   enabled: !!marketInfo,
  //   refetchOnWindowFocus: false,
  //   staleTime: 15 * 60 * 1000,
  // })
  // const requestBookQuery = useQuery({
  //   // eslint-disable-next-line @tanstack/query/exhaustive-deps
  //   queryKey: ["orderbook", market?.base.id, market?.quote.id],
  //   queryFn: () => {
  //     if (!market) return null
  //     return market.requestBook()
  //   },
  //   enabled: !!market,
  //   refetchOnWindowFocus: false,
  // })
  // const olKeys = React.useMemo(() => {
  //   if (!(mangrove && market)) return undefined
  //   const ask: TokenAndOlkey = {
  //     token: market.base,
  //     olKey: mangrove.calculateOLKeyHash(market.olKeyBaseQuote),
  //   }
  //   const bid: TokenAndOlkey = {
  //     token: market.quote,
  //     olKey: mangrove.calculateOLKeyHash(market.olKeyQuoteBase),
  //   }
  //   return {
  //     ask,
  //     bid,
  //   }
  // }, [mangrove, market])
  // const midPrice = React.useMemo(() => {
  //   if (requestBookQuery.data) {
  //     return calculateMidPriceFromOrderBook(requestBookQuery.data)
  //   }
  // }, [requestBookQuery.data])
  // const riskAppetite = React.useMemo(() => {
  //   if (!marketInfo) return
  //   return getRiskAppetite(marketInfo.base.id, marketInfo.quote.id)
  // }, [marketInfo])
  // // Get mid price only if there is no liquidity in the book
  // const midPriceQuery = useQuery({
  //   queryKey: ["midPrice", market?.base.symbol, market?.quote.symbol],
  //   queryFn: () => {
  //     if (!market?.base.symbol || !market?.quote.symbol) return undefined
  //     return getTokenPriceInToken(market.base.symbol, market.quote.symbol, "1m")
  //   },
  //   enabled:
  //     requestBookQuery.status === "success" &&
  //     !midPrice &&
  //     !!market?.base.symbol &&
  //     !!market?.quote.symbol,
  //   select: (data) => data?.close,
  // })
  // const updateOrderbook = React.useCallback(() => {
  //   if (!market) return
  //   requestBookQuery.refetch()
  // }, [market, requestBookQuery])
  // // subscribe to market events and refresh the book
  // React.useEffect(() => {
  //   if (!market) return
  //   market.subscribe(updateOrderbook)
  //   return () => {
  //     market.unsubscribe(updateOrderbook)
  //   }
  // }, [market, updateOrderbook])
  // function getMarketFromAddresses(base: string, quote: string) {
  //   if (!(marketsInfoQuery.data?.length && chain?.id && mangrove)) return
  //   const marketInfo = marketsInfoQuery.data.find((marketInfo) => {
  //     return (
  //       marketInfo.base.address?.toLowerCase() === base?.toLowerCase() &&
  //       marketInfo.quote.address?.toLowerCase() === quote?.toLowerCase()
  //     )
  //   })
  //   if (!marketInfo) return
  //   return mangrove.market(marketInfo)
  // }
  // return {
  //   requestBookQuery,
  //   market,
  //   marketInfo,
  //   olKeys,
  //   midPrice: midPrice ?? midPriceQuery.data,
  //   riskAppetite,
  //   setCurrentMarket,
  //   getMarketFromAddresses,
  // }
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
