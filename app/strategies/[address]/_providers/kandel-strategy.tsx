"use client"
import { useParams } from "next/navigation"
import React from "react"
import { Address } from "viem"
import { useNetwork } from "wagmi"

import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import useMarket from "@/providers/market"
import useStrategyStatus from "../../(shared)/_hooks/use-strategy-status"
import { useStrategy } from "../_hooks/use-strategy"

const useKandelStrategyContext = () => {
  const { getMarketFromAddresses } = useMarket()
  const { chain } = useNetwork()
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

  return {
    strategyQuery,
    strategyAddress: params.address,
    baseToken,
    quoteToken,
    blockExplorerUrl: chain?.blockExplorers?.default.url,
    strategyStatusQuery,
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
