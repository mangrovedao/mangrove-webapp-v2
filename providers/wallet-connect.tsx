"use client"

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"

import { env } from "@/env.mjs"
import { WagmiConfig } from "wagmi"
import { arbitrum, mainnet } from "wagmi/chains"

// 1. Get projectId
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

// 2. Create wagmiConfig
const chains = [mainnet, arbitrum]
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: "Mangrove DEX",
})

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

export default function WalletConnectProvider({
  children,
}: React.PropsWithChildren) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
}
