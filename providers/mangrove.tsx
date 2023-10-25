"use client"

import Mangrove from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
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

  const { data: mangrove } = useQuery({
    queryKey: [
      "mangroveInstance",
      signer?._address,
      address,
      chain?.id,
      chain?.unsupported,
    ],
    queryFn: async () => {
      if (chain?.unsupported) {
        networkService.openWrongNetworkAlertDialog()
        return null
      }
      try {
        return Mangrove.connect({ signer })
      } catch (e) {
        const message = getErrorMessage(e)
        networkService.openWrongNetworkAlertDialog({
          title: "Error connecting to Mangrove",
          children: message,
        })
        console.error(message)
      }
    },
    enabled: !!signer?._address && !!address,
  })

  const configs = useQuery({
    queryKey: ["configs", mangrove?.address],
    queryFn: () => Promise.all([mangrove?.config(), mangrove?.openMarkets()]),
    enabled: !!mangrove?.address,
  })
  const [globalConfig, openMarkets] = configs.data ?? [null, null]

  // Close web3modal after changing chain
  React.useEffect(() => {
    if (chain?.id) close()
  }, [chain?.id, close])

  return { mangrove, globalConfig, openMarkets }
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
