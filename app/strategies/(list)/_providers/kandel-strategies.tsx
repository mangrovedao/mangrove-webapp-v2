"use client"
import React from "react"

import useMarket from "../../../../providers/market.new"

const useKandelStrategiesContext = () => {
  // const { mangrove } = useMangrove()
  const { currentMarket: market } = useMarket()

  // const kandelStrategies = React.useMemo(() => {
  //   if (!mangrove) return
  //   return new KandelStrategies(mangrove)
  // }, [mangrove])

  // const generator = React.useMemo(() => {
  //   if (!kandelStrategies || !market) return
  //   return kandelStrategies.generator(market)
  // }, [kandelStrategies, market])

  // const config = React.useMemo(() => {
  //   if (!kandelStrategies || !market) return
  //   return kandelStrategies.configuration.getConfig(market)
  // }, [kandelStrategies, market])

  return {
    // kandelStrategies,
    // generator,
    // config,
  }
}

const KandelStrategiesContext = React.createContext<
  ReturnType<typeof useKandelStrategiesContext> | undefined
>(undefined)
KandelStrategiesContext.displayName = "KandelStrategiesContext"

export function KandelStrategiesProvider({
  children,
}: React.PropsWithChildren) {
  const kandelStrategiesContext = useKandelStrategiesContext()
  return (
    <KandelStrategiesContext.Provider value={kandelStrategiesContext}>
      {children}
    </KandelStrategiesContext.Provider>
  )
}

const useKandel = () => {
  const kandelStrategiesCtx = React.useContext(KandelStrategiesContext)
  if (!kandelStrategiesCtx) {
    throw new Error(
      "useKandel must be used within the KandelStrategiesContext.Provider",
    )
  }
  return kandelStrategiesCtx
}

export default useKandel
