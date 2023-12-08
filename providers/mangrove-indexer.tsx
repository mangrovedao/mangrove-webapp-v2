"use client"

import { getSdk } from "@mangrovedao/indexer-sdk"
import type { Chains } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import { TickPriceHelper } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useNetwork } from "wagmi"
import useMarket from "./market"

const useIndexerSdkContext = () => {
  const { chain } = useNetwork()
  const { market } = useMarket()

  const indexerSdkQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "indexer-sdk",
      chain?.network,
      market?.base.address,
      market?.quote.address,
    ],
    queryFn: () => {
      if (!(chain?.network && market)) return null
      const chainName = chain.network as Chains
      return getSdk({
        chainName,
        helpers: {
          getTokenDecimals: (address) => {
            const tokens = [market.base, market.quote]
            const token = tokens.find(
              (t) => t.address.toLowerCase() === address.toLowerCase(),
            )
            if (!token)
              throw new Error("Impossible to determine token decimals")
            return Promise.resolve(token.decimals)
          },
          createTickHelpers: (ba, market) => new TickPriceHelper(ba, market),
        },
      })
    },
    meta: {
      error: "Error when initializing the indexer sdk",
    },
  })
  return {
    indexerSdkQuery,
    indexerSdk: indexerSdkQuery.data,
  }
}

const IndexerSdkContext = React.createContext<
  ReturnType<typeof useIndexerSdkContext> | undefined
>(undefined)
IndexerSdkContext.displayName = "IndexerSdkContext"

export function IndexerSdkProvider({ children }: React.PropsWithChildren) {
  const indexerSdkContext = useIndexerSdkContext()
  return (
    <IndexerSdkContext.Provider value={indexerSdkContext}>
      {children}
    </IndexerSdkContext.Provider>
  )
}

const useIndexerSdk = () => {
  const indexerSdkCtx = React.useContext(IndexerSdkContext)
  if (!indexerSdkCtx) {
    throw new Error(
      "useIndexerSdk must be used within the IndexerSdkContext.Provider",
    )
  }
  return indexerSdkCtx
}

export default useIndexerSdk
