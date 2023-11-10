"use client"

import type { Market } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useNetwork } from "wagmi"
import useMangrove from "./mangrove"

const useMarketContext = () => {
  const { chain } = useNetwork()
  const { marketsQuery } = useMangrove()
  const [selectedMarket, setSelectedMarket] = React.useState<
    Market | undefined
  >()

  const requestBookQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "orderbook",
      selectedMarket?.base.address,
      selectedMarket?.quote.address,
    ],
    queryFn: () => {
      if (!selectedMarket) return null
      return selectedMarket.requestBook()
    },
    enabled: !!(selectedMarket?.base.address && selectedMarket?.quote.address),
  })

  React.useEffect(() => {
    if (!(marketsQuery.data?.length && chain?.id)) return
    setSelectedMarket(marketsQuery.data[0])
  }, [chain?.id, marketsQuery.data])

  return { selectedMarket, setSelectedMarket, requestBookQuery }
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
