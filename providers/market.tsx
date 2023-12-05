"use client"

import type Mangrove from "@mangrovedao/mangrove.js"
import type { Market } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useNetwork } from "wagmi"

import { marketInfoToMarketParams } from "@/utils/market"
import useMangrove from "./mangrove"

const useMarketContext = () => {
  const { chain } = useNetwork()
  const { mangrove, marketsInfoQuery } = useMangrove()
  const [market, setMarket] = React.useState<Market | undefined>()

  const selectMarketFromMarketInfo = React.useCallback(
    async (marketInfo?: Mangrove.OpenMarketInfo) => {
      if (!marketInfo) return
      const market = await mangrove?.market(
        marketInfoToMarketParams(marketInfo),
      )
      setMarket(market)
    },
    [mangrove],
  )

  const requestBookQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["orderbook", market?.base.symbol, market?.quote.symbol],
    queryFn: () => {
      if (!market) return null
      return market.requestBook()
    },
    enabled: !!market,
  })

  // create and store market instance from marketInfo
  React.useEffect(() => {
    if (!(marketsInfoQuery.data?.length && chain?.id && mangrove)) return
    selectMarketFromMarketInfo(marketsInfoQuery.data[0])
  }, [chain?.id, mangrove, marketsInfoQuery.data, selectMarketFromMarketInfo])

  return {
    selectMarketFromMarketInfo,
    requestBookQuery,
    market,
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
  const mangroveCtx = React.useContext(MarketContext)
  if (!mangroveCtx) {
    throw new Error(
      "mangroveCtx must be used within the MarketContext.Provider",
    )
  }
  return mangroveCtx
}

export default useMarket
