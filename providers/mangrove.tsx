"use client"

import Mangrove from "@mangrovedao/mangrove.js"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import React from "react"
import { useAccount, useNetwork } from "wagmi"

import { networkService } from "@/services/network.service"
import { useEthersSigner } from "@/utils/adapters"
import { getErrorMessage } from "@/utils/errors"

const useMangroveContext = () => {
  const signer = useEthersSigner()
  const { close } = useWeb3Modal()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [mangrove, setMangrove] = React.useState<Mangrove | null>()

  React.useEffect(() => {
    if (chain?.unsupported) {
      setMangrove(null)
      networkService.openWrongNetworkAlertDialog()
      return
    }
    if (!address || !signer) {
      setMangrove(null)
      return
    }
    ;(async () => {
      try {
        networkService.close()
        const mgv = await Mangrove.connect({ signer })
        setMangrove(mgv)

        return () => {
          mgv.disconnect()
        }
      } catch (e) {
        networkService.openWrongNetworkAlertDialog({
          title: "Error connecting to Mangrove",
          children: getErrorMessage(e),
        })
        console.error(getErrorMessage(e))
      }
    })()
  }, [signer, chain?.unsupported, address])

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
