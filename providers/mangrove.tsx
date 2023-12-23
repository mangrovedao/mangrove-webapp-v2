"use client"

import Mangrove from "@mangrovedao/mangrove.js"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { useAccount, useNetwork } from "wagmi"

import { useWhitelistedMarketsInfos } from "@/hooks/use-whitelisted-markets-infos"
import { mangroveConfig } from "@/schemas/mangrove-config"
import { useEthersSigner } from "@/utils/adapters"
import { getErrorMessage } from "@/utils/errors"

const useMangroveContext = () => {
  const signer = useEthersSigner()
  const { chain } = useNetwork()
  const { isConnected } = useAccount()

  const mangroveQuery = useQuery({
    queryKey: ["mangroveInstance", signer?._address, chain?.id],
    queryFn: async () => {
      try {
        const mangrove = await Mangrove.connect({ signer })
        // overwrite the mangrove's configuration thanks to the mangroveConfig env variable
        mangrove.updateConfiguration(mangroveConfig)
        return mangrove
      } catch (e) {
        const message = getErrorMessage(e)
        console.error(message)
        throw new Error(message)
      }
    },
    enabled: !!signer?._address && !!isConnected && !chain?.unsupported,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 15 * 60 * 1000,
  })
  const { data: mangrove } = mangroveQuery

  const marketsInfoQuery = useWhitelistedMarketsInfos(mangrove)

  return { mangroveQuery, mangrove, marketsInfoQuery }
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
      "useMangrove must be used within the MangroveContext.Provider",
    )
  }
  return mangroveCtx
}

export default useMangrove
