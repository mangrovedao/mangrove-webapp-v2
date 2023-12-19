"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit"
import { WagmiConfig, configureChains, createConfig } from "wagmi"
import { publicProvider } from "wagmi/providers/public"

import { env } from "@/env.mjs"
import { getWhitelistedChainObjects } from "@/utils/chains"

const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
const { chains, publicClient } = configureChains(getWhitelistedChainObjects(), [
  publicProvider(),
])

const { connectors } = getDefaultWallets({
  appName: "Mangrove DEX",
  projectId,
  chains,
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider theme={darkTheme()} chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
