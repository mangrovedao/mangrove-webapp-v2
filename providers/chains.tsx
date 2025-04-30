"use client"

import {
  bridgeableSynapseChainIds,
  getChainObjectById,
  mangroveCompatibleChainIds,
} from "@/utils/chains"
import { usePathname } from "next/navigation"
import React from "react"
import type { Chain } from "viem/chains"
import { useAccount } from "wagmi"

export const chainsConfig = {
  mangroveCompatibleChainIds,
  pages: [
    {
      path: "/bridge",
      chainIds: bridgeableSynapseChainIds,
    },
  ],
}

type IChainsContext = {
  chains?: Chain[]
  isChainCompatibleWithMangrove?: boolean
  isChainDialogOpen?: boolean
  setIsChainDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>
}
const ChainsContext = React.createContext<IChainsContext>({})

export const useChains = () => React.useContext(ChainsContext)

export const ChainsProvider = ({ children }: React.PropsWithChildren) => {
  const { chainId } = useAccount()
  const [isChainDialogOpen, setIsChainDialogOpen] = React.useState(false)
  const [chains, setChains] = React.useState<Chain[]>([])
  const [isChainCompatibleWithMangrove, setIsChainCompatibleWithMangrove] =
    React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    if (!chainId || !pathname) {
      return
    }

    setIsChainCompatibleWithMangrove(
      chainsConfig.mangroveCompatibleChainIds.includes(chainId),
    )
  }, [pathname, chainId])

  React.useEffect(() => {
    console.log("pathname", pathname)
    const pageConfig =
      pathname.length > 2
        ? chainsConfig.pages.filter((x) => x.path.includes(pathname))[0]
        : undefined

    if (pageConfig) {
      const chainObjects = pageConfig.chainIds
        .map((x) => getChainObjectById(x.toString()))
        .filter((x) => !!x)
      // @ts-ignore
      setChains(chainObjects)
      return
    }
    setChains(
      // @ts-ignore
      chainsConfig.mangroveCompatibleChainIds
        .map((x) => getChainObjectById(x.toString()))
        .filter((x) => !!x),
    )
  }, [pathname])

  return (
    <ChainsContext.Provider
      value={{
        chains,
        isChainCompatibleWithMangrove,
        isChainDialogOpen,
        setIsChainDialogOpen,
      }}
    >
      {children}
    </ChainsContext.Provider>
  )
}
