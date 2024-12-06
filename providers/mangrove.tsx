"use client"

import React from "react"

const useMangroveContext = () => {}

const MangroveContext = React.createContext<
  ReturnType<typeof useMangroveContext> | undefined
>(undefined)
MangroveContext.displayName = "MangroveContext"

export function MangroveProvider({ children }: React.PropsWithChildren) {
  const mangroveContext = useMangroveContext()
  return (
    <MangroveContext.Provider value={mangroveContext}>
      {children}
    </MangroveContext.Provider>
  )
}

const useMangrove = () => {
  const mangroveCtx = React.useContext(MangroveContext)
  if (!mangroveCtx) {
    throw new Error(
      "useMangrove must be used within the MangroveContext.Provider",
    )
  }
  return mangroveCtx
}

export default useMangrove
