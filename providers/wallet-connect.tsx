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
  metadata: {
    name: "Mangrove DEX",
  },
})

export const web3modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: "dark",
  themeVariables: {
    "--w3m-border-radius-master": "4px",
    "--w3m-font-family": "Inter, sans-serif",
    "--w3m-z-index": 1000,
  },
})

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
}
