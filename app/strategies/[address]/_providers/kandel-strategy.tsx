"use client"
import { useParams } from "next/navigation"
import React from "react"
import { Address } from "viem"

import { useTokenFromAddress } from "@/hooks/use-token-from-address"
import { useStrategy } from "../_hooks/use-strategy"

const useKandelStrategyContext = () => {
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

  return {
    strategyQuery,
    strategyAddress: params.address,
    baseToken,
    quoteToken,
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
