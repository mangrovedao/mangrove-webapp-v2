"use client"

import { getSdk } from "@mangrovedao/indexer-sdk"
import type { Chains } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import { TickPriceHelper } from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useNetwork } from "wagmi"
import useMangrove from "./mangrove"

const useIndexerSdkContext = () => {
  const { marketsInfoQuery } = useMangrove()
  const { chain } = useNetwork()

  const indexerSdkQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["indexer-sdk", chain?.network, marketsInfoQuery.dataUpdatedAt],
    queryFn: () => {
      if (!(chain?.network && marketsInfoQuery.data)) return null
      const chainName = chain.network as Chains
      return getSdk({
        chainName,
        helpers: {
          getTokenDecimals: (address) => {
            const marketInfo = marketsInfoQuery?.data?.find(
              (t) =>
                t.base.address.toLowerCase() === address.toLowerCase() ||
                t.quote.address.toLowerCase() === address.toLowerCase(),
            )
            const tokens = [marketInfo?.base, marketInfo?.quote]
            const token = tokens.find(
              (t) => t?.address.toLowerCase() === address.toLowerCase(),
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
