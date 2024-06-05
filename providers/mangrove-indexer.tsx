"use client"

import { getSdk } from "@mangrovedao/indexer-sdk"
import type { ChainsIds } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React from "react"
import { useAccount } from "wagmi"

import { getTokenPriceInUsd } from "@/services/tokens.service"
import Big from "big.js"
import useMangrove from "./mangrove"

const useIndexerSdkContext = () => {
  const { mangrove } = useMangrove()
  const { chain } = useAccount()
  const queryClient = useQueryClient()

  const indexerSdkQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["indexer-sdk", chain?.id],
    queryFn: () => {
      try {
        if (!chain) return null

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
              const outbound = ba === "asks" ? m.base : m.quote
              const inbound = ba === "asks" ? m.quote : m.base

              const rawPriceFromTick = (tick: number) => 1.0001 ** tick

              return {
                priceFromTick(tick) {
                  const rawPrice = rawPriceFromTick(tick)
                  const decimalsScaling = Big(10).pow(
                    m.base.decimals - m.quote.decimals,
                  )
                  if (ba === "bids") {
                    return decimalsScaling.div(rawPrice)
                  }
                  return decimalsScaling.mul(rawPrice)
                },
                inboundFromOutbound(tick, outboundAmount, roundUp) {
                  const rawOutbound = Big(10)
                    .pow(outbound.decimals)
                    .mul(outboundAmount)
                  const price = rawPriceFromTick(tick)
                  const rawInbound = rawOutbound
                    .mul(price)
                    .round(0, roundUp ? 3 : 0)
                  return rawInbound.div(Big(10).pow(inbound.decimals))
                },
                outboundFromInbound(tick, inboundAmount, roundUp) {
                  const rawInbound = Big(10)
                    .pow(inbound.decimals)
                    .mul(inboundAmount)
                  const price = rawPriceFromTick(tick)
                  const rawOutbound = rawInbound
                    .div(price)
                    .round(0, roundUp ? 3 : 0)
                  return rawOutbound.div(Big(10).pow(outbound.decimals))
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
                  return getTokenPriceInUsd(
                    token.symbol === "USDB" ? "USDC" : token.symbol,
                    true, // return 1 if the price API fails
                  )
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
    enabled: !!mangrove && !!chain?.id,
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
