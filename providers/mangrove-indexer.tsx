"use client"

import { getSdk } from "@mangrovedao/indexer-sdk"
import type { ChainsIds } from "@mangrovedao/indexer-sdk/dist/src/types/types"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import React from "react"
import { arbitrum } from "viem/chains"
import { useAccount } from "wagmi"

import { useTokens } from "@/hooks/use-addresses"
import { getTokenPrice } from "@/hooks/use-token-price"

const useIndexerSdkContext = () => {
  const { chain } = useAccount()
  const tokens = useTokens()
  const chainId = chain?.id || arbitrum.id

  const indexerSdkQuery = useQuery({
    queryKey: ["indexer-sdk", chainId],
    queryFn: () => {
      try {
        if (!chainId) return null

        return getSdk({
          chainId: chainId as ChainsIds,
          helpers: {
            getTokenDecimals: async (address) => {
              if (!tokens)
                throw new Error("Impossible to determine token decimals")
              const token = tokens.find((item) => item.address == address)
              return token?.decimals || 18
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
            getPrice: async (tokenAddress) => {
              return await getTokenPrice(tokenAddress, chainId)
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
    enabled: !!chainId,
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
