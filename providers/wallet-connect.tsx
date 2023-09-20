"use client"

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"
import { WagmiConfig } from "wagmi"

import { env } from "@/env.mjs"
import { getWhitelistedChainObjects } from "@/utils/chains"

const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
const chains = getWhitelistedChainObjects()
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: "Mangrove DEX",
})

export const web3modal = createWeb3Modal({ wagmiConfig, projectId, chains })

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
}
