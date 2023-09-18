"use client"

import React from "react"
// import Mangrove from "@mangrovedao/mangrove.js";
import Mangrove from "louis-mangrove-mangrove.js"

import { useEthersProvider, useEthersSigner } from "@/utils/adapters"

const useMangroveContext = () => {
  const signer = useEthersSigner()
  const provider = useEthersProvider()
  const [mangrove, setMangrove] = React.useState<Mangrove>()

  React.useEffect(() => {
    if (!signer || !provider) return
    ;(async () => {
      const mangrove = await Mangrove.connect({ signer, provider })
      setMangrove(mangrove)

      return () => {
        mangrove.disconnect()
      }
    })()
  }, [signer, provider])

  return { mangrove }
}

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
      "mangroveCtx must be used within the MangroveContext.Provider",
    )
  }
  return mangroveCtx
}

export default useMangrove
