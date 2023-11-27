"use client"

import Mangrove from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import React from "react"
import { useAccount, useNetwork } from "wagmi"

import { mangroveConfig } from "@/schemas/mangrove-config"
import { getWhitelistedMarkets } from "@/services/markets.service"
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
        const mangrove = await Mangrove.connect({ signer })
        // overwrite the mangrove's configuration thanks to the mangroveConfig env variable
        mangrove.updateConfiguration(mangroveConfig)
        return mangrove
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

  const marketsQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ["whitelistedMarkets", mangrove?.address, chain?.id],
    queryFn: async () => {
      if (!mangrove?.address || !chain?.id) return null
      return getWhitelistedMarkets(mangrove, chain.id)
    },
    enabled: !!(mangrove?.address && chain?.id),
    refetchOnWindowFocus: false,
  })

  // Close web3modal after changing chain
  React.useEffect(() => {
    if (chain?.id) close()
  }, [chain?.id, close])

  // Close wrong network alert dialog after connecting to the right network
  React.useEffect(() => {
    if (!chain?.unsupported) {
      networkService.closeWrongNetworkAlertDialog()
    }
  }, [chain?.unsupported])

  return { mangrove, marketsQuery }
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
