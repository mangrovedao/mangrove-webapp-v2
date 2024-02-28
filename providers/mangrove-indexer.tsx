"use client"

import { getSdk } from "@mangrovedao/indexer-sdk"
import type { ChainsIds } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React from "react"
import { useAccount } from "wagmi"

import { getTokenPriceInUsd } from "@/services/tokens.service"
import { TickPriceHelper } from "@mangrovedao/mangrove.js"
import useMangrove from "./mangrove"

const useIndexerSdkContext = () => {
  const { mangrove } = useMangrove()
  const { chain } = useAccount()
  const queryClient = useQueryClient()

  const indexerSdkQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["indexer-sdk", chain],
    queryFn: () => {
      try {
        if (!chain) return null

        console.log("Initializing indexer sdk for chain", chain.name)
        return getSdk({
          chainId: chain.id as ChainsIds,
          helpers: {
            getTokenDecimals: async (address) => {
              const token = await mangrove?.tokenFromAddress(address)
              if (!token)
                throw new Error("Impossible to determine token decimals")
              return token.decimals
            },
            createTickHelpers: async (ba, m) => {
              const base = await mangrove?.tokenFromAddress(m.base.address)
              const quote = await mangrove?.tokenFromAddress(m.quote.address)
              if (!(mangrove && base && quote)) {
                throw new Error("Impossible to determine market tokens")
              }

              const tickPriceHelper = new TickPriceHelper(ba, {
                base,
                quote,
                tickSpacing: m.tickSpacing,
              })

              return {
                priceFromTick(tick) {
                  return tickPriceHelper.priceFromTick(tick, "roundUp")
                },
                inboundFromOutbound(tick, outboundAmount, roundUp) {
                  return tickPriceHelper.inboundFromOutbound(
                    tick,
                    outboundAmount,
                    roundUp ? "roundUp" : "nearest",
                  )
                },
                outboundFromInbound(tick, inboundAmount, roundUp) {
                  return tickPriceHelper.outboundFromInbound(
                    tick,
                    inboundAmount,
                    roundUp ? "roundUp" : "nearest",
                  )
                },
              }
            },
            getPrice(tokenAddress) {
              return queryClient.fetchQuery({
                queryKey: ["tokenPriceInUsd", tokenAddress],
                queryFn: async () => {
                  const token = await mangrove?.tokenFromAddress(tokenAddress)
                  if (!token?.symbol)
                    throw new Error(
                      `Impossible to determine token from address: ${tokenAddress}`,
                    )
                  return getTokenPriceInUsd(token.symbol)
                },
                staleTime: 10 * 60 * 1000,
              })
            },
          },
        })
      } catch (error) {
        console.error("Error when initializing the indexer sdk", error)
      }
    },
    meta: {
      error: "Error when initializing the indexer sdk",
    },
    enabled: !!mangrove,
    staleTime: 15 * 60 * 1000,
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
