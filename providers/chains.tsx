"use client"

import { bridgeableSynapseChainIds, getChainObjectById } from "@/utils/chains"
import { usePathname } from "next/navigation"
import React from "react"
import type { Chain } from "viem/chains"
import * as viemChains from "viem/chains"
import { useChainId } from "wagmi"

export const chainsConfig = {
  mangroveCompatibleChainIds: [
    viemChains.blast.id,
    viemChains.baseSepolia.id,
  ] as number[],
  pages: [
    {
      path: "/bridge",
      chainIds: bridgeableSynapseChainIds,
    },
  ],
}

type IChainsContext = {
  chains: Chain[]
  isChainCompatibleWithMangrove?: boolean
  isChainDialogOpen?: boolean
  setIsChainDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>
}
const ChainsContext = React.createContext<IChainsContext>({
  chains: [],
})

export const useChains = () => React.useContext(ChainsContext)

export const ChainsProvider = ({ children }: React.PropsWithChildren) => {
  const chainId = useChainId()
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
    const pageConfig = chainsConfig.pages.filter((x) =>
      x.path.includes(pathname),
    )[0]

    if (pageConfig) {
      const chainObjects = pageConfig.chainIds
        .map((x) => getChainObjectById(x.toString()))
        .filter((x) => !!x)
      setChains(chainObjects)
      return
    }

    setChains(
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
