"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, http } from "wagmi"
import { arbitrum, blastSepolia, polygon, polygonMumbai } from "wagmi/chains"

import { env } from "@/env.mjs"

const queryClient = new QueryClient()
const projectId = env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

const config = getDefaultConfig({
  appName: "Mangrove dApp",
  projectId,
  chains: [blastSepolia, polygon, polygonMumbai, arbitrum],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
    [blastSepolia.id]: http(),
    [arbitrum.id]: http(),
  },
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
