"use client"
import Big from "big.js"
import { useParams } from "next/navigation"
import React from "react"
import { Address } from "viem"
import { useAccount } from "wagmi"

import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import useStrategyStatus from "../../(shared)/_hooks/use-strategy-status"
import { useStrategy } from "../_hooks/use-strategy"
import { getMergedOffers } from "../_utils/inventory"

const useKandelStrategyContext = () => {
  const { chain } = useAccount()
  const params = useParams<{ address: string }>()
  const strategyQuery = useStrategy({
    strategyAddress: params.address,
  })

  const { data: baseToken } = useTokenFromAddress(
    strategyQuery.data?.base as Address,
  )
  const { data: quoteToken } = useTokenFromAddress(
    strategyQuery.data?.quote as Address,
  )

  const strategyStatusQuery = useStrategyStatus({
    address: params.address,
    base: strategyQuery.data?.base,
    quote: strategyQuery.data?.quote,
    offers: strategyQuery.data?.offers,
  })

  const mergedOffers = React.useMemo(() => {
    const indexerOffers = strategyQuery.data?.offers
    const sdkOffers = strategyStatusQuery.data?.offerStatuses
    const market = strategyStatusQuery.data?.market
    if (!(sdkOffers && indexerOffers && market)) return
    // @ts-expect-error TODO: it's an error type from the indexer SDK
    return getMergedOffers(sdkOffers, indexerOffers, market)
  }, [
    strategyQuery.dataUpdatedAt,
    strategyStatusQuery.dataUpdatedAt,
    strategyQuery.data?.offers,
    strategyStatusQuery.data?.offerStatuses,
    strategyStatusQuery.data?.market,
  ])

  const geometricKandelDistribution = React.useMemo(() => {
    if (!mergedOffers) return
    return {
      bids: mergedOffers?.length
        ? mergedOffers
            .filter((offer) => offer.offerType === "bids")
            .map((offer) => ({
              price: Big(offer.price ?? 0),
              gives: Big(offer.gives ?? 0),
              index: offer.index,
              tick: Number(offer.tick),
            }))
        : [],
      asks: mergedOffers?.length
        ? mergedOffers
            .filter((offer) => offer.offerType === "asks")
            .map((offer) => ({
              price: Big(offer.price ?? 0),
              gives: Big(offer.gives ?? 0),
              index: offer.index,
              tick: Number(offer.tick),
            }))
        : [],
    }
  }, [mergedOffers])

  return {
    strategyQuery,
    strategyAddress: params.address,
    baseToken,
    quoteToken,
    blockExplorerUrl: chain?.blockExplorers?.default.url,
    strategyStatusQuery,
    geometricKandelDistribution,
    mergedOffers,
  }
}

const KandelStrategyContext = React.createContext<
  ReturnType<typeof useKandelStrategyContext> | undefined
>(undefined)
KandelStrategyContext.displayName = "KandelStrategyContext"

export function KandelStrategyProvider({ children }: React.PropsWithChildren) {
  const kandelStrategyContext = useKandelStrategyContext()
  return (
    <KandelStrategyContext.Provider value={kandelStrategyContext}>
      {children}
    </KandelStrategyContext.Provider>
  )
}

const useKandel = () => {
  const kandelStrategyCtx = React.useContext(KandelStrategyContext)
  if (!kandelStrategyCtx) {
    throw new Error(
      "useKandel must be used within the KandelStrategyContext.Provider",
    )
  }
  return kandelStrategyCtx
}

export default useKandel
