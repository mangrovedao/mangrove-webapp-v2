/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client"

import { networkService } from "@/services/network.service"
import { getErrorMessage } from "@/utils/errors"
import Mangrove, { type Market } from "@mangrovedao/mangrove.js"
// import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useSDK } from "@metamask/sdk-react"
import React from "react"

// enableLogging()

const useMangroveContext = () => {
  // const signer = useEthersSigner()
  // const { close } = useWeb3Modal()
  const { provider, chainId, account, sdk } = useSDK()
  // const { chain } = useNetwork()
  // const { address } = useAccount()
  const [mangrove, setMangrove] = React.useState<Mangrove | null>()
  const [globalConfig, setGlobalConfig] =
    React.useState<Mangrove.GlobalConfig | null>(null)
  const [openMarkets, setOpenMarkets] = React.useState<Market[] | null>(null)

  React.useEffect(() => {
    console.log({
      account,
      provider,
      chainId,
    })
  }, [account, provider, chainId])

  React.useEffect(() => {
    // if (chain?.unsupported) {
    //   setMangrove(null)
    //   networkService.openWrongNetworkAlertDialog()
    //   return
    // }
    if (!account || !provider) {
      setMangrove(null)
      return
    }
    ;(async () => {
      try {
        networkService.closeWrongNetworkAlertDialog()
        // @ts-ignore
        const mgv = await Mangrove.connect({ provider: provider })
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
  }, [account, provider, chainId])

  React.useEffect(() => {
    if (!mangrove) return
    ;(async () => {
      try {
        console.log("START: getconfig and openmarkets")
        const [conf, openMarkets] = await Promise.all([
          mangrove.config(),
          mangrove.openMarkets(),
        ])

        console.log("END: getconfig and openmarkets", { conf, openMarkets })
        setGlobalConfig(conf)
        setOpenMarkets(openMarkets)
      } catch (e) {
        console.error(getErrorMessage(e))
        setGlobalConfig(null)
        setOpenMarkets(null)
      }
    })()
  }, [mangrove])

  // Close web3modal after changing chain
  // React.useEffect(() => {
  //   if (chain?.id) close()
  // }, [chain?.id, close])

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
