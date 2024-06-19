"use client"
import { useParams } from "next/navigation"
import React from "react"
import { Address, formatUnits } from "viem"
import { useAccount } from "wagmi"

import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { BA } from "@mangrovedao/mgv/lib"
import useStrategyStatus from "../../(shared)/_hooks/use-strategy-status"
import { useStrategy } from "../_hooks/use-strategy"

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
  const { kandelState } = strategyStatusQuery.data ?? {}

  const offers = [...(kandelState?.asks || []), ...(kandelState?.bids || [])]

  const filteredOffers = offers.filter((offer) => offer.gives > 0)
  const formattedOffers = filteredOffers.map((item) => {
    return {
      ...item,
      formattedGives: formatUnits(
        item.gives,
        (item.ba === BA.asks ? baseToken?.decimals : quoteToken?.decimals) ||
          18,
      ),
    }
  })

  return {
    strategyQuery,
    kandelState,
    strategyAddress: params.address,
    baseToken,
    quoteToken,
    blockExplorerUrl: chain?.blockExplorers?.default.url,
    strategyStatusQuery,
    mergedOffers: formattedOffers,
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
