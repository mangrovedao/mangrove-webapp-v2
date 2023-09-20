"use client"

import Mangrove from "@mangrovedao/mangrove.js"
import React from "react"

import { useChangeNetworkDialogStore } from "@/stores/change-network-dialog.store"
import { useEthersSigner } from "@/utils/adapters"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount, useNetwork } from "wagmi"

const useMangroveContext = () => {
  const signer = useEthersSigner()
  const { close } = useWeb3Modal()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [mangrove, setMangrove] = React.useState<Mangrove | null>()
  const setChangeNetworkDialogOpened = useChangeNetworkDialogStore(
    (store) => store.setOpened,
  )

  React.useEffect(() => {
    if (chain?.unsupported) {
      setMangrove(null)
      setChangeNetworkDialogOpened(true)
    }
    if (!address || !signer) {
      setMangrove(null)
      return
    }
    ;(async () => {
      try {
        const mgv = await Mangrove.connect({ signer })
        setMangrove(mgv)

        return () => {
          mgv.disconnect()
        }
      } catch (e) {
        setChangeNetworkDialogOpened(true)
        // TODO: Try to show the global-error component instead
        // throw new Error(getErrorMessage(e))
      }
    })()
  }, [signer, chain?.unsupported, address, setChangeNetworkDialogOpened])

  // Close web3modal after changing chain
  React.useEffect(() => {
    if (chain?.id) close()
  }, [chain?.id, close])

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
