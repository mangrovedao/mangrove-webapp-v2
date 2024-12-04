"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { arbitrum, baseSepolia, blast } from "viem/chains"
import { WagmiProvider, http } from "wagmi"

import { env } from "@/env.mjs"
import { getWhitelistedChainObjects } from "@/utils/chains"

const queryClient = new QueryClient()
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

const productionTransports = {
  [blast.id]: http(),
  [arbitrum.id]: http(),
}
const developmentTransports = {
  [baseSepolia.id]: http(),
  [blast.id]: http(),
  [arbitrum.id]: http(),
}

export const config = getDefaultConfig({
  appName: "Mangrove dApp",
  projectId,
  // @ts-ignore
  chains: getWhitelistedChainObjects(),
  ssr: true,
  transports:
    process.env.NODE_ENV !== "development"
      ? productionTransports
      : developmentTransports,
})

export function WalletConnectProvider({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
