"use client"
import { useParams } from "next/navigation"
import React from "react"
import { useStrategy } from "../_hooks/use-strategy"

const useKandelStrategyContext = () => {
  const params = useParams<{ address: string }>()
  const strategyQuery = useStrategy({
    strategyAddress: params.address,
  })

  return {
    strategyQuery,
    strategyAddress: params.address,
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
