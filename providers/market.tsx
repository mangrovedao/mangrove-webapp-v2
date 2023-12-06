"use client"

import type Mangrove from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useNetwork } from "wagmi"

import { marketInfoToMarketParams } from "@/utils/market"
import useMangrove from "./mangrove"

const useMarketContext = () => {
  const { chain } = useNetwork()
  const { mangrove, marketsInfoQuery } = useMangrove()
  const [marketInfo, setMarketInfo] = React.useState<Mangrove.OpenMarketInfo>()

  const { data: market } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["market", marketInfo?.base.symbol, marketInfo?.quote.symbol],
    queryFn: () => {
      if (!marketInfo) return
      return mangrove?.market(marketInfoToMarketParams(marketInfo))
    },
    enabled: !!marketInfo,
    refetchOnWindowFocus: false,
  })

  const requestBookQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["orderbook", market?.base.symbol, market?.quote.symbol],
    queryFn: () => {
      if (!market) return null
      return market.requestBook()
    },
    enabled: !!market,
    refetchOnWindowFocus: false,
  })

  // create and store market instance from marketInfo
  React.useEffect(() => {
    if (!(marketsInfoQuery.data?.length && chain?.id && mangrove)) return
    setMarketInfo(marketsInfoQuery.data[0])
  }, [chain?.id, mangrove, marketsInfoQuery.data])

  return {
    setMarketInfo,
    requestBookQuery,
    market,
    marketInfo,
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
